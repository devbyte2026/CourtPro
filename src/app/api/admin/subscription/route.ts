import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID requerido" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ subscription: subscription || null });
  } catch (error) {
    console.error("Subscription GET error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, plan, annual } = body;

    if (!tenantId || !plan) {
      return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
    }

    const supabase = await createClient();
    const now = new Date();

    let periodEnd;
    if (annual) {
      periodEnd = new Date(now.getFullYear() + 1, now.getMonth(), 1);
    } else {
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .single();

    if (existingSub) {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled", cancelled_at: now.toISOString() })
        .eq("id", existingSub.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        tenant_id: tenantId,
        plan,
        status: "active",
        current_period_start: now.toISOString().split("T")[0],
        current_period_end: periodEnd.toISOString().split("T")[0],
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { error: tenantError } = await supabase
      .from("tenants")
      .update({ plan })
      .eq("id", tenantId);

    if (tenantError) {
      console.error("Tenant update error:", tenantError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}