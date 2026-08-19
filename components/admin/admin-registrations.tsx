"use client";

import { Activity, Download, KeyRound, Loader2, LogOut, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  status: string;
  created_at: string;
};

export function AdminRegistrations() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [registrations, setRegistrations] = useState<StoredRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [error, setError] = useState("");
  const [healthResult, setHealthResult] = useState("");

  const count = useMemo(() => registrations.length, [registrations]);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/admin/session");
        const result = (await response.json()) as { authenticated?: boolean };
        setIsAuthenticated(Boolean(result.authenticated));
      } finally {
        setIsCheckingSession(false);
      }
    }

    void checkSession();
  }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "Connexion impossible.");
      }

      setPassword("");
      setIsAuthenticated(true);
      await loadRegistrations();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Erreur inattendue.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
    setRegistrations([]);
    setHealthResult("");
  }

  async function loadRegistrations() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/registrations");
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
        credentials: "same-origin"
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

  async function checkSupabaseHealth() {
    setIsCheckingHealth(true);
    setError("");
    setHealthResult("");
    try {
      const response = await fetch("/api/admin/supabase-health");
      const result = (await response.json()) as unknown;
      setHealthResult(JSON.stringify(result, null, 2));
    } catch (healthError) {
      setError(healthError instanceof Error ? healthError.message : "Erreur inattendue.");
    } finally {
      setIsCheckingHealth(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-navy">
        <div className="flex items-center gap-3 rounded-3xl border border-border bg-white px-5 py-4 shadow-soft">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="font-semibold">Chargement admin...</span>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-navy">
        <form onSubmit={login} className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-premium">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-sm font-bold text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Admin STEMORA
          </div>
          <h1 className="mt-5 text-3xl font-bold">Connexion admin</h1>
          <p className="mt-2 text-sm font-medium leading-6 text-navy/65">
            Entrez le nom d&apos;utilisateur et le mot de passe pour accéder aux inscriptions.
          </p>

          <div className="mt-6 space-y-4">
            <label className="relative block">
              <span className="mb-2 block text-sm font-semibold">Nom d&apos;utilisateur</span>
              <UserRound className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 text-navy/35" />
              <Input value={username} onChange={(event) => setUsername(event.target.value)} className="pl-12" autoComplete="username" />
            </label>
            <label className="relative block">
              <span className="mb-2 block text-sm font-semibold">Mot de passe</span>
              <KeyRound className="pointer-events-none absolute bottom-4 left-4 h-5 w-5 text-navy/35" />
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="pl-12" autoComplete="current-password" />
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={!username || !password || isLoggingIn}>
            {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Se connecter
          </Button>
        </form>
      </main>
    );
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
                Chargez les demandes enregistrées dans Supabase, puis exportez-les en CSV.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl bg-accent/16 px-5 py-4 text-center">
                <p className="text-3xl font-bold">{count}</p>
                <p className="text-sm font-semibold text-navy/65">nouveaux</p>
              </div>
              <Button type="button" variant="secondary" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={loadRegistrations} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Charger
            </Button>
            <Button type="button" variant="accent" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button type="button" variant="secondary" onClick={checkSupabaseHealth} disabled={isCheckingHealth}>
              {isCheckingHealth ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
              Test Supabase
            </Button>
          </div>

          {error && (
            <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {healthResult && (
            <pre className="max-h-80 overflow-auto rounded-2xl border border-border bg-navy p-4 text-xs leading-5 text-white">
              {healthResult}
            </pre>
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

          {registrations.length > 0 && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-navy">Détails complets des inscrits</h2>
                <p className="mt-1 text-sm font-medium text-navy/60">
                  Toutes les informations soumises dans le formulaire d&apos;inscription.
                </p>
              </div>

              <div className="grid gap-4">
                {registrations.map((registration) => (
                  <article key={registration.id} className="rounded-3xl border border-border bg-background/45 p-5">
                    <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 md:flex-row md:items-start">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-primary">Demande #{registration.id.slice(0, 8)}</p>
                        <h3 className="mt-1 text-2xl font-bold text-navy">{registration.child_name}</h3>
                        <p className="mt-1 text-sm font-medium text-navy/60">
                          Reçue le {new Date(registration.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                        {registration.status || "new"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <DetailSection
                        title="Informations de l'enfant"
                        items={[
                          ["Nom", registration.child_name],
                          ["Date de naissance", registration.child_birth_date],
                          ["Âge", registration.child_age ? `${registration.child_age} ans` : "-"],
                          ["Niveau scolaire", registration.school_level],
                          ["Ville / Pays", registration.city_country],
                          ["Niveau programmation", registration.experience_level]
                        ]}
                      />
                      <DetailSection
                        title="Programme"
                        items={[
                          ["Programmes sélectionnés", formatList(registration.selected_programs)]
                        ]}
                      />
                      <DetailSection
                        title="Informations du parent"
                        items={[
                          ["Nom du parent", registration.parent_name],
                          ["Téléphone / WhatsApp", registration.parent_phone],
                          ["Adresse e-mail", registration.parent_email],
                          ["Contact préféré", registration.preferred_contact]
                        ]}
                      />
                      <DetailSection
                        title="Disponibilités et cours"
                        items={[
                          ["Jours préférés", formatList(registration.preferred_days)],
                          ["Période préférée", registration.preferred_period],
                          ["Type de cours", registration.course_type]
                        ]}
                      />
                      <DetailSection
                        title="Consentements"
                        items={[
                          ["Contact inscription", "Accepté"],
                          ["Nouveautés / marketing", registration.marketing_consent ? "Oui" : "Non"]
                        ]}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function DetailSection({ title, items }: { title: string; items: Array<[string, string]> }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-4">
      <h4 className="text-sm font-bold uppercase tracking-wide text-navy/55">{title}</h4>
      <dl className="mt-3 space-y-3">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-bold uppercase tracking-wide text-navy/45">{label}</dt>
            <dd className="mt-1 break-words text-sm font-semibold text-navy">{value || "-"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function formatList(items: string[]) {
  return items.length > 0 ? items.join(", ") : "-";
}
