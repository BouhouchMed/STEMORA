import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { calculateAge, registrationSchema } from "@/lib/registration-schema";

const dataDirectory = path.join(process.cwd(), "data");
const registrationsFile = path.join(dataDirectory, "registrations.json");

type StoredRegistration = {
  id: string;
  child_name: string;
  child_birth_date: string;
  child_age?: number;
  school_level: string;
  city_country: string;
  experience_level: string;
  selected_programs: string[];
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  preferred_contact: string;
  preferred_days: string[];
  preferred_period: string;
  course_type: string;
  marketing_consent: boolean;
  status: "new";
  created_at: string;
};

async function readRegistrations() {
  try {
    const file = await readFile(registrationsFile, "utf8");
    const data = JSON.parse(file) as StoredRegistration[];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function saveRegistration(registration: StoredRegistration) {
  await mkdir(dataDirectory, { recursive: true });
  const registrations = await readRegistrations();
  registrations.push(registration);
  await writeFile(registrationsFile, `${JSON.stringify(registrations, null, 2)}\n`, "utf8");
}

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
    await saveRegistration({
      id: randomUUID(),
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
      status: "new",
      created_at: new Date().toISOString()
    });

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
