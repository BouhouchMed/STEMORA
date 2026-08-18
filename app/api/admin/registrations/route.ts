import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type StoredRegistration = {
  id: string;
  child_name: string;
  child_birth_date: string;
  child_age?: number | null;
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
  status: string;
  created_at: string;
};

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
  const token = process.env.ADMIN_EXPORT_TOKEN || process.env.ADMIN_PASSWORD;
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
  if (!process.env.ADMIN_EXPORT_TOKEN && !process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { message: "ADMIN_EXPORT_TOKEN or ADMIN_PASSWORD is missing. Ajoutez-le dans .env.local." },
      { status: 500 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { message: "Accès refusé. رمز الإدارة غير صحيح." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("status", "new")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase registrations read failed", error);
      return NextResponse.json(
        { message: "Impossible de charger les inscriptions. تعذر تحميل التسجيلات." },
        { status: 500 }
      );
    }

    const registrations = (data || []) as StoredRegistration[];

    if (format === "csv") {
      return new Response(toCsv(registrations), {
        headers: {
          "Content-Disposition": `attachment; filename="stemora-new-registrations.csv"`,
          "Content-Type": "text/csv; charset=utf-8"
        }
      });
    }

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error("Admin registrations read failed", error);

    if (error instanceof Error && error.message.includes("Supabase environment variables")) {
      return NextResponse.json(
        {
          message: "Configuration Supabase manquante. إعدادات Supabase ناقصة."
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Erreur inattendue / وقع خطأ غير متوقع." },
      { status: 500 }
    );
  }
}
