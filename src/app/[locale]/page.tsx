import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { OrderForm } from "@/components/order-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { copy, isLocale, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "Technisches Datenblatt für Importfahrzeuge" : "Technical data sheets for imported vehicles",
    description: locale === "de" ? "Fahrzeugunterlagen sicher einreichen und technische Fahrzeugdaten, FIN-Erklärung und COC-/Typdaten-Prüfergebnis digital erhalten." : "Securely submit vehicle documents and receive structured technical vehicle data digitally.",
    alternates: { canonical: `/${locale}`, languages: { "de-DE": "/de", "en": "/en" } },
  };
}

const faqDe = [
  ["Welche Unterlagen werden benötigt?", "Ein vollständig lesbares ausländisches Zulassungsdokument, ein Fahrzeugfoto und ein scharfes Foto der am Fahrzeug eingeschlagenen FIN."],
  ["Erhalte ich ein Hersteller-COC?", "Nein. Ein Hersteller-COC kann nur vom Hersteller oder einer autorisierten Stelle ausgestellt werden. Wir recherchieren und strukturieren Typ- und Fahrzeugdaten und dokumentieren das Prüfergebnis."],
  ["Wie schnell wird mein Auftrag bearbeitet?", "Vollständige, bezahlte Aufträge werden priorisiert. Die konkrete Bearbeitungszeit hängt von Fahrzeugtyp, Dokumentenqualität und Recherchebedarf ab."],
  ["Sind meine Dokumente öffentlich?", "Nein. Uploads liegen in einem privaten Objektspeicher. Der Abruf erfolgt nur über zeitlich begrenzte, geschützte Links."],
];

const faqEn = [
  ["Which documents are required?", "A fully legible foreign registration document, a vehicle photo and a clear photo of the VIN stamped into the vehicle."],
  ["Will I receive a manufacturer COC?", "No. A manufacturer COC can only be issued by the manufacturer or an authorised body. We research and structure vehicle/type data and document the result."],
  ["How quickly is an order handled?", "Complete and paid orders are prioritised. Timing depends on the vehicle, document quality and the research required."],
  ["Are my documents public?", "No. Uploads remain in private object storage and are accessed only through protected, short-lived links."],
];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const t = copy[locale];
  const de = locale === "de";
  const faq = de ? faqDe : faqEn;
  const structuredData = {
    "@context": "https://schema.org", "@graph": [
      { "@type": "Organization", name: SITE.operator, url: "https://technisches-datenblatt.de", address: { "@type": "PostalAddress", streetAddress: "Marienborner Straße 49", postalCode: "55128", addressLocality: "Mainz", addressCountry: "DE" }, email: SITE.email, telephone: SITE.phone },
      { "@type": "Service", name: de ? "Technisches Datenblatt und COC-/Typdatenservice" : "Technical data sheet and COC/type data service", provider: { "@type": "Organization", name: SITE.operator }, areaServed: "DE", offers: { "@type": "Offer", price: "24.99", priceCurrency: "EUR", availability: "https://schema.org/InStock" } },
      { "@type": "FAQPage", mainEntity: faq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <SiteHeader locale={locale} />
    <main>
      <section className="hero" id="top">
        <div className="hero-copy"><span className="kicker"><i />{t.hero.kicker}</span><h1>{t.hero.titleA}<br/><em>{t.hero.titleB}</em></h1><p>{t.hero.text}</p><div className="button-row"><a className="button primary" href="#auftrag">{t.hero.primary}<Icon name="arrow" /></a><a className="button ghost" href="#ablauf">{t.hero.secondary}</a></div><div className="trust"><span><Icon name="shield" size={17}/>{de ? "Private Dokumentenablage" : "Private document storage"}</span><span><Icon name="check" size={17}/>{de ? "Klare Leistungsabgrenzung" : "Clearly defined service"}</span><span><Icon name="check" size={17}/>{de ? "Nachvollziehbarer Status" : "Transparent status"}</span></div></div>
        <div className="hero-visual" aria-label={de ? "Vorschau eines technischen Datenblatts" : "Technical data sheet preview"}><div className="visual-top"><span>TD / VEHICLE DATA</span><span>01 — 03</span></div><div className="visual-vin"><small>VEHICLE IDENTIFICATION NUMBER</small><strong>WVW •••••••• 386752</strong></div><div className="visual-grid"><div><small>{de ? "Hersteller" : "Make"}</small><b>Volkswagen</b></div><div><small>{de ? "Baureihe" : "Series"}</small><b>Typ 1J</b></div><div><small>{de ? "Leistung" : "Power"}</small><b>110 kW</b></div><div><small>{de ? "Kraftstoff" : "Fuel"}</small><b>Diesel</b></div></div><div className="visual-seal"><Icon name="check" size={25}/><span>{de ? "DATEN STRUKTURIERT" : "DATA STRUCTURED"}</span></div></div>
      </section>

      <section className="marquee" aria-label="Leistungsübersicht"><div>{["COC RESEARCH", "TECHNICAL DATA", "VIN REVIEW", "PRIVATE STORAGE", "COC RESEARCH", "TECHNICAL DATA"].map((item, i) => <span key={`${item}-${i}`}>{item}<i>↗</i></span>)}</div></section>

      <section className="section services" id="leistung"><div className="section-heading"><span className="kicker">01 / {de ? "Leistung" : "Service"}</span><h2>{de ? "Drei Ergebnisse. Ein sauberer Auftrag." : "Three results. One clear order."}</h2><p>{de ? "Wir verbinden sichere Dokumentenannahme mit strukturierter Fahrzeugdaten-Recherche und einem transparenten Bearbeitungsstatus." : "Secure document intake, structured vehicle-data research and transparent order tracking in one workflow."}</p></div><div className="service-grid">
        <article><span>01</span><Icon name="file" size={30}/><h3>{de ? "Technisches Datenblatt" : "Technical data sheet"}</h3><p>{de ? "Relevante Fahrzeug- und Typdaten werden übersichtlich und nachvollziehbar aufbereitet." : "Relevant vehicle and type data is presented in a structured, traceable format."}</p></article>
        <article><span>02</span><Icon name="shield" size={30}/><h3>{de ? "FIN-Erklärung" : "VIN declaration"}</h3><p>{de ? "Die von dir am Fahrzeug geprüfte, eingeschlagene FIN wird auftragsbezogen dokumentiert." : "The stamped VIN you checked on the vehicle is documented for the order."}</p></article>
        <article><span>03</span><Icon name="check" size={30}/><h3>{de ? "COC-/Typdaten-Prüfung" : "COC/type-data review"}</h3><p>{de ? "Vorhandene Unterlagen und verfügbare Typinformationen werden fachlich eingeordnet – ohne ein Hersteller-COC zu imitieren." : "Available documents and type information are reviewed without imitating a manufacturer-issued COC."}</p></article>
      </div></section>

      <section className="process" id="ablauf"><div className="process-intro"><span className="kicker light">02 / {de ? "Ablauf" : "Process"}</span><h2>{de ? "Vom Upload bis zum Ergebnis." : "From upload to result."}</h2><p>{de ? "Jeder Schritt bleibt nachvollziehbar. Der Statuslink funktioniert ohne Kundenkonto und enthält einen separaten, geheimen Zugriffscode." : "Every step remains transparent. The status link works without an account and contains a separate secret access token."}</p></div><ol><li><b>01</b><div><h3>{de ? "Unterlagen vorbereiten" : "Prepare documents"}</h3><p>{de ? "Zulassungsdokument, Gesamtansicht und eingeschlagene FIN fotografieren." : "Photograph the registration document, the vehicle and its stamped VIN."}</p></div></li><li><b>02</b><div><h3>{de ? "Sicher einreichen" : "Submit securely"}</h3><p>{de ? "Kontaktdaten ergänzen, Hinweise lesen und Dateien geschützt übertragen." : "Add contact details, review the notices and transfer files securely."}</p></div></li><li><b>03</b><div><h3>{de ? "Prüfung & Recherche" : "Review & research"}</h3><p>{de ? "Die Sachbearbeitung prüft Lesbarkeit, Zuordnung und verfügbare Typdaten." : "Our team checks legibility, attribution and available type data."}</p></div></li><li><b>04</b><div><h3>{de ? "Ergebnisse abrufen" : "Retrieve results"}</h3><p>{de ? "Freigegebene Dokumente erscheinen im geschützten Auftragsstatus." : "Approved documents become available in the protected order status."}</p></div></li></ol></section>

      <section className="section evidence"><div className="section-heading"><span className="kicker">03 / {de ? "Nachweise" : "Evidence"}</span><h2>{de ? "Drei klare Aufnahmen genügen." : "Three clear files are enough."}</h2></div><div className="evidence-grid"><article><b>01</b><div className="evidence-placeholder registration"><span>EU</span><i/><i/><i/></div><h3>{de ? "Zulassungsdokument" : "Registration document"}</h3><p>{de ? "Alle Seiten, Ränder und Einträge vollständig lesbar." : "All pages, edges and entries fully legible."}</p></article><article><b>02</b><div className="evidence-placeholder car"><span/><span/><i/><i/></div><h3>{de ? "Fahrzeugfoto" : "Vehicle photo"}</h3><p>{de ? "Gesamtansicht bei gutem Licht, ohne starke Unschärfe." : "A full view in good light, without significant blur."}</p></article><article><b>03</b><div className="evidence-placeholder vin"><small>VIN</small><strong>WVWZZZ1JZ3W386752</strong></div><h3>{de ? "Eingeschlagene FIN" : "Stamped VIN"}</h3><p>{de ? "Direkt am Fahrzeug aufgenommen und vollständig erkennbar." : "Photographed directly on the vehicle and fully visible."}</p></article></div></section>

      <section className="order-section" id="auftrag"><div className="order-copy"><span className="kicker light">04 / {de ? "Auftrag" : "Order"}</span><h2>{de ? "Bereit, wenn deine Unterlagen es sind." : "Ready when your documents are."}</h2><p>{de ? "Die drei Dateien dürfen zusammen höchstens 20 MB groß sein. Zulässig sind PDF, JPG und PNG; Fahrzeug- und FIN-Nachweis müssen Fotos sein." : "The three files may total up to 20 MB. PDF, JPG and PNG are accepted; vehicle and VIN evidence must be photos."}</p><div className="price-card"><small>{de ? "Komplettpaket" : "Complete package"}</small><strong>{SITE.price}</strong><span>{de ? "einmalig · inkl. MwSt." : "one-off · VAT included"}</span><ul><li><Icon name="check"/> {de ? "Alle drei Ergebnisdokumente" : "All three result documents"}</li><li><Icon name="check"/> {de ? "Privater Statuszugang" : "Private status access"}</li><li><Icon name="check"/> {de ? "Persönliche Sachbearbeitung" : "Handled by our team"}</li></ul></div></div><OrderForm locale={locale} /></section>

      <section className="section knowledge" id="wissen"><div className="section-heading"><span className="kicker">05 / {de ? "Wissen" : "Knowledge"}</span><h2>{de ? "Besser vorbereitet importieren." : "Import with better information."}</h2></div><div className="knowledge-grid"><Link href={`/${locale}/wissen/technisches-datenblatt-importfahrzeug`}><small>6 MIN</small><h3>{de ? "Technisches Datenblatt für Importfahrzeuge" : "Technical data sheets for imported vehicles"}</h3><span>{de ? "Grundlagen lesen" : "Read the guide"}<Icon name="arrow"/></span></Link><Link href={`/${locale}/wissen/coc-papiere`}><small>5 MIN</small><h3>{de ? "COC-Papiere: Original, Ersatz und Datenrecherche" : "COC papers: originals, replacement and data research"}</h3><span>{de ? "Unterschiede verstehen" : "Understand the differences"}<Icon name="arrow"/></span></Link><Link href={`/${locale}/wissen/fin-fahrgestellnummer`}><small>4 MIN</small><h3>{de ? "FIN richtig finden und fotografieren" : "How to find and photograph a VIN"}</h3><span>{de ? "Fehler vermeiden" : "Avoid mistakes"}<Icon name="arrow"/></span></Link></div></section>

      <section className="section faq"><div className="section-heading"><span className="kicker">06 / FAQ</span><h2>{de ? "Kurz und eindeutig beantwortet." : "Clear answers, without detours."}</h2></div><div className="faq-list">{faq.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
    </main>
    <SiteFooter locale={locale}/>
  </>;
}

