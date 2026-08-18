import { NextResponse } from "next/server";
import { calculateAge, registrationSchema } from "@/lib/registration-schema";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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
        { message: "Impossible d'enregistrer la demande. تعذر حفظ الطلب." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Registration save failed", error);

    if (error instanceof Error && error.message.includes("Supabase environment variables")) {
      return NextResponse.json(
        {
          message: "Configuration Supabase manquante. إعدادات Supabase ناقصة."
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
