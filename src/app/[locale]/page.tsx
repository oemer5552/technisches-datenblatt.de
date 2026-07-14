import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { OrderForm } from "@/components/order-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { copy, isLocale, type Locale } from "@/lib/i18n";
import { PRODUCTS, SITE } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const de = locale === "de";
  return {
    title: de ? "Technisches Datenblatt, COC & HU/AU für Importfahrzeuge" : "Technical data sheets, COC data & vehicle registration",
    description: de ? "Ausländisches Fahrzeug in Deutschland zulassen oder deutsches Fahrzeug im EU-Ausland anmelden: technisches Datenblatt und HU/AU-Paket mit TÜV Hessen für 199 € inkl. MwSt." : "Register a foreign vehicle in Germany or a German vehicle elsewhere in the EU with technical data sheets and a coordinated vehicle inspection package.",
    keywords: de ? ["COC", "COC Papiere", "Datenblatt", "technisches Datenblatt", "ausländisches Fahrzeug in Deutschland zulassen", "deutsches Fahrzeug im EU-Ausland zulassen", "Importfahrzeug Zulassung", "HU AU Importfahrzeug", "FIN Bestätigung", "Typgenehmigungsdatenblatt"] : ["COC", "technical data sheet", "register imported vehicle Germany", "vehicle registration EU", "VIN confirmation"],
    alternates: { canonical: `/${locale}`, languages: { "de-DE": "/de", "en": "/en" } },
  };
}

const faqDe = [
  ["Was ist im 199-€-Gesamtpaket enthalten?", "Das Paket enthält die persönliche Koordination, HU/AU durch TÜV Hessen und ein technisches Datenblatt. Der Preis beträgt einmalig 199,00 € inklusive gesetzlicher Mehrwertsteuer. Nicht enthalten sind Reparaturen, Nachuntersuchungen und Gebühren von Behörden oder Zulassungsdiensten."],
  ["Kann ich damit ein ausländisches Fahrzeug in Deutschland zulassen?", "Wir bereiten die technischen Unterlagen vor und koordinieren im Gesamtpaket HU/AU. Welche Dokumente zusätzlich benötigt werden und ob die Zulassung erteilt wird, entscheidet die zuständige Zulassungsbehörde im Einzelfall."],
  ["Unterstützt ihr deutsche Fahrzeuge bei der Zulassung im EU-Ausland?", "Ja. Wir strukturieren die technischen Fahrzeug- und Typdaten auch für die Vorlage im EU-Ausland. Da die Zulassungsregeln national unterschiedlich sind, sollte die konkrete Unterlagenliste vorher bei der zuständigen Behörde des Ziellands geprüft werden."],
  ["Erhalte ich ein Hersteller-COC?", "Nein. Ein echtes COC wird ausschließlich vom Fahrzeughersteller oder einer autorisierten Stelle ausgestellt. Unser COC-/Typgenehmigungsdatenblatt bereitet verfügbare Typdaten auf und ist als solches klar gekennzeichnet."],
  ["Welche Unterlagen werden benötigt?", "Ein vollständig lesbares Zulassungsdokument, ein Fahrzeugfoto und ein scharfes Foto der direkt am Fahrzeug eingeschlagenen FIN. Für HU/AU vereinbaren wir nach der Unterlagenprüfung einen Termin zur Fahrzeugvorführung."],
  ["Sind meine Dokumente öffentlich?", "Nein. Uploads liegen in einem privaten Objektspeicher. Der Abruf erfolgt nur über geschützte und zeitlich begrenzte Links."],
];

const faqEn = [
  ["What does the €199 package include?", "It includes personal coordination, the HU/AU roadworthiness and emissions test performed by TÜV Hessen, and a technical data sheet. The one-off price is €199.00 including VAT. Repairs, re-tests and authority or registration fees are not included."],
  ["Can you help register a foreign vehicle in Germany?", "We prepare the technical documents and coordinate HU/AU under the package. The competent registration authority decides which additional documents are required and whether registration can be granted."],
  ["Do you support German vehicles being registered elsewhere in the EU?", "Yes. We structure vehicle and type data for use in another EU country. Requirements differ by country, so the destination authority's document list should be checked first."],
  ["Will I receive a manufacturer COC?", "No. A genuine COC can only be issued by the manufacturer or an authorised body. Our COC/type-approval data sheet clearly identifies itself as a technical data compilation."],
  ["Which documents are required?", "A legible registration document, a vehicle photo and a clear photo of the VIN stamped into the vehicle. For HU/AU, we arrange a vehicle appointment after reviewing the documents."],
  ["Are my documents public?", "No. Uploads remain in private object storage and are accessed only through protected, short-lived links."],
];

const examples = [
  { slug: "coc-typgenehmigungsdatenblatt-muster", de: "COC-/Typgenehmigungsdatenblatt", en: "COC/type-approval data sheet", textDe: "Strukturierte Typgenehmigungsdaten mit klarer Abgrenzung zum Hersteller-COC.", textEn: "Structured type-approval data, clearly distinguished from a manufacturer COC." },
  { slug: "technisches-datenblatt-muster", de: "Technisches Datenblatt", en: "Technical data sheet", textDe: "Zulassungsrelevante Fahrzeugdaten in übersichtlicher Feldstruktur.", textEn: "Registration-relevant vehicle data in a clear field structure." },
  { slug: "fin-bestaetigung-muster", de: "FIN-Bestätigung", en: "VIN confirmation", textDe: "Dokumentation der am Fahrzeug abgelesenen Fahrzeug-Identifizierungsnummer.", textEn: "Documentation of the vehicle identification number read from the vehicle." },
] as const;

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
      { "@type": "Service", name: de ? "Technisches Datenblatt und Zulassungsservice für Import- und Exportfahrzeuge" : "Technical data and registration support for imported and exported vehicles", provider: { "@type": "Organization", name: SITE.operator }, areaServed: ["DE", "EU"], offers: [
        { "@type": "Offer", name: PRODUCTS.registration.name, price: "199.00", priceCurrency: "EUR", availability: "https://schema.org/InStock" },
        { "@type": "Offer", name: PRODUCTS.data.name, price: "24.99", priceCurrency: "EUR", availability: "https://schema.org/InStock" },
      ] },
      { "@type": "FAQPage", mainEntity: faq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <SiteHeader locale={locale} />
    <main>
      <section className="hero" id="top">
        <div className="hero-copy"><span className="kicker"><i />{t.hero.kicker}</span><h1>{t.hero.titleA}<br/><em>{t.hero.titleB}</em></h1><p>{t.hero.text}</p><div className="button-row"><a className="button primary" href="#auftrag">{t.hero.primary}<Icon name="arrow" /></a><a className="button ghost" href="#ablauf">{t.hero.secondary}</a></div><div className="trust"><span><Icon name="check" size={17}/>{de ? "199 € inkl. MwSt." : "€199 incl. VAT"}</span><span><Icon name="shield" size={17}/>{de ? "HU/AU durch TÜV Hessen" : "HU/AU by TÜV Hessen"}</span><span><Icon name="check" size={17}/>{de ? "Deutschland ↔ EU" : "Germany ↔ EU"}</span></div></div>
        <div className="hero-visual" aria-label={de ? "Vorschau eines technischen Datenblatts" : "Technical data sheet preview"}><div className="visual-top"><span>TD / VEHICLE DATA</span><span>01 — 03</span></div><div className="visual-vin"><small>VEHICLE IDENTIFICATION NUMBER</small><strong>WVW •••••••• 386752</strong></div><div className="visual-grid"><div><small>{de ? "Hersteller" : "Make"}</small><b>Volkswagen</b></div><div><small>{de ? "Baureihe" : "Series"}</small><b>Typ 1J</b></div><div><small>{de ? "Leistung" : "Power"}</small><b>110 kW</b></div><div><small>{de ? "Kraftstoff" : "Fuel"}</small><b>Diesel</b></div></div><div className="visual-seal"><Icon name="check" size={25}/><span>{de ? "DATEN STRUKTURIERT" : "DATA STRUCTURED"}</span></div></div>
      </section>

      <section className="route-band" aria-label={de ? "Zulassungsrichtungen" : "Registration directions"}><div><small>EU → DE</small><strong>{de ? "Ausländisches Fahrzeug in Deutschland zulassen" : "Register a foreign vehicle in Germany"}</strong></div><i>↔</i><div><small>DE → EU</small><strong>{de ? "Deutsches Fahrzeug im EU-Ausland zulassen" : "Register a German vehicle elsewhere in the EU"}</strong></div></section>

      <section className="marquee" aria-label={de ? "Leistungsübersicht" : "Service overview"}><div>{["COC DATA", "TECHNISCHES DATENBLATT", "HU / AU", "FIN-BESTÄTIGUNG", "COC DATA", "TECHNISCHES DATENBLATT", "HU / AU", "FIN-BESTÄTIGUNG"].map((item, i) => <span key={`${item}-${i}`}>{item}<i>↗</i></span>)}</div></section>

      <section className="section services" id="leistung"><div className="section-heading"><span className="kicker">01 / {de ? "Unterlagen" : "Documents"}</span><h2>{de ? "Technische Klarheit für die nächste Zulassungsstelle." : "Technical clarity for the next registration authority."}</h2><p>{de ? "Wir übersetzen verstreute Fahrzeugdaten in einen nachvollziehbaren Dokumentensatz – für Import nach Deutschland und Zulassung deutscher Fahrzeuge im EU-Ausland." : "We turn scattered vehicle data into a traceable document set for imports into Germany and German vehicles moving elsewhere in the EU."}</p></div><div className="service-grid">
        <article><span>01</span><Icon name="file" size={30}/><h3>{de ? "Technisches Datenblatt" : "Technical data sheet"}</h3><p>{de ? "Relevante Fahrzeug- und Typdaten werden übersichtlich und nachvollziehbar aufbereitet." : "Relevant vehicle and type data is presented in a structured, traceable format."}</p></article>
        <article><span>02</span><Icon name="shield" size={30}/><h3>{de ? "FIN-Bestätigung" : "VIN confirmation"}</h3><p>{de ? "Die von dir am Fahrzeug geprüfte, eingeschlagene FIN wird auftragsbezogen dokumentiert." : "The stamped VIN you checked on the vehicle is documented for the order."}</p></article>
        <article><span>03</span><Icon name="check" size={30}/><h3>{de ? "COC-/Typgenehmigungsdaten" : "COC/type-approval data"}</h3><p>{de ? "Verfügbare Typinformationen werden fachlich eingeordnet – klar getrennt von einem Hersteller-COC." : "Available type information is reviewed and clearly distinguished from a manufacturer-issued COC."}</p></article>
      </div></section>

      <section className="bundle-section"><div className="bundle-price"><small>{de ? "Gesamtpaket" : "Complete package"}</small><strong>199<span>€</span></strong><p>{de ? "einmalig · inklusive MwSt." : "one-off · VAT included"}</p></div><div className="bundle-copy"><span className="kicker light">02 / {de ? "Unser USP" : "Our USP"}</span><h2>{de ? "HU/AU und Datenblatt. Ein Ansprechpartner." : "Inspection and data sheet. One point of contact."}</h2><p>{de ? "Wir prüfen deine Unterlagen, erstellen das technische Datenblatt und koordinieren die HU/AU in Kooperation mit TÜV Hessen. Das Fahrzeug wird nach der Vorprüfung zu einem abgestimmten Termin vorgestellt." : "We review your documents, prepare the technical data sheet and coordinate HU/AU in cooperation with TÜV Hessen. The vehicle is presented at an agreed appointment after the initial review."}</p><ul><li><Icon name="check"/> {de ? "HU/AU durch TÜV Hessen" : "HU/AU by TÜV Hessen"}</li><li><Icon name="check"/> {de ? "Technisches Datenblatt inklusive" : "Technical data sheet included"}</li><li><Icon name="check"/> {de ? "Persönliche Termin- und Unterlagenkoordination" : "Personal appointment and document coordination"}</li></ul><small>{de ? "Reparaturen, Nachuntersuchungen und behördliche Gebühren sind nicht enthalten. Das Bestehen der HU/AU und die Zulassung können nicht garantiert werden." : "Repairs, re-tests and authority fees are not included. Passing the inspection and obtaining registration cannot be guaranteed."}</small></div></section>

      <section className="process" id="ablauf"><div className="process-intro"><span className="kicker light">03 / {de ? "Ablauf" : "Process"}</span><h2>{de ? "Von den Papieren bis zur Prüfung." : "From paperwork to inspection."}</h2><p>{de ? "Ein klarer Ablauf reduziert Rückfragen und macht den Fortschritt jederzeit nachvollziehbar." : "A clear workflow reduces questions and keeps progress transparent."}</p></div><ol><li><b>01</b><div><h3>{de ? "Unterlagen hochladen" : "Upload documents"}</h3><p>{de ? "Zulassungsdokument, Fahrzeugansicht und eingeschlagene FIN sicher übermitteln." : "Securely submit the registration paper, vehicle view and stamped VIN."}</p></div></li><li><b>02</b><div><h3>{de ? "Daten prüfen" : "Review the data"}</h3><p>{de ? "Wir prüfen Zuordnung, Lesbarkeit und verfügbare Typgenehmigungsdaten." : "We review attribution, legibility and available type-approval data."}</p></div></li><li><b>03</b><div><h3>{de ? "Datenblatt erstellen" : "Prepare the data sheet"}</h3><p>{de ? "Die technischen Daten werden strukturiert und fahrzeugbezogen dokumentiert." : "Technical data is structured and documented for the vehicle."}</p></div></li><li><b>04</b><div><h3>{de ? "HU/AU koordinieren" : "Coordinate HU/AU"}</h3><p>{de ? "Beim Gesamtpaket stimmen wir die Fahrzeugvorführung mit dir ab; die Prüfung erfolgt durch TÜV Hessen." : "For the complete package, we arrange the vehicle appointment; TÜV Hessen performs the inspection."}</p></div></li></ol></section>

      <section className="section examples" id="beispiele"><div className="section-heading"><span className="kicker">04 / {de ? "Beispiele" : "Examples"}</span><h2>{de ? "So sehen die Ergebnisdokumente aus." : "See what the result documents look like."}</h2><p>{de ? "Die Muster enthalten ausschließlich fiktive Daten und sind nicht zur Vorlage bei Behörden oder Prüfstellen bestimmt." : "The examples contain fictitious data only and are not intended for submission to authorities or inspection bodies."}</p></div><div className="example-grid">{examples.map((example) => <article key={example.slug}><a className="example-preview" href={`/beispiele/${example.slug}.pdf`} target="_blank" rel="noreferrer"><Image src={`/beispiele/${example.slug}-vorschau.png`} alt={`${de ? example.de : example.en} – ${de ? "anonymisiertes Muster" : "anonymised example"}`} width={993} height={1404}/><span>{de ? "MUSTER · NICHT ZUR VORLAGE" : "SAMPLE · NOT FOR SUBMISSION"}</span></a><div><small>PDF · {de ? "MUSTER" : "SAMPLE"}</small><h3>{de ? example.de : example.en}</h3><p>{de ? example.textDe : example.textEn}</p><a href={`/beispiele/${example.slug}.pdf`} target="_blank" rel="noreferrer">{de ? "Muster-PDF ansehen" : "View sample PDF"}<Icon name="arrow"/></a></div></article>)}</div></section>

      <section className="order-section" id="auftrag"><div className="order-copy"><span className="kicker light">05 / {de ? "Auftrag" : "Order"}</span><h2>{de ? "Welches Paket passt zu deinem Fahrzeug?" : "Which package fits your vehicle?"}</h2><p>{de ? "Wähle das vollständige Zulassungspaket oder nur die digitale Datenaufbereitung. Die drei Uploads dürfen zusammen höchstens 20 MB groß sein." : "Choose the complete registration package or digital data preparation only. The three uploads may total up to 20 MB."}</p><div className="price-card featured"><small>{de ? "Zulassungspaket · empfohlen" : "Registration package · recommended"}</small><strong>{PRODUCTS.registration.price}</strong><span>{de ? "einmalig · inkl. MwSt." : "one-off · VAT included"}</span><ul><li><Icon name="check"/> {de ? "HU/AU durch TÜV Hessen" : "HU/AU by TÜV Hessen"}</li><li><Icon name="check"/> {de ? "Technisches Datenblatt" : "Technical data sheet"}</li><li><Icon name="check"/> {de ? "Persönliche Koordination" : "Personal coordination"}</li></ul></div><div className="price-card compact"><small>{de ? "Nur digitale Unterlagen" : "Digital documents only"}</small><strong>{PRODUCTS.data.price}</strong><span>{de ? "einmalig · inkl. MwSt." : "one-off · VAT included"}</span></div></div><OrderForm locale={locale} /></section>

      <section className="section knowledge" id="wissen"><div className="section-heading"><span className="kicker">06 / {de ? "Wissen" : "Knowledge"}</span><h2>{de ? "Zulassung besser vorbereitet angehen." : "Prepare for registration with confidence."}</h2></div><div className="knowledge-grid"><Link href={`/${locale}/wissen/auslaendisches-fahrzeug-in-deutschland-zulassen`}><small>8 MIN</small><h3>{de ? "Ausländisches Fahrzeug in Deutschland zulassen" : "Register a foreign vehicle in Germany"}</h3><span>{de ? "Checkliste lesen" : "Read the checklist"}<Icon name="arrow"/></span></Link><Link href={`/${locale}/wissen/deutsches-fahrzeug-im-eu-ausland-zulassen`}><small>7 MIN</small><h3>{de ? "Deutsches Fahrzeug im EU-Ausland zulassen" : "Register a German vehicle elsewhere in the EU"}</h3><span>{de ? "Ablauf verstehen" : "Understand the process"}<Icon name="arrow"/></span></Link><Link href={`/${locale}/wissen/coc-papiere`}><small>5 MIN</small><h3>{de ? "COC-Papiere: Original, Ersatz und Typdaten" : "COC papers: originals, replacement and type data"}</h3><span>{de ? "Unterschiede verstehen" : "Understand the differences"}<Icon name="arrow"/></span></Link><Link href={`/${locale}/wissen/technisches-datenblatt-importfahrzeug`}><small>6 MIN</small><h3>{de ? "Technisches Datenblatt für Importfahrzeuge" : "Technical data sheets for imported vehicles"}</h3><span>{de ? "Grundlagen lesen" : "Read the guide"}<Icon name="arrow"/></span></Link><Link href={`/${locale}/wissen/fin-fahrgestellnummer`}><small>4 MIN</small><h3>{de ? "FIN richtig finden und fotografieren" : "How to find and photograph a VIN"}</h3><span>{de ? "Fehler vermeiden" : "Avoid mistakes"}<Icon name="arrow"/></span></Link></div></section>

      <section className="section faq"><div className="section-heading"><span className="kicker">07 / FAQ</span><h2>{de ? "Kurz und eindeutig beantwortet." : "Clear answers, without detours."}</h2></div><div className="faq-list">{faq.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
    </main>
    <SiteFooter locale={locale}/>
  </>;
}
