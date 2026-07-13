export const SITE = {
  name: "technisches-datenblatt.de",
  operator: "Autohaus Dörrschuck Handels GmbH",
  address: "Marienborner Straße 49, 55128 Mainz, Deutschland",
  email: "info@autohaus-doerrschuck.de",
  phone: "+49 (0) 6131 934070",
  priceCents: 2499,
  price: "24,99 €",
  currency: "eur",
} as const;

export const ORDER_STATUSES = [
  "eingegangen",
  "zahlung_offen",
  "in_pruefung",
  "rueckfrage",
  "fertiggestellt",
  "storniert",
] as const;

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export const EVIDENCE_KINDS = {
  foreignRegistrationDocument: "Ausländischer Fahrzeugschein",
  vehiclePhoto: "Fahrzeugfoto",
  stampedVinPhoto: "Foto der eingeschlagenen FIN",
} as const;

export const RESULT_KINDS = {
  resultTechnicalData: "Technisches Datenblatt",
  resultVinConfirmation: "FIN-Erklärung",
  resultCocResearch: "COC-/Typdaten-Prüfergebnis",
} as const;

export type EvidenceKind = keyof typeof EVIDENCE_KINDS;
export type ResultKind = keyof typeof RESULT_KINDS;
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

