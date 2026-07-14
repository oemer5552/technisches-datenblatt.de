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
      kicker: "Zulassungsservice für Deutschland und Europa",
      titleA: "Grenzen wechseln.", titleB: "Einfach zulassen.",
      text: "Für ausländische Fahrzeuge in Deutschland und deutsche Fahrzeuge im EU-Ausland: technische Daten, COC-/Typdaten und auf Wunsch HU/AU in einem koordinierten Ablauf.",
      primary: "Paket auswählen", secondary: "So funktioniert es",
    },
    common: { locale: "Sprache", theme: "Darstellung", back: "Zurück", home: "Startseite" },
  },
  en: {
    nav: { service: "Services", process: "Process", knowledge: "Knowledge", status: "Order status", order: "Start order", app: "Login" },
    hero: {
      kicker: "Registration support for Germany and Europe",
      titleA: "Cross borders.", titleB: "Register smoothly.",
      text: "For foreign vehicles in Germany and German vehicles in other EU countries: technical data, COC/type data and, where needed, HU/AU in one coordinated process.",
      primary: "Choose a package", secondary: "How it works",
    },
    common: { locale: "Language", theme: "Appearance", back: "Back", home: "Home" },
  },
} as const;
