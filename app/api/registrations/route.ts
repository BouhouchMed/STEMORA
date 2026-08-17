import { NextResponse } from "next/server";
import { registrationSchema } from "@/lib/registration-schema";
import { saveRegistration } from "@/lib/registrations-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Veuillez vérifier les informations / راجع المعلومات من فضلك.", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await saveRegistration(parsed.data);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erreur inattendue / وقع خطأ غير متوقع."
      },
      { status: 500 }
    );
  }
}
