import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";
import { step1Schema } from "@/lib/schemas/onboarding";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = step1Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { name, slug, description, address, city, phone } = parsed.data;

    const { data: tenant, error } = await supabase
      .from("tenants")
      .insert({
        name,
        slug,
        description: description || null,
        address,
        city,
        phone: phone || null,
        status: "pending",
        plan: "start",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "El subdominio ya existe. Elegí otro." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("tenant_users").insert({
      tenant_id: tenant.id,
      user_id: user.id,
      role: "owner",
    });

    return NextResponse.json({ tenantId: tenant.id, subdomain: slug, tenant });
  } catch (error) {
    console.error("Onboarding step1 error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}