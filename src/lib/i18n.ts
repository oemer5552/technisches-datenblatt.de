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
      kicker: "Europaweite Datenblatt-Akzeptanzgarantie",
      titleA: "Europaweit zulassen.", titleB: "Oder Geld zurück.",
      text: "Wird unser technisches Datenblatt von der zuständigen Zulassungsstelle in Europa nicht als technischer Nachweis akzeptiert, erstatten wir den vollständigen gezahlten Paketpreis.",
      primary: "Paket auswählen", secondary: "So funktioniert es",
    },
    common: { locale: "Sprache", theme: "Darstellung", back: "Zurück", home: "Startseite" },
  },
  en: {
    nav: { service: "Services", process: "Process", knowledge: "Knowledge", status: "Order status", order: "Start order", app: "Login" },
    hero: {
      kicker: "Europe-wide data-sheet acceptance guarantee",
      titleA: "Register across Europe.", titleB: "Or get your money back.",
      text: "If the competent registration authority in Europe does not accept our technical data sheet as technical evidence, we refund the full package price paid.",
      primary: "Choose a package", secondary: "How it works",
    },
    common: { locale: "Language", theme: "Appearance", back: "Back", home: "Home" },
  },
} as const;
