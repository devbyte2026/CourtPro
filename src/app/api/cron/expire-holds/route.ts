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

    const { data: expiredBookings, error: findError } = await supabase
      .from("bookings")
      .select("id, tenant_id, court_id, date, start_time")
      .eq("status", "pending")
      .lt("expires_at", new Date().toISOString());

    if (findError) {
      console.error("Cron: error finding expired bookings:", findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json({ expired: 0 });
    }

    const expiredIds = expiredBookings.map((b: { id: string }) => b.id);

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .in("id", expiredIds);

    if (updateError) {
      console.error("Cron: error cancelling bookings:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log(`Cron: expired ${expiredBookings.length} pending bookings`);
    return NextResponse.json({ expired: expiredBookings.length });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
