import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { hasAdminSession } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Backoffice-Anmeldung", robots: { index: false, follow: false } };

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound(); if (await hasAdminSession()) redirect(`/${locale}/app`);
  return <main className="login-page"><section className="login-card"><Link className="brand" href={`/${locale}`}><span>TD</span><b>technisches-datenblatt.de</b></Link><div><span className="kicker">Interner Bereich</span><h1>Willkommen zurück.</h1><p>Dieses Backoffice ist ausschließlich für autorisierte Mitarbeitende vorgesehen.</p></div><AdminLogin locale={locale}/></section><aside><span>PRIVATE / ADMIN</span><div><small>Sicherer Zugriff</small><strong>Aufträge.<br/>Dokumente.<br/>Status.</strong></div></aside></main>;
}

