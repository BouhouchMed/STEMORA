import { NextResponse } from "next/server";
import { registrationSchema } from "@/lib/registration-schema";
import { isFileWriteError, saveRegistration } from "@/lib/registrations-store";

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
    console.error("Registration save failed", error);

    if (isFileWriteError(error)) {
      return NextResponse.json(
        {
          message:
            "Le serveur ne peut pas écrire dans le fichier JSON. تأكد أن مسار REGISTRATIONS_FILE_PATH قابل للكتابة."
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Erreur inattendue / وقع خطأ غير متوقع."
      },
      { status: 500 }
    );
  }
}
