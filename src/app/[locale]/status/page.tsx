import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StatusClient } from "@/components/status-client";
import { isLocale } from "@/lib/i18n";
import { paymentsEnabled } from "@/lib/payments";

export const metadata: Metadata = { title: "Auftragsstatus", description: "Status und Ergebnisdokumente eines Auftrags geschützt abrufen.", robots: { index: false, follow: false } };

export default async function StatusPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  return <><SiteHeader locale={locale}/><main className="status-page"><div className="status-intro"><span>STATUS / SECURE</span><h1>{locale === "de" ? "Dein Auftrag. Sicher im Blick." : "Your order. Securely in view."}</h1></div><Suspense fallback={<div className="status-card">Laden …</div>}><StatusClient locale={locale} paymentsEnabled={paymentsEnabled()}/></Suspense></main><SiteFooter locale={locale}/></>;
}
