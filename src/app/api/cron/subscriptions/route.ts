import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";
import { sendSubscriptionExpiringReminder, sendSubscriptionExpired } from "@/lib/email/sender";

const PLANS = {
  start: { name: "Start", price: 10000 },
  pro: { name: "Pro", price: 25000 },
  premium: { name: "Premium", price: 50000 },
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*, tenants(name)")
      .eq("status", "active");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const results = { expiring_soon: 0, expired: 0, errors: [] as string[] };

    for (const subscription of subscriptions || []) {
      try {
        const periodEnd = new Date(subscription.current_period_end);
        const daysUntilEnd = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        const planInfo = PLANS[subscription.plan as keyof typeof PLANS] || PLANS.start;

        if (daysUntilEnd <= 0) {
          await supabase
            .from("subscriptions")
            .update({ status: "expired" })
            .eq("id", subscription.id);

          if (subscription.tenants?.name) {
            await sendSubscriptionExpired({
              to: process.env.GMAIL_USER || "soporte@canchapro.app",
              tenantName: subscription.tenants.name,
              expiredDate: subscription.current_period_end,
              planName: planInfo.name,
            });
          }

          results.expired++;
        } else if (daysUntilEnd <= 7) {
          const renewalDate = new Date(periodEnd);
          renewalDate.setDate(renewalDate.getDate() + 1);

          if (subscription.tenants?.name) {
            await sendSubscriptionExpiringReminder({
              to: process.env.GMAIL_USER || "soporte@canchapro.app",
              tenantName: subscription.tenants.name,
              daysUntilExpiration: daysUntilEnd,
              renewalDate: renewalDate.toISOString().split("T")[0],
              planName: planInfo.name,
              amount: planInfo.price,
            });
          }

          results.expiring_soon++;
        }
      } catch (err) {
        results.errors.push(`Error processing subscription ${subscription.id}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      processed: subscriptions?.length || 0,
      results,
    });
  } catch (error) {
    console.error("Cron subscription check error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}