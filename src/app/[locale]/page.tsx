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
    keywords: de ? ["COC", "COC Papiere", "Datenblatt", "technisches Datenblatt", "Geld zurück Garantie Datenblatt", "Zulassung Europa", "ausländisches Fahrzeug in Deutschland zulassen", "deutsches Fahrzeug im EU-Ausland zulassen", "Importfahrzeug Zulassung", "FIN Bestätigung", "Typgenehmigungsdatenblatt"] : ["COC", "technical data sheet", "money-back guarantee", "register vehicle Europe", "register imported vehicle Germany", "vehicle registration EU", "VIN confirmation"],
    alternates: { canonical: `/${locale}`, languages: { "de-DE": "/de", "en": "/en" } },
  };
}

const faqDe = [
  ["Was bedeutet die Geld-zurück-Garantie?", "Lehnt eine zuständige Zulassungsstelle in Europa unser unverändertes technisches Datenblatt als technischen Nachweis für das beauftragte Fahrzeug ab, erstatten wir den vollständigen gezahlten Preis des betroffenen Auftrags. Dafür benötigen wir innerhalb von 90 Tagen nach Dokumentbereitstellung den schriftlichen Ablehnungsnachweis. Andere Zulassungshindernisse sind nicht umfasst."],
  ["Was ist im 24,99-€-Paket enthalten?", "Du erhältst ein COC-/Typgenehmigungsdatenblatt, ein technisches Datenblatt und eine FIN-Bestätigung als digitale Dokumente. Der einmalige Endpreis beträgt 24,99 € inklusive gesetzlicher Mehrwertsteuer."],
  ["Kann ich damit ein ausländisches Fahrzeug in Deutschland zulassen?", "Die Dokumente bereiten technische Fahrzeug- und Typdaten für das Zulassungsverfahren auf. Ob weitere Nachweise, eine HU/AU oder eine Einzelbegutachtung erforderlich sind und ob die Zulassung erteilt wird, entscheidet die zuständige Behörde beziehungsweise Prüfstelle im Einzelfall."],
  ["Unterstützt ihr deutsche Fahrzeuge bei der Zulassung im EU-Ausland?", "Ja. Wir strukturieren die technischen Fahrzeug- und Typdaten auch für die Vorlage im EU-Ausland. Da die Zulassungsregeln national unterschiedlich sind, sollte die konkrete Unterlagenliste vorher bei der zuständigen Behörde des Ziellands geprüft werden."],
  ["Erhalte ich ein Hersteller-COC?", "Nein. Ein echtes COC wird ausschließlich vom Fahrzeughersteller oder einer autorisierten Stelle ausgestellt. Unser COC-/Typgenehmigungsdatenblatt bereitet verfügbare Typdaten auf und ist als solches klar gekennzeichnet."],
  ["Welche Unterlagen werden benötigt?", "Wir benötigen ein vollständig lesbares Zulassungsdokument, ein Fahrzeugfoto und ein scharfes Foto der direkt am Fahrzeug eingeschlagenen FIN. Je besser die Unterlagen lesbar sind, desto eindeutiger lassen sich Fahrzeug und Typdaten zuordnen."],
  ["Führt ihr HU/AU oder die Zulassung durch?", "Nein. Das einzige angebotene Produkt ist das digitale Fahrzeugdatenpaket. HU/AU, Fahrzeugvorführung, Behördengänge und Zulassungsgebühren sind nicht Bestandteil des Angebots."],
  ["Sind meine Dokumente öffentlich?", "Nein. Uploads liegen in einem privaten Objektspeicher. Der Abruf erfolgt nur über geschützte und zeitlich begrenzte Links."],
];

const faqEn = [
  ["What does the money-back guarantee cover?", "If a competent registration authority in Europe rejects our unaltered technical data sheet as technical evidence for the commissioned vehicle, we refund the full price paid for that order. We need written evidence of the rejection within 90 days after delivery. Other obstacles to registration are not covered."],
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
  const structuredData = {
    "@context": "https://schema.org", "@graph": [
      { "@type": "Organization", name: SITE.operator, url: "https://technisches-datenblatt.de", address: { "@type": "PostalAddress", streetAddress: "Marienborner Straße 49", postalCode: "55128", addressLocality: "Mainz", addressCountry: "DE" }, email: SITE.email, telephone: SITE.phone },
      { "@type": "Service", name: de ? "Technisches Datenblatt mit europaweiter Akzeptanzgarantie" : "Technical data sheet with Europe-wide acceptance guarantee", description: de ? "Wird das Datenblatt von der zuständigen Zulassungsstelle in Europa nicht als technischer Nachweis akzeptiert, wird der gezahlte Paketpreis nach den Garantiebedingungen erstattet." : "If the competent registration authority in Europe does not accept the data sheet as technical evidence, the package price paid is refunded under the guarantee terms.", provider: { "@type": "Organization", name: SITE.operator }, areaServed: "Europe", termsOfService: `https://technisches-datenblatt.de/${locale}/garantie`, offers: [
        { "@type": "Offer", name: PRODUCTS.data.name, price: "24.99", priceCurrency: "EUR", availability: "https://schema.org/InStock" },
      ] },
      { "@type": "FAQPage", mainEntity: faq.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <SiteHeader locale={locale} />
    <main className="compact-home">
      <section className="hero compact-hero" id="top">
        <div className="hero-copy"><span className="kicker"><i />{t.hero.kicker}</span><h1>{t.hero.titleA}<br/><em>{t.hero.titleB}</em></h1><p>{t.hero.text}</p><div className="button-row"><a className="button primary" href="#auftrag">{t.hero.primary}<Icon name="arrow" /></a><Link className="button ghost" href={`/${locale}/garantie`}>{de ? "Garantie ansehen" : "View guarantee"}</Link></div><div className="trust"><span><Icon name="shield" size={17}/>{de ? "Europaweit akzeptiert oder Geld zurück" : "Accepted across Europe or your money back"}</span><span><Icon name="check" size={17}/>{de ? "Einmalig 24,99 € inkl. MwSt." : "One-off €24.99 incl. VAT"}</span></div></div>
        <aside className="hero-offer"><div className="offer-label"><span>{de ? "Dörrschuck Fahrzeugdaten-Service" : "Dörrschuck vehicle data service"}</span><b>{de ? "DIGITAL" : "DIGITAL"}</b></div><strong>{PRODUCTS.data.price}</strong><small>{de ? "einmaliger Endpreis · inkl. MwSt." : "one-off total · VAT included"}</small><ul><li><Icon name="check"/>{de ? "COC-/Typgenehmigungsdatenblatt" : "COC/type-approval data sheet"}</li><li><Icon name="check"/>{de ? "Technisches Datenblatt" : "Technical data sheet"}</li><li><Icon name="check"/>{de ? "FIN-Bestätigung" : "VIN confirmation"}</li></ul><div><Icon name="shield"/><span><b>{de ? "Geld-zurück-Garantie" : "Money-back guarantee"}</b><small>{de ? "bei Nichtakzeptanz des Datenblatts" : "if the data sheet is not accepted"}</small></span></div></aside>
      </section>

      <section className="compact-route-strip" aria-label={de ? "Zulassungsrichtungen und Garantie" : "Registration directions and guarantee"}><div><small>EU → DE</small><strong>{de ? "Importfahrzeug in Deutschland" : "Imported vehicle in Germany"}</strong></div><div><small>DE → EU</small><strong>{de ? "Deutsches Fahrzeug im EU-Ausland" : "German vehicle elsewhere in the EU"}</strong></div><div><Icon name="shield"/><span><small>{de ? "UNSER USP" : "OUR USP"}</small><strong>{de ? "Akzeptiert oder Geld zurück" : "Accepted or your money back"}</strong></span></div></section>

      <section className="compact-section compact-overview" id="leistung"><div className="compact-heading"><div><span className="kicker">01 / {de ? "Leistung" : "Service"}</span><h2>{de ? "Drei Dokumente. Ein klarer Preis." : "Three documents. One clear price."}</h2></div><p>{de ? "Wir strukturieren Fahrzeug- und Typdaten für Zulassungsstellen in Europa – ohne Paketwahl und ohne versteckte Aufpreise." : "We structure vehicle and type data for registration authorities across Europe, with no package choice or hidden extras."}</p></div><div className="service-grid compact-service-grid">
        <article><span>01</span><Icon name="file" size={25}/><h3>{de ? "Technisches Datenblatt" : "Technical data sheet"}</h3><p>{de ? "Zulassungsrelevante Fahrzeug- und Typdaten, nachvollziehbar aufbereitet." : "Registration-relevant vehicle and type data in a traceable format."}</p></article>
        <article><span>02</span><Icon name="shield" size={25}/><h3>{de ? "FIN-Bestätigung" : "VIN confirmation"}</h3><p>{de ? "Dokumentation der von dir am Fahrzeug geprüften, eingeschlagenen FIN." : "Documentation of the stamped VIN you checked on the vehicle."}</p></article>
        <article><span>03</span><Icon name="check" size={25}/><h3>{de ? "COC-/Typgenehmigungsdaten" : "COC/type-approval data"}</h3><p>{de ? "Verfügbare Typdaten, klar getrennt von einem Hersteller-COC." : "Available type data, clearly distinguished from a manufacturer COC."}</p></article>
      </div><ol className="compact-process" id="ablauf"><li><b>1</b><span><strong>{de ? "Angaben" : "Details"}</strong><small>{de ? "FIN, Erstzulassung, Herkunft" : "VIN, registration, origin"}</small></span></li><li><b>2</b><span><strong>{de ? "Upload" : "Upload"}</strong><small>{de ? "Papiere und Fahrzeugfotos" : "Records and vehicle photos"}</small></span></li><li><b>3</b><span><strong>{de ? "Prüfung" : "Review"}</strong><small>{de ? "Zuordnung und Datenrecherche" : "Attribution and data research"}</small></span></li><li><b>4</b><span><strong>{de ? "Download" : "Download"}</strong><small>{de ? "Drei digitale Dokumente" : "Three digital documents"}</small></span></li></ol><div className="compact-guarantee"><Icon name="shield" size={30}/><div><strong>{de ? "Datenblatt akzeptiert. Oder 100 % des Paketpreises zurück." : "Data sheet accepted. Or 100% of the package price back."}</strong><p>{de ? "Gültig bei zuständigen Zulassungsstellen in Europa; schriftlicher Ablehnungsnachweis innerhalb von 90 Tagen erforderlich. Andere Zulassungsvoraussetzungen bleiben unberührt." : "Valid with competent registration authorities in Europe; written evidence of rejection is required within 90 days. Other registration requirements remain unaffected."}</p></div><Link href={`/${locale}/garantie`}>{de ? "Bedingungen" : "Terms"}<Icon name="arrow"/></Link></div></section>

      <section className="compact-section examples compact-examples" id="beispiele"><div className="compact-heading"><div><span className="kicker">02 / {de ? "Muster" : "Samples"}</span><h2>{de ? "Echte Formate. Fiktive Daten." : "Real formats. Fictitious data."}</h2></div><p>{de ? "Die Beispiele orientieren sich an den tatsächlich verwendeten Dokumentformaten und sind nicht zur Vorlage bestimmt." : "The examples follow the actual document formats and are not intended for submission."}</p></div><div className="example-grid">{examples.map((example) => <article key={example.slug}><a className="example-preview" href={`/beispiele/${example.slug}.pdf?v=${exampleAssetVersion}`} target="_blank" rel="noreferrer"><Image src={`/beispiele/${example.slug}-vorschau.png?v=${exampleAssetVersion}`} alt={`${de ? example.de : example.en} – ${de ? "fiktives Muster" : "fictitious example"}`} width={example.width} height={example.height}/><span>{de ? "MUSTER" : "SAMPLE"}</span></a><div><small>PDF</small><h3>{de ? example.de : example.en}</h3><a href={`/beispiele/${example.slug}.pdf?v=${exampleAssetVersion}`} target="_blank" rel="noreferrer">{de ? "Ansehen" : "View"}<Icon name="arrow"/></a></div></article>)}</div></section>

      <section className="order-section compact-order" id="auftrag"><div className="order-copy"><span className="kicker light">03 / {de ? "Auftrag" : "Order"}</span><h2>{de ? "Jetzt für 24,99 € starten." : "Start now for €24.99."}</h2><p>{de ? "Ein digitales Fahrzeugdatenpaket, einmalig inklusive Mehrwertsteuer. Du benötigst nur FIN, Erstzulassung, Herkunftsland und drei Nachweise." : "One digital vehicle-data package, one-off including VAT. You only need the VIN, first registration, country of origin and three records."}</p><div className="price-card featured"><small>{de ? "Im Preis enthalten" : "Included"}</small><strong>{PRODUCTS.data.price}</strong><span>{de ? "einmaliger Endpreis · inkl. MwSt." : "one-off total · VAT included"}</span><ul><li><Icon name="check"/> {de ? "Drei fahrzeugbezogene PDF-Dokumente" : "Three vehicle-specific PDF documents"}</li><li><Icon name="shield"/> {de ? "Europaweite Datenblatt-Akzeptanzgarantie" : "Europe-wide data-sheet acceptance guarantee"}</li><li><Icon name="check"/> {de ? "Geschützter digitaler Abruf" : "Protected digital access"}</li></ul></div></div><OrderForm locale={locale} /></section>

      <section className="compact-section resource-section" id="wissen"><div className="resource-column"><span className="kicker">04 / {de ? "Ratgeber" : "Guides"}</span><h2>{de ? "Zulassung kompakt erklärt." : "Registration explained concisely."}</h2><div className="compact-knowledge"><Link href={`/${locale}/wissen/auslaendisches-fahrzeug-in-deutschland-zulassen`}><span>{de ? "Import nach Deutschland" : "Import into Germany"}</span><Icon name="arrow"/></Link><Link href={`/${locale}/wissen/deutsches-fahrzeug-im-eu-ausland-zulassen`}><span>{de ? "Zulassung im EU-Ausland" : "Registration elsewhere in the EU"}</span><Icon name="arrow"/></Link><Link href={`/${locale}/wissen/coc-papiere`}><span>{de ? "COC-Papiere & Typdaten" : "COC papers and type data"}</span><Icon name="arrow"/></Link><Link href={`/${locale}/wissen/technisches-datenblatt-importfahrzeug`}><span>{de ? "Technisches Datenblatt" : "Technical data sheet"}</span><Icon name="arrow"/></Link><Link href={`/${locale}/wissen/fin-fahrgestellnummer`}><span>{de ? "FIN richtig fotografieren" : "Photographing the VIN"}</span><Icon name="arrow"/></Link></div></div><div className="resource-column faq"><div className="section-heading"><span className="kicker">05 / FAQ</span><h2>{de ? "Kurz beantwortet." : "Quick answers."}</h2></div><div className="faq-list">{faq.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></div></section>
    </main>
    <SiteFooter locale={locale}/>
  </>;
}
