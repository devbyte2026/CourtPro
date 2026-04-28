import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id, status, date, start_time, end_time, total_amount, courts(name, sport_type), tenants(name)")
    .eq("id", id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: booking.id,
    status: booking.status,
    date: booking.date,
    start_time: booking.start_time,
    end_time: booking.end_time,
    total_amount: booking.total_amount,
    court: booking.courts,
    tenant: booking.tenants,
  });
}
