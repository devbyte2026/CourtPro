import { NextResponse } from "next/server";
import { createClient as createSupabaseServer } from "@/lib/db/supabase-server";

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {} as Record<string, { status: string; latency?: number; error?: string }>,
  };

  const startSupabase = Date.now();
  try {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.from("tenants").select("id").limit(1);
    health.services.supabase = {
      status: error ? "degraded" : "ok",
      latency: Date.now() - startSupabase,
      ...(error && { error: error.message }),
    };
  } catch (e) {
    health.services.supabase = {
      status: "error",
      latency: Date.now() - startSupabase,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }

  const redisStart = Date.now();
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (redisUrl && redisToken) {
      const response = await fetch(`${redisUrl}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        method: "GET",
      });
      health.services.redis = {
        status: response.ok ? "ok" : "degraded",
        latency: Date.now() - redisStart,
      };
    } else {
      health.services.redis = { status: "not_configured" };
    }
  } catch (e) {
    health.services.redis = {
      status: "error",
      latency: Date.now() - redisStart,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }

  const overallStatus =
    Object.values(health.services).every((s) => s.status === "ok" || s.status === "not_configured")
      ? "ok"
      : Object.values(health.services).some((s) => s.status === "error")
        ? "error"
        : "degraded";

  return NextResponse.json(
    { ...health, status: overallStatus },
    { status: overallStatus === "error" ? 503 : 200 }
  );
}
