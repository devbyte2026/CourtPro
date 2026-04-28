import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const now = new Date();

    const { data: upcomingBookings, error: findError } = await supabase
      .from("bookings")
      .select("id, date, start_time, tenants(id, name)")
      .eq("status", "confirmed")
      .gte("date", now.toISOString().split("T")[0])
      .lte("date", new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().split("T")[0]);

    if (findError) {
      console.error("Cron reminders: error finding bookings:", findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    const toRemind = (upcomingBookings || []).filter((b: { date: string; start_time: string }) => {
      const bookingDateTime = new Date(`${b.date}T${b.start_time}`);
      const diff = bookingDateTime.getTime() - now.getTime();
      return diff > 0 && diff <= 2 * 60 * 60 * 1000;
    });

    console.log(`Cron reminders: ${toRemind.length} bookings to remind`);
    return NextResponse.json({ reminders: toRemind.length });
  } catch (error) {
    console.error("Cron reminders error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
