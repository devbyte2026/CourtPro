import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase-server";
import { requireTenantOwner } from "@/lib/auth-helpers";
import { AdminReservationsList } from "@/components/admin/admin-reservations-list";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function AdminReservationsPage({ params }: PageProps) {
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

  return <AdminReservationsList tenant={tenant} />;
}
