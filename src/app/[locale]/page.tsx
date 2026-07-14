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
    title: de ? "Technisches Datenblatt, Typgenehmigungsdaten & FIN-Bestätigung" : "Technical data sheet, type-approval data & VIN confirmation",
    description: de ? "Ein digitales Fahrzeugdatenpaket für 24,99 € inkl. MwSt.: COC-/Typgenehmigungsdaten, technisches Datenblatt und FIN-Bestätigung mit Akzeptanzgarantie." : "One digital vehicle-data package for €24.99 incl. VAT: COC/type-approval data, technical data sheet and VIN confirmation with acceptance guarantee.",
    keywords: de ? ["COC", "COC Papiere", "Datenblatt", "technisches Datenblatt", "Geld zurück Garantie Datenblatt", "Zulassung EU", "ausländisches Fahrzeug in Deutschland zulassen", "deutsches Fahrzeug im EU-Ausland zulassen", "Importfahrzeug Zulassung", "FIN Bestätigung", "Typgenehmigungsdatenblatt"] : ["COC", "technical data sheet", "money-back guarantee", "register vehicle EU", "register imported vehicle Germany", "vehicle registration EU", "VIN confirmation"],
    alternates: { canonical: `/${locale}`, languages: { "de-DE": "/de", "en": "/en" } },
  };
}

const faqDe = [
  ["Was bedeutet die Geld-zurück-Garantie?", "Lehnt eine zuständige Zulassungsstelle in der Europäischen Union unser unverändertes technisches Datenblatt als technischen Nachweis für das beauftragte Fahrzeug ab, erstatten wir den vollständigen gezahlten Preis des betroffenen Auftrags. Dafür benötigen wir innerhalb von 90 Tagen nach Dokumentbereitstellung den schriftlichen Ablehnungsnachweis. Andere Zulassungshindernisse sind nicht umfasst."],
  ["Was ist im 24,99-€-Paket enthalten?", "Du erhältst ein COC-/Typgenehmigungsdatenblatt, ein technisches Datenblatt und eine FIN-Bestätigung als digitale Dokumente. Der einmalige Endpreis beträgt 24,99 € inklusive gesetzlicher Mehrwertsteuer."],
  ["Kann ich damit ein ausländisches Fahrzeug in Deutschland zulassen?", "Die Dokumente bereiten technische Fahrzeug- und Typdaten für das Zulassungsverfahren auf. Ob weitere Nachweise, eine HU/AU oder eine Einzelbegutachtung erforderlich sind und ob die Zulassung erteilt wird, entscheidet die zuständige Behörde beziehungsweise Prüfstelle im Einzelfall."],
  ["Unterstützt ihr deutsche Fahrzeuge bei der Zulassung im EU-Ausland?", "Ja. Wir strukturieren die technischen Fahrzeug- und Typdaten auch für die Vorlage im EU-Ausland. Da die Zulassungsregeln national unterschiedlich sind, sollte die konkrete Unterlagenliste vorher bei der zuständigen Behörde des Ziellands geprüft werden."],
  ["Erhalte ich ein Hersteller-COC?", "Nein. Ein echtes COC wird ausschließlich vom Fahrzeughersteller oder einer autorisierten Stelle ausgestellt. Unser COC-/Typgenehmigungsdatenblatt bereitet verfügbare Typdaten auf und ist als solches klar gekennzeichnet."],
  ["Welche Unterlagen werden benötigt?", "Wir benötigen ein vollständig lesbares Zulassungsdokument, ein Fahrzeugfoto und ein scharfes Foto der direkt am Fahrzeug eingeschlagenen FIN. Je besser die Unterlagen lesbar sind, desto eindeutiger lassen sich Fahrzeug und Typdaten zuordnen."],
  ["Führt ihr HU/AU oder die Zulassung durch?", "Nein. Das einzige angebotene Produkt ist das digitale Fahrzeugdatenpaket. HU/AU, Fahrzeugvorführung, Behördengänge und Zulassungsgebühren sind nicht Bestandteil des Angebots."],
  ["Sind meine Dokumente öffentlich?", "Nein. Uploads liegen in einem privaten Objektspeicher. Der Abruf erfolgt nur über geschützte und zeitlich begrenzte Links."],
];

const faqEn = [
  ["What does the money-back guarantee cover?", "If a competent registration authority in the European Union rejects our unaltered technical data sheet as technical evidence for the commissioned vehicle, we refund the full price paid for that order. We need written evidence of the rejection within 90 days after delivery. Other obstacles to registration are not covered."],
  ["What does the €24.99 package include?", "You receive a COC/type-approval data sheet, a technical data sheet and a VIN confirmation as digital documents. The one-off total price is €24.99 including VAT."],
  ["Can the documents help register a foreign vehicle in Germany?", "The documents structure technical vehicle and type data for the registration process. The competent authority or inspection body decides whether further evidence, HU/AU or an individual inspection is required and whether registration can be granted."],
  ["Do you support German vehicles being registered elsewhere in the EU?", "Yes. We structure vehicle and type data for use in another EU country. Requirements differ by country, so the destination authority's document list should be checked first."],
  ["Will I receive a manufacturer COC?", "No. A genuine COC can only be issued by the manufacturer or an authorised body. Our COC/type-approval data sheet clearly identifies itself as a technical data compilation."],
  ["Which documents are required?", "We need a legible registration document, a vehicle photo and a clear photo of the VIN stamped into the vehicle. Clear records make the vehicle and type-data attribution more reliable."],
  ["Do you perform HU/AU or registration?", "No. The only product offered is the digital vehicle-data package. HU/AU, vehicle appointments, authority visits and registration fees are not part of the service."],
  ["Are my documents public?", "No. Uploads remain in private object storage and are accessed only through protected, short-lived links."],
];

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
  const faq = de ? faqDe : faqEn;
  const visibleFaq = faq.slice(0, 3);
  const structuredData = {
    "@context": "https://schema.org", "@graph": [
      { "@type": "Organization", name: SITE.operator, url: "https://technisches-datenblatt.de", address: { "@type": "PostalAddress", streetAddress: "Marienborner Straße 49", postalCode: "55128", addressLocality: "Mainz", addressCountry: "DE" }, email: SITE.email, telephone: SITE.phone },
      { "@type": "Service", name: de ? "Technisches Datenblatt mit EU-Akzeptanzgarantie" : "Technical data sheet with EU acceptance guarantee", description: de ? "Wird das Datenblatt von der zuständigen Zulassungsstelle in der Europäischen Union nicht als technischer Nachweis akzeptiert, wird der gezahlte Paketpreis nach den Garantiebedingungen erstattet." : "If the competent registration authority in the European Union does not accept the data sheet as technical evidence, the package price paid is refunded under the guarantee terms.", provider: { "@type": "Organization", name: SITE.operator }, areaServed: "European Union", termsOfService: `https://technisches-datenblatt.de/${locale}/garantie`, offers: [
        { "@type": "Offer", name: PRODUCTS.data.name, price: "24.99", priceCurrency: "EUR", availability: "https://schema.org/InStock" },
      ] },
      { "@type": "FAQPage", mainEntity: visibleFaq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <SiteHeader locale={locale} />
    <main className="compact-home">
      <section className="hero compact-hero" id="top">
        <div className="hero-copy"><span className="kicker"><i />{t.hero.kicker}</span><h1>{t.hero.titleA}<br/><em>{t.hero.titleB}</em></h1><p>{t.hero.text}</p><div className="button-row compact-cta"><a className="button primary" href="#auftrag">{t.hero.primary}<Icon name="arrow" /></a><Link href={`/${locale}/garantie`}>{de ? "EU-Garantie" : "EU guarantee"}<Icon name="arrow" size={15}/></Link></div></div>
        <aside className="hero-offer"><div className="offer-label"><span>{de ? "Dörrschuck Fahrzeugdaten-Service" : "Dörrschuck vehicle data service"}</span><b>{de ? "DIGITAL" : "DIGITAL"}</b></div><strong>{PRODUCTS.data.price}</strong><small>{de ? "einmaliger Endpreis · inkl. MwSt." : "one-off total · VAT included"}</small><ul><li><Icon name="check"/>{de ? "COC-/Typgenehmigungsdatenblatt" : "COC/type-approval data sheet"}</li><li><Icon name="check"/>{de ? "Technisches Datenblatt" : "Technical data sheet"}</li><li><Icon name="check"/>{de ? "FIN-Bestätigung" : "VIN confirmation"}</li></ul><div><Icon name="shield"/><span><b>{de ? "Geld-zurück-Garantie" : "Money-back guarantee"}</b><small>{de ? "bei Nichtakzeptanz des Datenblatts" : "if the data sheet is not accepted"}</small></span></div></aside>
      </section>

      <section className="compact-route-strip" aria-label={de ? "Zulassungsrichtungen und Garantie" : "Registration directions and guarantee"}><div><small>EU → DE</small><strong>{de ? "Importfahrzeug in Deutschland" : "Imported vehicle in Germany"}</strong></div><div><small>DE → EU</small><strong>{de ? "Deutsches Fahrzeug im EU-Ausland" : "German vehicle elsewhere in the EU"}</strong></div><div><Icon name="shield"/><span><small>{de ? "UNSER USP" : "OUR USP"}</small><strong>{de ? "Akzeptiert oder Geld zurück" : "Accepted or your money back"}</strong></span></div></section>

      <section className="compact-section compact-overview" id="leistung"><div className="compact-heading"><div><span className="kicker">01 / {de ? "Enthalten" : "Included"}</span><h2>{de ? "Alles in einem Paket." : "Everything in one package."}</h2></div><strong className="compact-price">{PRODUCTS.data.price}</strong></div><div className="service-grid compact-service-grid">
        <article><Icon name="file" size={24}/><h3>{de ? "Technisches Datenblatt" : "Technical data sheet"}</h3></article>
        <article><Icon name="shield" size={24}/><h3>{de ? "FIN-Bestätigung" : "VIN confirmation"}</h3></article>
        <article><Icon name="check" size={24}/><h3>{de ? "COC-/Typgenehmigungsdaten" : "COC/type-approval data"}</h3></article>
      </div><ol className="compact-process three-step" id="ablauf"><li><b>1</b><span><strong>{de ? "Angaben & Upload" : "Details & upload"}</strong><small>{de ? "FIN, EU-Land, Papiere, Fotos" : "VIN, EU country, records, photos"}</small></span></li><li><b>2</b><span><strong>{de ? "Prüfung" : "Review"}</strong><small>{de ? "Zuordnung und Datenrecherche" : "Attribution and data research"}</small></span></li><li><b>3</b><span><strong>{de ? "Download" : "Download"}</strong><small>{de ? "Drei digitale Dokumente" : "Three digital documents"}</small></span></li></ol><div className="compact-guarantee"><Icon name="shield" size={28}/><div><strong>{de ? "In der EU akzeptiert – oder Geld zurück." : "Accepted in the EU – or your money back."}</strong></div><Link href={`/${locale}/garantie`}>{de ? "Bedingungen" : "Terms"}<Icon name="arrow"/></Link></div></section>

      <section className="compact-section examples compact-examples" id="beispiele"><div className="compact-heading"><div><span className="kicker">02 / {de ? "Muster" : "Samples"}</span><h2>{de ? "Dokumente ansehen." : "View the documents."}</h2></div></div><div className="example-grid">{examples.map((example) => <article key={example.slug}><a className="example-preview" href={`/beispiele/${example.slug}.pdf?v=${exampleAssetVersion}`} target="_blank" rel="noreferrer"><Image src={`/beispiele/${example.slug}-vorschau.png?v=${exampleAssetVersion}`} alt={`${de ? example.de : example.en} – ${de ? "fiktives Muster" : "fictitious example"}`} width={example.width} height={example.height}/><span>{de ? "MUSTER" : "SAMPLE"}</span></a><div><h3>{de ? example.de : example.en}</h3><a href={`/beispiele/${example.slug}.pdf?v=${exampleAssetVersion}`} target="_blank" rel="noreferrer">{de ? "PDF" : "PDF"}<Icon name="arrow"/></a></div></article>)}</div></section>

      <section className="order-section compact-order" id="auftrag"><div className="order-copy"><span className="kicker light">03 / {de ? "Auftrag" : "Order"}</span><h2>{de ? "Für 24,99 € bestellen." : "Order for €24.99."}</h2><p>{de ? "FIN, Erstzulassung, EU-Herkunftsland und drei Nachweise – mehr brauchst du nicht." : "VIN, first registration, EU country of origin and three records – nothing more is needed."}</p><Link className="order-guarantee-link" href={`/${locale}/garantie`}><Icon name="shield"/>{de ? "EU-Akzeptanzgarantie" : "EU acceptance guarantee"}<Icon name="arrow"/></Link></div><OrderForm locale={locale} /></section>

      <section className="compact-faq-section"><div><span className="kicker">04 / FAQ</span><h2>{de ? "Noch Fragen?" : "Questions?"}</h2></div><div className="faq-list">{visibleFaq.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
    </main>
    <SiteFooter locale={locale}/>
  </>;
}
