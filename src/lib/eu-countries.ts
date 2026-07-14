import type { Locale } from "./i18n";

// The 27 Member States of the European Union.
export const EU_COUNTRIES = [
  { code: "BE", de: "Belgien", en: "Belgium" },
  { code: "BG", de: "Bulgarien", en: "Bulgaria" },
  { code: "DK", de: "Dänemark", en: "Denmark" },
  { code: "DE", de: "Deutschland", en: "Germany" },
  { code: "EE", de: "Estland", en: "Estonia" },
  { code: "FI", de: "Finnland", en: "Finland" },
  { code: "FR", de: "Frankreich", en: "France" },
  { code: "GR", de: "Griechenland", en: "Greece" },
  { code: "IE", de: "Irland", en: "Ireland" },
  { code: "IT", de: "Italien", en: "Italy" },
  { code: "HR", de: "Kroatien", en: "Croatia" },
  { code: "LV", de: "Lettland", en: "Latvia" },
  { code: "LT", de: "Litauen", en: "Lithuania" },
  { code: "LU", de: "Luxemburg", en: "Luxembourg" },
  { code: "MT", de: "Malta", en: "Malta" },
  { code: "NL", de: "Niederlande", en: "Netherlands" },
  { code: "AT", de: "Österreich", en: "Austria" },
  { code: "PL", de: "Polen", en: "Poland" },
  { code: "PT", de: "Portugal", en: "Portugal" },
  { code: "RO", de: "Rumänien", en: "Romania" },
  { code: "SE", de: "Schweden", en: "Sweden" },
  { code: "SK", de: "Slowakei", en: "Slovakia" },
  { code: "SI", de: "Slowenien", en: "Slovenia" },
  { code: "ES", de: "Spanien", en: "Spain" },
  { code: "CZ", de: "Tschechien", en: "Czechia" },
  { code: "HU", de: "Ungarn", en: "Hungary" },
  { code: "CY", de: "Zypern", en: "Cyprus" },
] as const;

export type EuCountryCode = (typeof EU_COUNTRIES)[number]["code"];

export const EU_COUNTRY_CODES = EU_COUNTRIES.map(({ code }) => code) as [
  EuCountryCode,
  ...EuCountryCode[],
];

export function formatEuCountry(value: string | null, locale: Locale = "de") {
  if (!value) return "—";
  const country = EU_COUNTRIES.find(({ code }) => code === value);
  return country?.[locale] ?? value;
}
