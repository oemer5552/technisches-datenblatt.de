"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function AdminShell({ locale, title, children }: { locale: Locale; title: string; children: React.ReactNode }) {
  const router = useRouter();
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace(`/${locale}/app/login`); router.refresh(); }
  return <main className="admin-page"><header className="admin-header"><Link className="brand" href={`/${locale}/app`}><span>TD</span><b>Backoffice</b></Link><div><Link href={`/${locale}`}>Website</Link><button type="button" onClick={logout}>Abmelden</button></div></header><div className="admin-title"><span className="kicker">Geschützter Bereich</span><h1>{title}</h1></div>{children}</main>;
}

