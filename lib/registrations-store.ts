import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { calculateAge, type RegistrationFormValues } from "@/lib/registration-schema";

const fallbackFiles = [
  path.join(process.cwd(), "data", "registrations.json"),
  path.join(os.homedir(), ".stemora", "registrations.json"),
  path.join(os.tmpdir(), "stemora", "registrations.json")
];

const candidateFiles = process.env.REGISTRATIONS_FILE_PATH
  ? [process.env.REGISTRATIONS_FILE_PATH]
  : fallbackFiles;

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
  const registrationsFile = await resolveReadableFile();

  if (!registrationsFile) {
    return [];
  }

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

  const registrationsFile = await resolveWritableFile();
  const registrations = await readRegistrationsFromFile(registrationsFile);
  registrations.push(registration);
  await writeFile(registrationsFile, `${JSON.stringify(registrations, null, 2)}\n`, "utf8");
  return registration;
}

async function readRegistrationsFromFile(registrationsFile: string) {
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

async function resolveReadableFile() {
  for (const file of candidateFiles) {
    try {
      await readFile(file, "utf8");
      return file;
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        continue;
      }

      if (process.env.REGISTRATIONS_FILE_PATH) {
        throw error;
      }
    }
  }

  return null;
}

async function resolveWritableFile() {
  let lastError: unknown;

  for (const file of candidateFiles) {
    try {
      const directory = path.dirname(file);
      const probe = path.join(directory, `.stemora-write-test-${process.pid}`);
      await mkdir(directory, { recursive: true });
      await writeFile(probe, "ok", "utf8");
      await unlink(probe);
      return file;
    } catch (error) {
      lastError = error;

      if (process.env.REGISTRATIONS_FILE_PATH) {
        throw error;
      }
    }
  }

  throw lastError;
}

export function isFileWriteError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    ["EACCES", "ENOENT", "EROFS", "EPERM"].includes(String(error.code))
  );
}
