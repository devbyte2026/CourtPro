import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const supabaseAdmin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: tenantUser } = await supabaseAdmin
    .from("tenant_users")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .single();

  if (!tenantUser) {
    return NextResponse.json({ role: null, slug: null });
  }

  if (tenantUser.role === "owner") {
    const { data: tenant } = await supabaseAdmin
      .from("tenants")
      .select("slug")
      .eq("id", tenantUser.tenant_id)
      .single();

    return NextResponse.json({ role: "owner", slug: tenant?.slug || null });
  }

  return NextResponse.json({ role: tenantUser.role, slug: null });
}
