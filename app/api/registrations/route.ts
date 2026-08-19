import { NextResponse } from "next/server";
import { calculateAge, registrationSchema } from "@/lib/registration-schema";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getTurnstileEnvStatus, verifyTurnstileToken } from "@/lib/turnstile";

function getSupabaseEnvStatus() {
  return {
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAnonKey: Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    turnstile: getTurnstileEnvStatus()
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const turnstileCheck = await verifyTurnstileToken(body.turnstileToken, request);

    if (!turnstileCheck.ok) {
      return NextResponse.json(
        {
          message: turnstileCheck.message,
          errorCodes: "errorCodes" in turnstileCheck ? turnstileCheck.errorCodes : undefined,
          env: getSupabaseEnvStatus()
        },
        { status: turnstileCheck.status }
      );
    }

    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Veuillez vérifier les informations / راجع المعلومات من فضلك.", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const values = parsed.data;
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("registrations").insert({
      child_name: values.childName,
      child_birth_date: values.childBirthDate,
      child_age: calculateAge(values.childBirthDate),
      school_level: values.schoolLevel,
      city_country: values.cityCountry,
      experience_level: values.experienceLevel,
      selected_programs: values.selectedPrograms,
      parent_name: values.parentName,
      parent_phone: values.parentPhone,
      parent_email: values.parentEmail,
      preferred_contact: values.preferredContact,
      preferred_days: values.preferredDays,
      preferred_period: values.preferredPeriod,
      course_type: values.courseType,
      marketing_consent: values.marketingConsent,
      status: "new"
    });

    if (error) {
      console.error("Supabase registration insert failed", error);
      return NextResponse.json(
        {
          message: "Impossible d'enregistrer la demande. تعذر حفظ الطلب.",
          error: {
            code: error.code,
            message: error.message,
            hint: error.hint,
            details: error.details
          },
          env: getSupabaseEnvStatus()
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Registration save failed", error);

    if (error instanceof Error && error.message.includes("Supabase environment variables")) {
      return NextResponse.json(
        {
          message: "Configuration Supabase manquante. إعدادات Supabase ناقصة.",
          env: getSupabaseEnvStatus()
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Erreur inattendue / وقع خطأ غير متوقع.",
        error: {
          message: error instanceof Error ? error.message : "Unknown error"
        },
        env: getSupabaseEnvStatus()
      },
      { status: 500 }
    );
  }
}
