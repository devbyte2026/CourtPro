import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/auth";
import { createClient as createSupabaseServer } from "@/lib/db/supabase-server";

const PUBLIC_DOMAINS = ["www", "app", "localhost"];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl;

  let subdomain = extractSubdomain(hostname);
  const customDomain = hostname !== process.env.NEXT_PUBLIC_APP_DOMAIN ? hostname : null;

  if (hostname.includes("localhost") && url.searchParams.has("tenant")) {
    subdomain = url.searchParams.get("tenant");
  }

  let tenant = null;

  if (customDomain && !PUBLIC_DOMAINS.some((d) => customDomain.includes(d))) {
    tenant = await resolveTenantByCustomDomain(customDomain);
  } else if (subdomain && !PUBLIC_DOMAINS.includes(subdomain)) {
    tenant = await resolveTenantBySubdomain(subdomain);
  }

  if (tenant) {
    const response = await updateSession(request);
    response.headers.set("x-tenant-id", tenant.id);
    response.headers.set("x-tenant-slug", tenant.slug);
    response.headers.set("x-tenant-plan", tenant.plan);
    response.headers.set("x-tenant-domain", tenant.custom_domain || tenant.subdomain);
    return addSecurityHeaders(response);
  }

  const response = await updateSession(request);
  return addSecurityHeaders(response);
}

function extractSubdomain(hostname: string): string | null {
  const cleanHostname = hostname.replace(/:\d+$/, "");
  const domains = cleanHostname.split(".");
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN?.replace(/^(https?:\/\/)?/, "");

  if (appDomain && domains.length >= 3 && domains.slice(-2).join(".") === appDomain) {
    return domains[0];
  }

  if (domains.length >= 3 && !domains[0].includes(":")) {
    return domains[0];
  }

  return null;
}

async function resolveTenantBySubdomain(subdomain: string) {
  const supabase = await createSupabaseServer();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, slug, plan, status, subdomain, custom_domain")
    .eq("subdomain", subdomain)
    .eq("status", "active")
    .single();

  if (error || !tenant) {
    return null;
  }

  return tenant;
}

async function resolveTenantByCustomDomain(customDomain: string) {
  const supabase = await createSupabaseServer();
  const cleanDomain = customDomain.replace(/^(https?:\/\/)/, "").split(":")[0];

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, slug, plan, status, subdomain, custom_domain")
    .eq("custom_domain", cleanDomain)
    .eq("status", "active")
    .not("domain_verified_at", "is", null)
    .single();

  if (error || !tenant) {
    return null;
  }

  return tenant;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://canchapro.app";
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${process.env.NODE_ENV === "production" ? "" : "https://cdn.posthog.com"}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://*.supabase.co https://*.mercadopago.com.ar https://*.mercadopago.com`,
    `font-src 'self'`,
    `connect-src 'self' https://*.supabase.co https://*.mercadopago.com.ar https://*.posthog.com ${process.env.NODE_ENV === "development" ? "ws://localhost:*" : ""}`,
    `frame-src 'self' https://*.mercadopago.com.ar`,
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];

  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};