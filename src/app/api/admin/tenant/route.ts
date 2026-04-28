import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId requerido" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .single();

  if (error || !tenant) {
    return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ tenant });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, ...updates } = body;

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId requerido" }, { status: 400 });
    }

    const supabase = await createClient();

    const allowedFields = [
      "name", "description", "address", "city", "phone",
      "branding_config", "cancellation_policy",
      "mp_access_token", "mp_refresh_token", "mp_user_id", "mp_token_expires_at",
    ];

    const dataToUpdate: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        dataToUpdate[key] = updates[key];
      }
    }

    const { error } = await supabase
      .from("tenants")
      .update(dataToUpdate)
      .eq("id", tenantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tenant update error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
