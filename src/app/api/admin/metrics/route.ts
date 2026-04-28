import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId requerido" }, { status: 400 });
  }

  const supabase = await createClient();

  const today = new Date();
  const startOfDay = today.toISOString().split("T")[0];
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split("T")[0];
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];

  const [
    todayRevenueRes,
    weekRevenueRes,
    monthRevenueRes,
    todayBookingsRes,
    weekBookingsRes,
    pendingBookingsRes,
    noShowsRes,
    topCourtsRes,
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("total_amount")
      .eq("tenant_id", tenantId)
      .eq("status", "confirmed")
      .eq("date", startOfDay),
    supabase
      .from("bookings")
      .select("total_amount")
      .eq("tenant_id", tenantId)
      .eq("status", "confirmed")
      .gte("date", startOfWeek),
    supabase
      .from("bookings")
      .select("total_amount")
      .eq("tenant_id", tenantId)
      .eq("status", "confirmed")
      .gte("date", startOfMonth),
    supabase
      .from("bookings")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("date", startOfDay)
      .in("status", ["pending", "confirmed"]),
    supabase
      .from("bookings")
      .select("id")
      .eq("tenant_id", tenantId)
      .gte("date", startOfWeek)
      .in("status", ["pending", "confirmed"]),
    supabase
      .from("bookings")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("status", "pending"),
    supabase
      .from("bookings")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("status", "no_show")
      .gte("date", startOfMonth),
    supabase
      .from("bookings")
      .select("court_id, courts(name)")
      .eq("tenant_id", tenantId)
      .gte("date", startOfMonth)
      .in("status", ["confirmed", "completed"])
  ]);

  const todayRevenue = todayRevenueRes.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
  const weekRevenue = weekRevenueRes.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
  const monthRevenue = monthRevenueRes.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
  const todayBookings = todayBookingsRes.data?.length || 0;
  const weekBookings = weekBookingsRes.data?.length || 0;
  const pendingBookings = pendingBookingsRes.data?.length || 0;
  const noShows = noShowsRes.data?.length || 0;

  const courtCounts: Record<string, number> = {};
  (topCourtsRes.data || []).forEach((b: any) => {
    const name = b.courts?.name || "Sin nombre";
    courtCounts[name] = (courtCounts[name] || 0) + 1;
  });
  const topCourts = Object.entries(courtCounts)
    .map(([name, bookings]) => ({ name, bookings }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

  return NextResponse.json({
    todayRevenue,
    weekRevenue,
    monthRevenue,
    todayBookings,
    weekBookings,
    pendingBookings,
    noShows,
    topCourts,
  });
}
