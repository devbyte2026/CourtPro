import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");
  const courtId = request.nextUrl.searchParams.get("courtId");
  const date = request.nextUrl.searchParams.get("date");

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId requerido" }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from("waitlist")
    .select(`
      id,
      date,
      start_time,
      end_time,
      created_at,
      courts!inner(name, sport_type),
      customers!inner(name, email)
    `)
    .eq("tenant_id", tenantId)
    .is("notified_at", null)
    .order("created_at", { ascending: true });

  if (courtId) {
    query = query.eq("court_id", courtId);
  }
  if (date) {
    query = query.eq("date", date);
  }

  const { data: entries, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = (entries || []).map((e: any) => ({
    id: e.id,
    date: e.date,
    start_time: e.start_time,
    end_time: e.end_time,
    created_at: e.created_at,
    court: e.courts,
    customer: e.customers,
  }));

  return NextResponse.json({ waitlist: formatted });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, courtId, customerId, date, startTime, endTime } = body;

    if (!tenantId || !courtId || !customerId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
    }

    const supabase = await createClient();

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const { data: entry, error } = await supabase
      .from("waitlist")
      .insert({
        tenant_id: tenantId,
        court_id: courtId,
        customer_id: customerId,
        date,
        start_time: startTime,
        end_time: endTime,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ waitlist: entry });
  } catch (error) {
    console.error("Waitlist join error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("id");

    if (!entryId) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("waitlist")
      .delete()
      .eq("id", entryId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist delete error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
