import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId requerido" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name, email, phone, total_bookings, no_shows, created_at")
    .eq("tenant_id", tenantId)
    .order("total_bookings", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customers });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, name, email, phone } = body;

    if (!tenantId || !name) {
      return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        tenant_id: tenantId,
        name,
        email: email || null,
        phone: phone || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Customer create error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
