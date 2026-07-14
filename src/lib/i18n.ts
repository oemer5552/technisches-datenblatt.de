export const locales = ["de", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function requireLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export const copy = {
  de: {
    nav: { service: "Leistungen", process: "Ablauf", knowledge: "Wissen", status: "Auftragsstatus", order: "Auftrag starten", app: "Login" },
    hero: {
      kicker: "Ein digitales Produkt für Fahrzeugdaten",
      titleA: "Drei Dokumente.", titleB: "Ein klarer Preis.",
      text: "COC-/Typgenehmigungsdaten, technisches Datenblatt und FIN-Bestätigung für 24,99 € inkl. MwSt. - mit europaweiter Datenblatt-Akzeptanzgarantie.",
      primary: "Für 24,99 € bestellen", secondary: "So funktioniert es",
    },
    common: { locale: "Sprache", theme: "Darstellung", back: "Zurück", home: "Startseite" },
  },
  en: {
    nav: { service: "Services", process: "Process", knowledge: "Knowledge", status: "Order status", order: "Start order", app: "Login" },
    hero: {
      kicker: "One digital vehicle-data product",
      titleA: "Three documents.", titleB: "One clear price.",
      text: "COC/type-approval data, technical data sheet and VIN confirmation for €24.99 incl. VAT - with our Europe-wide data-sheet acceptance guarantee.",
      primary: "Order for €24.99", secondary: "How it works",
    },
    common: { locale: "Language", theme: "Appearance", back: "Back", home: "Home" },
  },
} as const;
