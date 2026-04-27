import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/auth";
import { createClient as createSupabaseServer } from "@/lib/db/supabase-server";

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  const subdomain = extractSubdomain(hostname);

  if (subdomain && subdomain !== "www" && subdomain !== "app") {
    const tenant = await resolveTenantBySubdomain(subdomain);

    if (tenant) {
      const response = await updateSession(request);

      const headers = new Headers(response.supabaseResponse.headers);
      headers.set("x-tenant-id", tenant.id);
      headers.set("x-tenant-slug", tenant.slug);
      headers.set("x-tenant-plan", tenant.plan);

      const redirectResponse = NextResponse.next({
        request,
      });
      redirectResponse.headers.set("x-tenant-id", tenant.id);
      redirectResponse.headers.set("x-tenant-slug", tenant.slug);
      redirectResponse.headers.set("x-tenant-plan", tenant.plan);

      return redirectResponse;
    }
  }

  return updateSession(request);
}

function extractSubdomain(hostname: string): string | null {
  const domains = hostname.split(".");

  if (domains.length >= 3) {
    return domains[0];
  }

  return null;
}

async function resolveTenantBySubdomain(subdomain: string) {
  const supabase = await createSupabaseServer();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, slug, plan, status, custom_domain")
    .eq("subdomain", subdomain)
    .eq("status", "active")
    .single();

  if (error || !tenant) {
    return null;
  }

  return tenant;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};