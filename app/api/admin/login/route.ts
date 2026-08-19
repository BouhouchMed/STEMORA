import { NextResponse } from "next/server";
import {
  createAdminSession,
  setAdminSessionCookie,
  verifyAdminCredentials
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body.username?.trim() || "";
    const password = body.password || "";

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        { message: "Identifiants incorrects. اسم المستخدم أو كلمة المرور غير صحيحة." },
        { status: 401 }
      );
    }

    setAdminSessionCookie(createAdminSession());
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message.includes("Admin password")
            ? "Configuration admin manquante. إعدادات الأدمن ناقصة."
            : "Erreur inattendue / وقع خطأ غير متوقع."
      },
      { status: 500 }
    );
  }
}
