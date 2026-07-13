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
      kicker: "Digitaler Dokumentenservice für Importfahrzeuge",
      titleA: "Fahrzeugdaten.", titleB: "Klar dokumentiert.",
      text: "Unterlagen sicher einreichen, Fahrzeug- und Typdaten fachlich prüfen lassen und digitale Ergebnisdokumente zentral abrufen.",
      primary: "Auftrag starten", secondary: "So funktioniert es",
    },
    common: { locale: "Sprache", theme: "Darstellung", back: "Zurück", home: "Startseite" },
  },
  en: {
    nav: { service: "Services", process: "Process", knowledge: "Knowledge", status: "Order status", order: "Start order", app: "Login" },
    hero: {
      kicker: "Digital document service for imported vehicles",
      titleA: "Vehicle data.", titleB: "Clearly documented.",
      text: "Submit documents securely, have vehicle and type data reviewed, and retrieve the digital results in one place.",
      primary: "Start order", secondary: "How it works",
    },
    common: { locale: "Language", theme: "Appearance", back: "Back", home: "Home" },
  },
} as const;

