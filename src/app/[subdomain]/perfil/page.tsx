import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase-server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { PlayerProfilePage } from "@/components/public/player-profile-page";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function PerfilPage({ params }: PageProps) {
  const { subdomain } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("subdomain", subdomain)
    .eq("status", "active")
    .single();

  if (!tenant) {
    notFound();
  }

  return <PlayerProfilePage user={user} tenant={tenant} />;
}
