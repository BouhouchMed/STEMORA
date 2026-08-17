import { NextResponse } from "next/server";
import { readRegistrations, type StoredRegistration } from "@/lib/registrations-store";

const columns: Array<[keyof StoredRegistration, string]> = [
  ["id", "ID"],
  ["created_at", "Created at"],
  ["status", "Status"],
  ["child_name", "Child name"],
  ["child_birth_date", "Birth date"],
  ["child_age", "Age"],
  ["school_level", "School level"],
  ["city_country", "City / Country"],
  ["experience_level", "Experience"],
  ["selected_programs", "Programs"],
  ["parent_name", "Parent name"],
  ["parent_phone", "Phone"],
  ["parent_email", "Email"],
  ["preferred_contact", "Preferred contact"],
  ["preferred_days", "Preferred days"],
  ["preferred_period", "Preferred period"],
  ["course_type", "Course type"],
  ["marketing_consent", "Marketing consent"]
];

function isAuthorized(request: Request) {
  const token = process.env.ADMIN_EXPORT_TOKEN;
  const providedToken = request.headers.get("x-admin-token");
  return Boolean(token && providedToken && token === providedToken);
}

function csvEscape(value: unknown) {
  const normalized = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  return `"${normalized.replaceAll('"', '""')}"`;
}

function toCsv(registrations: StoredRegistration[]) {
  const header = columns.map(([, label]) => csvEscape(label)).join(",");
  const rows = registrations.map((registration) =>
    columns.map(([key]) => csvEscape(registration[key])).join(",")
  );
  return [header, ...rows].join("\n");
}

export async function GET(request: Request) {
  if (!process.env.ADMIN_EXPORT_TOKEN) {
    return NextResponse.json(
      { message: "ADMIN_EXPORT_TOKEN is missing. Ajoutez-le dans .env.local." },
      { status: 500 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { message: "Accès refusé. رمز الإدارة غير صحيح." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";
  const registrations = (await readRegistrations())
    .filter((registration) => registration.status === "new")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (format === "csv") {
    return new Response(toCsv(registrations), {
      headers: {
        "Content-Disposition": `attachment; filename="stemora-new-registrations.csv"`,
        "Content-Type": "text/csv; charset=utf-8"
      }
    });
  }

  return NextResponse.json({ registrations });
}
