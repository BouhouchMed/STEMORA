import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { calculateAge, type RegistrationFormValues } from "@/lib/registration-schema";

const dataDirectory = path.join(process.cwd(), "data");
const registrationsFile = path.join(dataDirectory, "registrations.json");

export type StoredRegistration = {
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

export async function readRegistrations() {
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

export async function saveRegistration(values: RegistrationFormValues) {
  await mkdir(dataDirectory, { recursive: true });
  const registrations = await readRegistrations();
  const registration: StoredRegistration = {
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
  };

  registrations.push(registration);
  await writeFile(registrationsFile, `${JSON.stringify(registrations, null, 2)}\n`, "utf8");
  return registration;
}
