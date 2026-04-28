import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");
  const filter = request.nextUrl.searchParams.get("filter") || "upcoming";

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId requerido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("bookings")
    .select(`
      id,
      date,
      start_time,
      end_time,
      status,
      total_amount,
      court_id,
      courts!inner(id, name, sport_type),
      tenants!inner(id, name)
    `)
    .eq("created_by", user.id)
    .eq("tenant_id", tenantId)
    .order("date", { ascending: filter !== "past" });

  if (filter === "upcoming") {
    query = query.gte("date", today).in("status", ["pending", "confirmed"]);
  } else if (filter === "past") {
    query = query.lt("date", today).in("status", ["completed", "cancelled", "no_show"]);
  }

  const { data: bookings, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = (bookings || []).map((b: any) => ({
    id: b.id,
    date: b.date,
    start_time: b.start_time,
    end_time: b.end_time,
    status: b.status,
    total_amount: b.total_amount,
    court: { id: b.court_id, ...b.courts },
    tenant: { id: b.tenant_id, ...b.tenants },
  }));

  return NextResponse.json({ bookings: formatted });
}
