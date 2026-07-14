import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { OrderForm } from "@/components/order-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { copy, isLocale, type Locale } from "@/lib/i18n";
import { paymentsEnabled } from "@/lib/payments";
import { PRODUCTS, SITE } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const de = locale === "de";
  return {
    title: de ? "Technisches Datenblatt, Typgenehmigungsdaten & FIN-Bestätigung" : "Technical data sheet, type-approval data & VIN confirmation",
    description: de ? "Ein digitales Fahrzeugdatenpaket für 24,99 € inkl. MwSt.: COC-/Typgenehmigungsdaten, technisches Datenblatt und FIN-Bestätigung mit Akzeptanzgarantie." : "One digital vehicle-data package for €24.99 incl. VAT: COC/type-approval data, technical data sheet and VIN confirmation with acceptance guarantee.",
    keywords: de ? ["COC", "COC Papiere", "Datenblatt", "technisches Datenblatt", "Geld zurück Garantie Datenblatt", "Zulassung EU", "ausländisches Fahrzeug in Deutschland zulassen", "deutsches Fahrzeug im EU-Ausland zulassen", "Importfahrzeug Zulassung", "FIN Bestätigung", "Typgenehmigungsdatenblatt"] : ["COC", "technical data sheet", "money-back guarantee", "register vehicle EU", "register imported vehicle Germany", "vehicle registration EU", "VIN confirmation"],
    alternates: { canonical: `/${locale}`, languages: { "de-DE": "/de", "en": "/en" } },
  };
}

const examples = [
  { slug: "coc-typgenehmigungsdatenblatt-muster", de: "COC-/\u200bTypgenehmigungsdatenblatt", en: "COC/type-approval data sheet", textDe: "Zweiseitiges Querformat nach dem tatsächlich verwendeten Typgenehmigungsdaten-Layout.", textEn: "Two-page landscape format based on the type-approval data layout actually used.", width: 1403, height: 993 },
  { slug: "technisches-datenblatt-muster", de: "Technisches Datenblatt", en: "Technical data sheet", textDe: "Zulassungsrelevante Fahrzeugdaten im Feldraster der Zulassungsbescheinigung Teil I.", textEn: "Registration-relevant vehicle data in the field grid of the German registration certificate Part I.", width: 993, height: 1403 },
  { slug: "fin-bestaetigung-muster", de: "FIN-Bestätigung", en: "VIN confirmation", textDe: "Formale Bestätigung der am Fahrzeug abgelesenen Fahrzeug-Identifizierungsnummer.", textEn: "Formal confirmation of the vehicle identification number read from the vehicle.", width: 993, height: 1403 },
] as const;

const exampleAssetVersion = "20260714-reference-v2";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const t = copy[locale];
  const de = locale === "de";
  const paymentActive = paymentsEnabled();
  const structuredData = {
    "@context": "https://schema.org", "@graph": [
      { "@type": "Organization", name: SITE.operator, url: "https://technisches-datenblatt.de", address: { "@type": "PostalAddress", streetAddress: "Marienborner Straße 49", postalCode: "55128", addressLocality: "Mainz", addressCountry: "DE" }, email: SITE.email, telephone: SITE.phone },
      { "@type": "Service", name: de ? "Technisches Datenblatt mit EU-Akzeptanzgarantie" : "Technical data sheet with EU acceptance guarantee", description: de ? "Wird das Datenblatt von der zuständigen Zulassungsstelle in der Europäischen Union nicht als technischer Nachweis akzeptiert, wird der gezahlte Paketpreis nach den Garantiebedingungen erstattet." : "If the competent registration authority in the European Union does not accept the data sheet as technical evidence, the package price paid is refunded under the guarantee terms.", provider: { "@type": "Organization", name: SITE.operator }, areaServed: "European Union", termsOfService: `https://technisches-datenblatt.de/${locale}/garantie`, offers: [
        { "@type": "Offer", name: PRODUCTS.data.name, price: "24.99", priceCurrency: "EUR", availability: "https://schema.org/InStock" },
      ] },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <SiteHeader locale={locale} />
    <main className="compact-home">
      <section className="hero compact-hero" id="top">
        <div className="hero-copy"><span className="kicker"><i />{t.hero.kicker}</span><h1>{t.hero.titleA}<br/><em>{t.hero.titleB}</em></h1><p>{t.hero.text}</p><div className="button-row compact-cta"><a className="button primary" href="#auftrag">{paymentActive ? t.hero.primary : (de ? "Kostenlos testen" : "Test for free")}<Icon name="arrow" /></a><Link href={`/${locale}/garantie`}>{de ? "EU-Garantie" : "EU guarantee"}<Icon name="arrow" size={15}/></Link></div></div>
        <aside className="hero-offer"><div className="offer-label"><span>{de ? "Dörrschuck Fahrzeugdaten-Service" : "Dörrschuck vehicle data service"}</span><b>{paymentActive ? "DIGITAL" : "TESTMODUS"}</b></div><strong>{PRODUCTS.data.price}</strong><small>{de ? "regulärer Endpreis · inkl. MwSt." : "regular total · VAT included"}</small><ul><li><Icon name="check"/>{de ? "COC-/Typgenehmigungsdatenblatt" : "COC/type-approval data sheet"}</li><li><Icon name="check"/>{de ? "Technisches Datenblatt" : "Technical data sheet"}</li><li><Icon name="check"/>{de ? "FIN-Bestätigung" : "VIN confirmation"}</li></ul><div><Icon name={paymentActive ? "shield" : "check"}/><span><b>{paymentActive ? (de ? "Geld-zurück-Garantie" : "Money-back guarantee") : (de ? "Zahlung vorübergehend aus" : "Payment temporarily off")}</b><small>{paymentActive ? (de ? "bei Nichtakzeptanz des Datenblatts" : "if the data sheet is not accepted") : (de ? "Testauftrag direkt anlegen" : "create a test order directly")}</small></span></div></aside>
      </section>

      <section className="compact-route-strip" id="leistung" aria-label={de ? "Zulassungsrichtungen und Garantie" : "Registration directions and guarantee"}><div><small>EU → DE</small><strong>{de ? "Importfahrzeug in Deutschland" : "Imported vehicle in Germany"}</strong></div><div><small>DE → EU</small><strong>{de ? "Deutsches Fahrzeug im EU-Ausland" : "German vehicle elsewhere in the EU"}</strong></div><div><Icon name="shield"/><span><small>{de ? "UNSER USP" : "OUR USP"}</small><strong>{de ? "Akzeptiert oder Geld zurück" : "Accepted or your money back"}</strong></span></div></section>

      <section className="compact-section examples compact-examples" id="beispiele"><div className="compact-heading"><div><span className="kicker">01 / {de ? "Muster" : "Samples"}</span><h2>{de ? "Dokumente ansehen." : "View the documents."}</h2></div></div><div className="example-grid">{examples.map((example) => <article key={example.slug}><a className="example-preview" href={`/beispiele/${example.slug}.pdf?v=${exampleAssetVersion}`} target="_blank" rel="noreferrer"><Image src={`/beispiele/${example.slug}-vorschau.png?v=${exampleAssetVersion}`} alt={`${de ? example.de : example.en} – ${de ? "fiktives Muster" : "fictitious example"}`} width={example.width} height={example.height}/><span>{de ? "MUSTER" : "SAMPLE"}</span></a><div><h3>{de ? example.de : example.en}</h3><a href={`/beispiele/${example.slug}.pdf?v=${exampleAssetVersion}`} target="_blank" rel="noreferrer">PDF<Icon name="arrow"/></a></div></article>)}</div></section>

      <section className="order-section compact-order" id="auftrag"><div className="order-copy"><span className="kicker light">02 / {de ? "Testauftrag" : "Test order"}</span><h2>{paymentActive ? (de ? "Für 24,99 € bestellen." : "Order for €24.99.") : (de ? "Jetzt kostenlos testen." : "Test for free now.")}</h2><p>{paymentActive ? (de ? "FIN, Erstzulassung, EU-Herkunftsland und drei Nachweise – mehr brauchst du nicht." : "VIN, first registration, EU country of origin and three records – nothing more is needed.") : (de ? "Zahlung und Stripe sind vorübergehend deaktiviert. Testauftrag speichern und direkt den Status prüfen." : "Payment and Stripe are temporarily disabled. Save a test order and inspect its status directly.")}</p><Link className="order-guarantee-link" href={`/${locale}/garantie`}><Icon name="shield"/>{de ? "EU-Akzeptanzgarantie" : "EU acceptance guarantee"}<Icon name="arrow"/></Link></div><OrderForm locale={locale} paymentsEnabled={paymentActive} /></section>
    </main>
    <SiteFooter locale={locale}/>
  </>;
}
