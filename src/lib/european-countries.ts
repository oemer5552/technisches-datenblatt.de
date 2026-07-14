import type { Locale } from "./i18n";

export const EUROPEAN_COUNTRIES = [
  { code: "AL", de: "Albanien", en: "Albania" },
  { code: "AD", de: "Andorra", en: "Andorra" },
  { code: "AM", de: "Armenien", en: "Armenia" },
  { code: "AZ", de: "Aserbaidschan", en: "Azerbaijan" },
  { code: "BY", de: "Belarus", en: "Belarus" },
  { code: "BE", de: "Belgien", en: "Belgium" },
  { code: "BA", de: "Bosnien und Herzegowina", en: "Bosnia and Herzegovina" },
  { code: "BG", de: "Bulgarien", en: "Bulgaria" },
  { code: "DK", de: "Dänemark", en: "Denmark" },
  { code: "DE", de: "Deutschland", en: "Germany" },
  { code: "EE", de: "Estland", en: "Estonia" },
  { code: "FI", de: "Finnland", en: "Finland" },
  { code: "FR", de: "Frankreich", en: "France" },
  { code: "GE", de: "Georgien", en: "Georgia" },
  { code: "GR", de: "Griechenland", en: "Greece" },
  { code: "IE", de: "Irland", en: "Ireland" },
  { code: "IS", de: "Island", en: "Iceland" },
  { code: "IT", de: "Italien", en: "Italy" },
  { code: "KZ", de: "Kasachstan", en: "Kazakhstan" },
  { code: "XK", de: "Kosovo", en: "Kosovo" },
  { code: "HR", de: "Kroatien", en: "Croatia" },
  { code: "LV", de: "Lettland", en: "Latvia" },
  { code: "LI", de: "Liechtenstein", en: "Liechtenstein" },
  { code: "LT", de: "Litauen", en: "Lithuania" },
  { code: "LU", de: "Luxemburg", en: "Luxembourg" },
  { code: "MT", de: "Malta", en: "Malta" },
  { code: "MD", de: "Moldau", en: "Moldova" },
  { code: "MC", de: "Monaco", en: "Monaco" },
  { code: "ME", de: "Montenegro", en: "Montenegro" },
  { code: "NL", de: "Niederlande", en: "Netherlands" },
  { code: "MK", de: "Nordmazedonien", en: "North Macedonia" },
  { code: "NO", de: "Norwegen", en: "Norway" },
  { code: "AT", de: "Österreich", en: "Austria" },
  { code: "PL", de: "Polen", en: "Poland" },
  { code: "PT", de: "Portugal", en: "Portugal" },
  { code: "RO", de: "Rumänien", en: "Romania" },
  { code: "RU", de: "Russland", en: "Russia" },
  { code: "SM", de: "San Marino", en: "San Marino" },
  { code: "SE", de: "Schweden", en: "Sweden" },
  { code: "CH", de: "Schweiz", en: "Switzerland" },
  { code: "RS", de: "Serbien", en: "Serbia" },
  { code: "SK", de: "Slowakei", en: "Slovakia" },
  { code: "SI", de: "Slowenien", en: "Slovenia" },
  { code: "ES", de: "Spanien", en: "Spain" },
  { code: "CZ", de: "Tschechien", en: "Czechia" },
  { code: "TR", de: "Türkei", en: "Türkiye" },
  { code: "UA", de: "Ukraine", en: "Ukraine" },
  { code: "HU", de: "Ungarn", en: "Hungary" },
  { code: "VA", de: "Vatikanstadt", en: "Vatican City" },
  { code: "GB", de: "Vereinigtes Königreich", en: "United Kingdom" },
  { code: "CY", de: "Zypern", en: "Cyprus" },
] as const;

export type EuropeanCountryCode = (typeof EUROPEAN_COUNTRIES)[number]["code"];

export const EUROPEAN_COUNTRY_CODES = EUROPEAN_COUNTRIES.map(({ code }) => code) as [
  EuropeanCountryCode,
  ...EuropeanCountryCode[],
];

export function formatEuropeanCountry(value: string | null, locale: Locale = "de") {
  if (!value) return "—";
  const country = EUROPEAN_COUNTRIES.find(({ code }) => code === value);
  return country?.[locale] ?? value;
}
