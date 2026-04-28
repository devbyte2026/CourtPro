import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase-server";
import { PublicComplexPage } from "@/components/public/public-complex-page";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function PublicPage({ params }: PageProps) {
  const { subdomain } = await params;

  if (!subdomain) {
    redirect("/");
  }

  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, courts(*), venues(*)")
    .eq("subdomain", subdomain)
    .eq("status", "active")
    .single();

  if (!tenant) {
    notFound();
  }

  return <PublicComplexPage tenant={tenant} />;
}