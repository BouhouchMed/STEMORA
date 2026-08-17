"use client";

import { Download, KeyRound, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StoredRegistration = {
  id: string;
  child_name: string;
  child_age?: number;
  school_level: string;
  city_country: string;
  selected_programs: string[];
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  preferred_days: string[];
  preferred_period: string;
  course_type: string;
  created_at: string;
};

export function AdminRegistrations() {
  const [token, setToken] = useState("");
  const [registrations, setRegistrations] = useState<StoredRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const count = useMemo(() => registrations.length, [registrations]);

  async function loadRegistrations() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/registrations", {
        headers: { "x-admin-token": token }
      });
      const result = (await response.json()) as {
        registrations?: StoredRegistration[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(result.message || "Impossible de charger les inscriptions.");
      }

      setRegistrations(result.registrations || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erreur inattendue.");
    } finally {
      setIsLoading(false);
    }
  }

  async function exportCsv() {
    setError("");
    try {
      const response = await fetch("/api/admin/registrations?format=csv", {
        headers: { "x-admin-token": token }
      });

      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        throw new Error(result.message || "Impossible d'exporter le fichier CSV.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "stemora-new-registrations.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Erreur inattendue.");
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-navy sm:px-6">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 rounded-3xl border border-border bg-white p-5 shadow-premium sm:p-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-sm font-bold text-primary">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Admin STEMORA
              </div>
              <h1 className="mt-4 text-3xl font-bold">Nouveaux inscrits</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-navy/65">
                Chargez les demandes enregistrées dans le fichier JSON, puis exportez-les en CSV.
              </p>
            </div>
            <div className="rounded-2xl bg-accent/16 px-5 py-4 text-center">
              <p className="text-3xl font-bold">{count}</p>
              <p className="text-sm font-semibold text-navy/65">nouveaux</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <label className="relative block">
              <span className="mb-2 block text-sm font-semibold">Admin export token</span>
              <KeyRound className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 text-navy/35" />
              <Input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="pl-12"
                placeholder="ADMIN_EXPORT_TOKEN"
              />
            </label>
            <Button type="button" className="self-end" onClick={loadRegistrations} disabled={!token || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Charger
            </Button>
            <Button type="button" variant="accent" className="self-end" onClick={exportCsv} disabled={!token}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {error && (
            <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="max-h-[620px] overflow-auto">
              <table className="min-w-[1040px] w-full border-collapse bg-white text-left text-sm">
                <thead className="sticky top-0 bg-background text-xs uppercase text-navy/60">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Enfant</th>
                    <th className="px-4 py-3">Niveau</th>
                    <th className="px-4 py-3">Programmes</th>
                    <th className="px-4 py-3">Parent</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Disponibilités</th>
                    <th className="px-4 py-3">Cours</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center font-medium text-navy/55">
                        Aucun inscrit chargé pour le moment.
                      </td>
                    </tr>
                  ) : (
                    registrations.map((registration) => (
                      <tr key={registration.id} className="border-t border-border align-top">
                        <td className="px-4 py-4">{new Date(registration.created_at).toLocaleString()}</td>
                        <td className="px-4 py-4 font-semibold">
                          {registration.child_name}
                          {registration.child_age ? <span className="block text-xs font-medium text-navy/55">{registration.child_age} ans</span> : null}
                        </td>
                        <td className="px-4 py-4">{registration.school_level}<span className="block text-xs text-navy/55">{registration.city_country}</span></td>
                        <td className="px-4 py-4">{registration.selected_programs.join(", ")}</td>
                        <td className="px-4 py-4 font-semibold">{registration.parent_name}</td>
                        <td className="px-4 py-4">
                          {registration.parent_phone}
                          <span className="block text-xs text-navy/55">{registration.parent_email}</span>
                        </td>
                        <td className="px-4 py-4">
                          {registration.preferred_days.join(", ")}
                          <span className="block text-xs text-navy/55">{registration.preferred_period}</span>
                        </td>
                        <td className="px-4 py-4">{registration.course_type}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
