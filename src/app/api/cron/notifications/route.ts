import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";
import { sendReminder } from "@/lib/email/sender";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const now = new Date();

    const reminderWindowStart = new Date(now.getTime() + 90 * 60 * 1000);
    const reminderWindowEnd = new Date(now.getTime() + 150 * 60 * 1000);

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, date, start_time, tenants(name), courts(name), customers(email, name)")
      .eq("status", "confirmed")
      .gte("date", now.toISOString().split("T")[0])
      .lte("date", reminderWindowEnd.toISOString().split("T")[0]);

    if (error) {
      console.error("Cron notifications error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const toRemind = (bookings || []).filter((b: any) => {
      const bookingDateTime = new Date(`${b.date}T${b.start_time}`);
      return bookingDateTime >= reminderWindowStart && bookingDateTime <= reminderWindowEnd;
    });

    let sent = 0;
    for (const booking of toRemind) {
      const customers = booking.customers as any[];
      const customer = customers?.[0];
      const courts = booking.courts as any[];
      const tenants = booking.tenants as any[];
      if (customer?.email) {
        await sendReminder({
          to: customer.email,
          customerName: customer.name || "Cliente",
          courtName: courts?.[0]?.name || "Cancha",
          tenantName: tenants?.[0]?.name || "Complejo",
          date: booking.date,
          startTime: booking.start_time,
          hoursUntil: 2,
        }).catch((e) => console.error("Email error:", e));
        sent++;
      }
    }

    console.log(`Cron notifications: sent ${sent} reminders`);
    return NextResponse.json({ sent });
  } catch (error) {
    console.error("Cron notifications error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
