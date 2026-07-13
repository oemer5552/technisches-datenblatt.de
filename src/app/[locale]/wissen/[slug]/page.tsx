import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale, locales } from "@/lib/i18n";
import { articles, type ArticleSlug } from "@/lib/knowledge";

export function generateStaticParams() { return locales.flatMap((locale) => Object.keys(articles).map((slug) => ({ locale, slug }))); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params; if (!isLocale(locale) || !(slug in articles)) return {};
  const article = articles[slug as ArticleSlug][locale]; return { title: article.title, description: article.description, alternates: { canonical: `/${locale}/wissen/${slug}`, languages: { "de-DE": `/de/wissen/${slug}`, en: `/en/wissen/${slug}` } } };
}

export default async function KnowledgePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params; if (!isLocale(locale) || !(slug in articles)) notFound(); const article = articles[slug as ArticleSlug][locale];
  return <><SiteHeader locale={locale}/><main className="article-page"><header><span className="kicker">{locale === "de" ? "Wissensbereich" : "Knowledge"}</span><h1>{article.title}</h1><p>{article.intro}</p><div><span>TD / GUIDE</span><span>{locale === "de" ? "Aktualisiert Juli 2026" : "Updated July 2026"}</span></div></header><article>{article.sections.map(([title, content], index) => <section key={title}><span>0{index + 1}</span><div><h2>{title}</h2><p>{content}</p></div></section>)}<aside><b>{locale === "de" ? "Wichtiger Hinweis" : "Important notice"}</b><p>{locale === "de" ? "Dieser Beitrag bietet allgemeine Informationen. Verbindliche Anforderungen legt die jeweils zuständige Zulassungsbehörde oder Prüforganisation fest." : "This article provides general information. Binding requirements are determined by the competent authority or inspection body."}</p></aside><Link className="button primary" href={`/${locale}#auftrag`}>{locale === "de" ? "Auftrag starten" : "Start order"}</Link></article></main><SiteFooter locale={locale}/></>;
}

