import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase-server";
import { requireTenantOwner } from "@/lib/auth-helpers";
import { ConfigPage } from "@/components/admin/config-page";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function ConfigPageRoute({ params }: PageProps) {
  const { subdomain } = await params;

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, courts(*), venues(*)")
    .eq("subdomain", subdomain)
    .single();

  if (!tenant) {
    redirect("/");
  }

  await requireTenantOwner(tenant.id);

  return <ConfigPage tenant={tenant} />;
}
