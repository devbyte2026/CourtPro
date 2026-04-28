import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseServer } from "@/lib/db/supabase-server";
import { requireAuth } from "@/lib/auth-helpers";
import { requireTenantOwner } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId requerido" }, { status: 400 });
  }

  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  await requireTenantOwner(tenantId);
  const supabase = await createSupabaseServer();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, name, subdomain, custom_domain, domain_verified_at, domain_verification_token")
    .eq("id", tenantId)
    .single();

  if (error || !tenant) {
    return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    customDomain: tenant.custom_domain,
    subdomain: tenant.subdomain,
    domainVerifiedAt: tenant.domain_verified_at,
    verificationToken: tenant.domain_verification_token,
    instructions: tenant.custom_domain
      ? getVerificationInstructions(tenant.custom_domain, tenant.domain_verification_token || "")
      : null,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenantId, action } = body;

  if (!tenantId || !action) {
    return NextResponse.json({ error: "tenantId y action requeridos" }, { status: 400 });
  }

  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  await requireTenantOwner(tenantId);
  const supabase = await createSupabaseServer();

  if (action === "set_domain") {
    const { customDomain } = body;
    if (!customDomain) {
      return NextResponse.json({ error: "customDomain requerido" }, { status: 400 });
    }

    if (!isValidDomain(customDomain)) {
      return NextResponse.json({ error: "Dominio inválido" }, { status: 400 });
    }

    const verificationToken = generateVerificationToken();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://canchapro.app";

    const { error } = await supabase
      .from("tenants")
      .update({
        custom_domain: customDomain,
        domain_verification_token: verificationToken,
        domain_verified_at: null,
      })
      .eq("id", tenantId);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "El dominio ya está en uso" }, { status: 409 });
      }
      return NextResponse.json({ error: "Error al configurar dominio" }, { status: 500 });
    }

    return NextResponse.json({
      verificationToken,
      instructions: getVerificationInstructions(customDomain, verificationToken),
    });
  }

  if (action === "remove_domain") {
    const { error } = await supabase
      .from("tenants")
      .update({
        custom_domain: null,
        domain_verification_token: null,
        domain_verified_at: null,
      })
      .eq("id", tenantId);

    if (error) {
      return NextResponse.json({ error: "Error al remover dominio" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (action === "verify") {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("custom_domain, domain_verification_token")
      .eq("id", tenantId)
      .single();

    if (!tenant?.custom_domain) {
      return NextResponse.json({ error: "No hay dominio configurado" }, { status: 400 });
    }

    const isVerified = await checkDnsVerification(
      tenant.custom_domain,
      tenant.domain_verification_token || ""
    );

    if (isVerified) {
      await supabase
        .from("tenants")
        .update({ domain_verified_at: new Date().toISOString() })
        .eq("id", tenantId);

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({
      verified: false,
      instructions: getVerificationInstructions(tenant.custom_domain, tenant.domain_verification_token || ""),
    });
  }

  return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
}

function isValidDomain(domain: string): boolean {
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  const blockedDomains = ["canchapro.app", "vercel.app", "railway.app", "render.com"];
  if (blockedDomains.includes(domain)) return false;
  return domainRegex.test(domain);
}

function generateVerificationToken(): string {
  return `cpv_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

function getVerificationInstructions(domain: string, token: string): object {
  return {
    type: "CNAME",
    host: `_canchapro-verification.${domain}`,
    value: `verify.${token}.canchapro.app`,
    description: `Agrega un registro CNAME en tu proveedor DNS con host "_canchapro-verification.${domain}" y valor "verify.${token}.canchapro.app"`,
  };
}

async function checkDnsVerification(domain: string, token: string): Promise<boolean> {
  const verificationHost = `_canchapro-verification.${domain}`;
  const expectedValue = `verify.${token}.canchapro.app`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const lookupUrl = `https://dns.google/resolve?name=${encodeURIComponent(verificationHost)}&type=CNAME`;
    const response = await fetch(lookupUrl, { signal: controller.signal });
    clearTimeout(timeout);
    const data = await response.json();

    if (data.Status !== 0 || !data.Answer) return false;

    const cnameValue = data.Answer.find(
      (a: { type: number; data: string }) => a.type === 5 && a.data === `${expectedValue}.`
    );

    return !!cnameValue;
  } catch {
    return false;
  }
}
