import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");
  const date = request.nextUrl.searchParams.get("date");
  const status = request.nextUrl.searchParams.get("status");

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId requerido" }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select(`
      id,
      date,
      start_time,
      end_time,
      status,
      total_amount,
      created_at,
      courts!inner(name, sport_type),
      customers!inner(name, email)
    `)
    .eq("tenant_id", tenantId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (date) {
    query = query.eq("date", date);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: bookings, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = (bookings || []).map((b: any) => ({
    id: b.id,
    date: b.date,
    start_time: b.start_time,
    end_time: b.end_time,
    status: b.status,
    total_amount: b.total_amount,
    created_at: b.created_at,
    court: b.courts,
    customer: b.customers,
  }));

  return NextResponse.json({ bookings: formatted });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { bookingId, action, tenantId } = body;

  if (!bookingId || !action || !tenantId) {
    return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
  }

  const supabase = await createClient();

  let updateData: Record<string, unknown> = {};
  if (action === "cancel") {
    updateData = { status: "cancelled" };
  } else if (action === "confirm") {
    updateData = { status: "confirmed" };
  } else if (action === "no_show") {
    updateData = { status: "no_show" };
  } else {
    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  }

  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .eq("tenant_id", tenantId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
