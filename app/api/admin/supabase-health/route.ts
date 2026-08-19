import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getSupabaseEnvStatus() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serverKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    hasSupabaseUrl: Boolean(url),
    supabaseUrlHost: url ? safeHost(url) : null,
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAnonKey: Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    keyLooksLikeJwt: Boolean(serverKey?.startsWith("eyJ")),
    keyLooksLikeNewSecret: Boolean(serverKey?.startsWith("sb_secret_")),
    keyLooksLikeNewPublishable: Boolean(serverKey?.startsWith("sb_publishable_"))
  };
}

function safeHost(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return "invalid-url";
  }
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Accès refusé. رمز الإدارة غير صحيح." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { count, error } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          env: getSupabaseEnvStatus(),
          error: {
            code: error.code,
            message: error.message,
            hint: error.hint,
            details: error.details
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, count, env: getSupabaseEnvStatus() });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        env: getSupabaseEnvStatus(),
        error: {
          message: error instanceof Error ? error.message : "Unknown error"
        }
      },
      { status: 500 }
    );
  }
}
