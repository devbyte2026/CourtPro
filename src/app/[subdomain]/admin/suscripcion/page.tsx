import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase-server";
import { requireTenantOwner } from "@/lib/auth-helpers";
import { SubscriptionPage } from "@/components/admin/subscription-page";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function SubscriptionRoute({ params }: PageProps) {
  const { subdomain } = await params;

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, subscriptions(*)")
    .eq("subdomain", subdomain)
    .single();

  if (!tenant) {
    redirect("/");
  }

  await requireTenantOwner(tenant.id);

  return <SubscriptionPage tenant={tenant} />;
}
