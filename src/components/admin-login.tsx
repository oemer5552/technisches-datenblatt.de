"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

export function AdminLogin({ locale }: { locale: Locale }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const password = String(new FormData(event.currentTarget).get("password") || ""); const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) }); const result = await response.json(); if (!response.ok) { setError(result.error || "Anmeldung fehlgeschlagen"); setBusy(false); return; } router.replace(`/${locale}/app`); router.refresh(); }
  return <form className="login-form" onSubmit={submit}><label><span>Admin-Passwort</span><input name="password" type="password" autoComplete="current-password" required autoFocus/></label>{error && <div className="notice error" role="alert">{error}</div>}<button className="button primary submit" disabled={busy}>{busy ? "Anmeldung …" : "Sicher anmelden"}</button><small>Die Sitzung endet automatisch nach acht Stunden.</small></form>;
}

