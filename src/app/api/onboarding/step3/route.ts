import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { tenantId, schedules, pricing_rules } = body;

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId requerido" }, { status: 400 });
    }

    const { data: courts } = await supabase
      .from("courts")
      .select("id")
      .eq("tenant_id", tenantId);

    if (!courts || courts.length === 0) {
      return NextResponse.json({ error: "No hay canchas para asignar horarios" }, { status: 400 });
    }

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

    if (pricing_rules && pricing_rules.length > 0) {
      const rulesToInsert = pricing_rules.map((rule: { day_of_week: number | null; start_time: string; end_time: string; price_modifier: number }) => ({
        tenant_id: tenantId,
        court_id: null,
        day_of_week: rule.day_of_week,
        start_time: rule.start_time,
        end_time: rule.end_time,
        price_modifier: rule.price_modifier,
        is_active: true,
      }));

      const { error: pricingError } = await supabase.from("pricing_rules").insert(rulesToInsert);
      if (pricingError) {
        console.error("Pricing rules insert error:", pricingError);
        return NextResponse.json({ error: pricingError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding step3 error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}