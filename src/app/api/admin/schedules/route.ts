import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, schedules } = body;

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId requerido" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: courts } = await supabase
      .from("courts")
      .select("id")
      .eq("tenant_id", tenantId);

    if (!courts || courts.length === 0) {
      return NextResponse.json({ error: "No hay canchas para asignar horarios" }, { status: 400 });
    }

    const courtIds = courts.map((c: { id: string }) => c.id);

    await supabase.from("schedules").delete().in("court_id", courtIds);

    const schedulesToInsert = schedules.flatMap((schedule: { day_of_week: number; start_time: string; end_time: string; is_active: boolean }) =>
      courts.map((court: { id: string }) => ({
        court_id: court.id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_active: schedule.is_active,
      }))
    );

    if (schedulesToInsert.length > 0) {
      const { error } = await supabase.from("schedules").insert(schedulesToInsert);
      if (error) {
        console.error("Schedules insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Schedules update error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
