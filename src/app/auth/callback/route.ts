import { NextResponse, type NextRequest } from "next/server";

import { isOwner } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const config = getAppConfig();
  const code = request.nextUrl.searchParams.get("code");
  const destination = new URL("/", config.appUrl);

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=Missing%20OAuth%20code", config.appUrl),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, config.appUrl),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isOwner(user)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/login?error=This%20account%20is%20not%20authorized", config.appUrl),
    );
  }

  return NextResponse.redirect(destination);
}
