import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase-server";
import type { Tenant, UserRole } from "@/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentTenant(request?: Request): Promise<Tenant | null> {
  const supabase = await createClient();

  const host = request?.headers.get("host") || "";
  const subdomain = extractSubdomain(host);

  if (!subdomain || subdomain === "www" || subdomain === "app") {
    return null;
  }

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("subdomain", subdomain)
    .eq("status", "active")
    .single();

  if (error || !tenant) {
    return null;
  }

  return tenant as Tenant;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = await createClient();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !tenant) {
    return null;
  }

  return tenant as Tenant;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireTenantOwner(tenantId: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: tenantUser, error } = await supabase
    .from("tenant_users")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", user.id)
    .in("role", ["owner", "super_admin"])
    .single();

  if (error || !tenantUser) {
    redirect("/unauthorized");
  }

  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: tenantUser, error } = await supabase
    .from("tenant_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "super_admin")
    .single();

  if (error || !tenantUser) {
    redirect("/unauthorized");
  }

  return user;
}

export async function getUserRole(tenantId: string): Promise<UserRole | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();

  const { data: tenantUser, error } = await supabase
    .from("tenant_users")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", user.id)
    .single();

  if (error || !tenantUser) {
    return null;
  }

  return tenantUser.role as UserRole;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

export async function hasAccessToTenant(tenantId: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const role = await getUserRole(tenantId);
  return role !== null;
}

function extractSubdomain(hostname: string): string | null {
  const domains = hostname.split(".");

  if (domains.length >= 3) {
    return domains[0];
  }

  return null;
}