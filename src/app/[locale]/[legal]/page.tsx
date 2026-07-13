import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalContent, legalTitles, type LegalSlug } from "@/components/legal-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale, locales } from "@/lib/i18n";

export function generateStaticParams() { return locales.flatMap((locale) => Object.keys(legalTitles).map((legal) => ({ locale, legal }))); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; legal: string }> }): Promise<Metadata> {
  const { locale, legal } = await params; if (!isLocale(locale) || !(legal in legalTitles)) return {};
  return { title: legalTitles[legal as LegalSlug], alternates: { canonical: `/de/${legal}`, languages: { "de-DE": `/de/${legal}`, en: `/en/${legal}` } } };
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; legal: string }> }) {
  const { locale, legal } = await params; if (!isLocale(locale) || !(legal in legalTitles)) notFound(); const slug = legal as LegalSlug;
  return <><SiteHeader locale={locale}/><main className="legal-page"><header><Link href={`/${locale}`}>← {locale === "de" ? "Zur Startseite" : "Back home"}</Link><span className="kicker">LEGAL / 2026</span><h1>{legalTitles[slug]}</h1><p>Stand: 13. Juli 2026</p></header><article className="legal-content"><LegalContent slug={slug} locale={locale}/></article></main><SiteFooter locale={locale}/></>;
}

