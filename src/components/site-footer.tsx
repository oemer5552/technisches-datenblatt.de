import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export function SiteFooter({ locale }: { locale: Locale }) {
  return <footer className="site-footer"><div className="footer-main"><Link className="brand inverse" href={`/${locale}`}><span>TD</span><b>{SITE.name}</b></Link><p>{locale === "de" ? "Technische Fahrzeugdaten, nachvollziehbar aufbereitet." : "Vehicle data, prepared with clarity."}</p></div><div className="footer-contact"><b>{SITE.operator}</b><span>{SITE.address}</span><a href={`mailto:${SITE.email}`}>{SITE.email}</a></div><nav aria-label="Rechtliches"><Link href={`/${locale}/impressum`}>Impressum</Link><Link href={`/${locale}/datenschutz`}>{locale === "de" ? "Datenschutz" : "Privacy"}</Link><Link href={`/${locale}/agb`}>{locale === "de" ? "AGB" : "Terms"}</Link><Link href={`/${locale}/widerruf`}>{locale === "de" ? "Widerruf" : "Cancellation"}</Link></nav></footer>;
}

