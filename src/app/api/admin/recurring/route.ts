import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId requerido" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: recurring, error } = await supabase
    .from("recurring_bookings")
    .select(`
      id,
      court_id,
      day_of_week,
      start_time,
      end_time,
      price,
      start_date,
      end_date,
      occurrences,
      instances_count,
      is_active,
      courts(name, sport_type),
      customers(name, email)
    `)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = (recurring || []).map((r: any) => ({
    id: r.id,
    court_id: r.court_id,
    day_of_week: r.day_of_week,
    start_time: r.start_time,
    end_time: r.end_time,
    price: r.price,
    start_date: r.start_date,
    end_date: r.end_date,
    occurrences: r.occurrences,
    instances_count: r.instances_count,
    is_active: r.is_active,
    court: r.courts,
    customer: r.customers,
  }));

  return NextResponse.json({ recurring: formatted });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, courtId, customerId, dayOfWeek, startTime, endTime, price, startDate, endDate, occurrences } = body;

    if (!tenantId || !courtId || !customerId || dayOfWeek === undefined || !startTime || !endTime || !startDate) {
      return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: recurring, error } = await supabase
      .from("recurring_bookings")
      .insert({
        tenant_id: tenantId,
        court_id: courtId,
        customer_id: customerId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        price: price || 0,
        start_date: startDate,
        end_date: endDate || null,
        occurrences: occurrences || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recurring });
  } catch (error) {
    console.error("Recurring booking error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { recurringId, isActive } = body;

    if (!recurringId) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("recurring_bookings")
      .update({ is_active: isActive })
      .eq("id", recurringId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Recurring booking update error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
