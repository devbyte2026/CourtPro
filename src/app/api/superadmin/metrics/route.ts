import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET() {
  const supabase = await createClient();

  const [
    tenantsRes,
    bookingsRes,
    paymentsRes,
  ] = await Promise.all([
    supabase.from("tenants").select("id, name, plan, status, created_at"),
    supabase.from("bookings").select("id, tenant_id, total_amount, status, date"),
    supabase.from("payments").select("amount, status, created_at"),
  ]);

  const tenants = tenantsRes.data || [];
  const bookings = bookingsRes.data || [];
  const payments = paymentsRes.data || [];

  const activeTenants = tenants.filter((t) => t.status === "active").length;
  const pendingTenants = tenants.filter((t) => t.status === "pending").length;

  const PLAN_PRICES: Record<string, number> = { start: 10000, pro: 25000, premium: 50000 };
  const mrr = tenants
    .filter((t) => t.status === "active")
    .reduce((sum, t) => sum + (PLAN_PRICES[t.plan] || 0), 0);

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const totalBookings = confirmedBookings.length;
  const totalGMV = confirmedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const tenantBookings: Record<string, number> = {};
  confirmedBookings.forEach((b) => {
    tenantBookings[b.tenant_id] = (tenantBookings[b.tenant_id] || 0) + 1;
  });

  const tenantRevenue: Record<string, number> = {};
  tenants.forEach((t) => {
    tenantRevenue[t.id] = PLAN_PRICES[t.plan] || 0;
  });

  const tenantNames: Record<string, string> = {};
  tenants.forEach((t) => {
    tenantNames[t.id] = t.name;
  });

  const topTenants = Object.entries(tenantBookings)
    .map(([id, bookingsCount]) => ({
      name: tenantNames[id] || "Sin nombre",
      bookings: bookingsCount,
      mrr: tenantRevenue[id] || 0,
    }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 10);

  const recentSignups = [...tenants]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((t) => ({
      name: t.name,
      plan: t.plan,
      created_at: t.created_at,
    }));

  return NextResponse.json({
    totalTenants: tenants.length,
    activeTenants,
    pendingTenants,
    mrr,
    totalBookings,
    totalGMV,
    topTenants,
    recentSignups,
  });
}
