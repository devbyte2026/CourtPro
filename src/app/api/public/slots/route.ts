import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");
  const courtId = request.nextUrl.searchParams.get("courtId");
  const date = request.nextUrl.searchParams.get("date");

  if (!tenantId || !courtId || !date) {
    return NextResponse.json({ error: "Parámetros requeridos" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("schedules")
    .select("*")
    .eq("court_id", courtId)
    .eq("is_active", true);

  if (!schedules || schedules.length === 0) {
    return NextResponse.json({ slots: [] });
  }

  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const daySchedule = schedules.filter((s) => s.day_of_week === dayOfWeek);

  if (daySchedule.length === 0) {
    return NextResponse.json({ slots: [] });
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_time")
    .eq("court_id", courtId)
    .eq("date", date)
    .in("status", ["pending", "confirmed"]);

  const bookedTimes = new Set(bookings?.map((b) => b.start_time) || []);

  const { data: blockedSlots } = await supabase
    .from("blocked_slots")
    .select("start_time, end_time")
    .eq("court_id", courtId)
    .eq("date", date);

  const blocked = new Set<string>();
  blockedSlots?.forEach((bs) => {
    let current = bs.start_time;
    while (current < bs.end_time) {
      blocked.add(current);
      const [h, m] = current.split(":").map(Number);
      const next = h * 60 + m + 60;
      current = `${String(Math.floor(next / 60) % 24).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}`;
    }
  });

  const { data: tenant } = await supabase
    .from("tenants")
    .select("cancellation_policy")
    .eq("id", tenantId)
    .single();

  const freeCancellationHours = tenant?.cancellation_policy?.free_cancellation_hours || 24;
  const now = new Date();
  const cancelDeadline = new Date(now.getTime() + freeCancellationHours * 60 * 60 * 1000);

  const slots = daySchedule.flatMap((schedule) => {
    const result: { time: string; available: boolean; court_id: string }[] = [];
    let current = schedule.start_time;
    while (current < schedule.end_time) {
      const isBlocked = blocked.has(current) || bookedTimes.has(current);

      let canBook = !isBlocked;
      if (canBook) {
        const [h, m] = current.split(":").map(Number);
        const slotDate = new Date(date + "T00:00:00");
        slotDate.setHours(h, m, 0, 0);
        if (slotDate <= cancelDeadline) {
          canBook = false;
        }
      }

      result.push({ time: current, available: canBook, court_id: courtId });

      const [h, m] = current.split(":").map(Number);
      const next = h * 60 + m + 60;
      current = `${String(Math.floor(next / 60) % 24).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}`;
    }
    return result;
  });

  return NextResponse.json({ slots });
}