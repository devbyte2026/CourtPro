import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase-server";
import { requireTenantOwner } from "@/lib/auth-helpers";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function AdminPage({ params }: PageProps) {
  const { subdomain } = await params;

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("subdomain", subdomain)
    .single();

  if (!tenant) {
    redirect("/");
  }

  await requireTenantOwner(tenant.id);

  return <AdminDashboard tenant={tenant} />;
}
