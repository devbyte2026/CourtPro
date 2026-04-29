import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase-server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");

  if (type === "recovery" && code) {
    return NextResponse.redirect(
      new URL(`/admin/reset-password?code=${code}`, requestUrl.origin)
    );
  }

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const redirectUrl = requestUrl.searchParams.get("redirect_url") || "/";
  return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
}