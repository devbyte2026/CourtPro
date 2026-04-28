import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase-server";
import { requireTenantOwner } from "@/lib/auth-helpers";
import { RecurringBookingsPage } from "@/components/admin/recurring-bookings-page";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function RecurringPage({ params }: PageProps) {
  const { subdomain } = await params;

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, courts(*)")
    .eq("subdomain", subdomain)
    .single();

  if (!tenant) {
    redirect("/");
  }

  await requireTenantOwner(tenant.id);

  return <RecurringBookingsPage tenant={tenant} />;
}
