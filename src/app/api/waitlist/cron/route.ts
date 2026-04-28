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

    const { data: entries, error } = await supabase
      .from("waitlist")
      .select(`
        id,
        court_id,
        date,
        start_time,
        end_time,
        expires_at,
        customers!inner(id, name, email),
        courts!inner(tenant_id)
      `)
      .is("notified_at", null)
      .lt("expires_at", now.toISOString());

    if (error) {
      console.error("Cron waitlist: error finding entries:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let notified = 0;
    for (const entry of entries || []) {
      await supabase
        .from("waitlist")
        .update({ notified_at: now.toISOString() })
        .eq("id", entry.id);
      notified++;
    }

    console.log(`Cron waitlist: notified ${notified} expired entries`);
    return NextResponse.json({ notified });
  } catch (error) {
    console.error("Cron waitlist error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
