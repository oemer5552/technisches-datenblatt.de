import { z } from "zod";

export const VEHICLE_FIELDS = [
  "briefquelle", "briefnr", "kz_land", "kennzeichen", "vin", "ez", "marke", "typ", "variante",
  "version", "handelsname", "klasse", "hersteller_adresse", "vin_ort", "K", "f6", "antrieb",
  "radstand", "laenge", "breite", "hoehe", "masse_fahrbereit", "masse_tatsaechlich", "zgg",
  "achse1", "achse2", "zugkomb", "ahk_gebremst", "ahk_ungebremst", "stuetzlast",
  "motorhersteller", "motorcode", "arbeitsverfahren", "zylinder", "hubraum", "kraftstoff",
  "leistung", "leistung_rpm", "drehmoment", "drehmoment_rpm", "vmax", "getriebe", "spur1",
  "spur2", "reifen_montiert", "aufbau", "farbe", "farbbeschreibung", "tueren", "sitze", "dachlast", "ger_stand",
  "ger_stand_rpm", "ger_fahrt", "abgasnorm", "abgasregelung", "em_co", "em_nox", "em_pm",
  "em_pn", "co2_wltp", "co2_nedc", "hsn", "tsn", "f13", "f11", "f14", "f10", "f141",
  "f16", "f17",
] as const;

export type VehicleField = (typeof VEHICLE_FIELDS)[number];
export type EvidenceInput = { kind: string; filename: string; mediaType: string; buffer: Buffer };

const nullableString = z.string().max(500).nullable();
const fieldShape = Object.fromEntries(VEHICLE_FIELDS.map((field) => [field, nullableString])) as Record<VehicleField, typeof nullableString>;

export const vehicleExtractionSchema = z.object({
  fields: z.object(fieldShape).strict(),
  reifen_liste: z.array(z.string().max(200)).max(12),
  confidence: z.number().min(0).max(1),
  criticalConfidence: z.object({
    document: z.number().min(0).max(1),
    vin: z.number().min(0).max(1),
    firstRegistration: z.number().min(0).max(1),
    color: z.number().min(0).max(1),
  }).strict(),
  reviewReasons: z.array(z.string().max(300)).max(30),
  sourceNotes: z.array(z.string().max(300)).max(30),
}).strict();

export type VehicleExtraction = z.infer<typeof vehicleExtractionSchema>;

const properties = Object.fromEntries(VEHICLE_FIELDS.map((field) => [field, { type: ["string", "null"] }])) as Record<string, unknown>;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["fields", "reifen_liste", "confidence", "criticalConfidence", "reviewReasons", "sourceNotes"],
  properties: {
    fields: { type: "object", additionalProperties: false, required: [...VEHICLE_FIELDS], properties },
    reifen_liste: { type: "array", items: { type: "string" }, maxItems: 12 },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    criticalConfidence: {
      type: "object",
      additionalProperties: false,
      required: ["document", "vin", "firstRegistration", "color"],
      properties: {
        document: { type: "number", minimum: 0, maximum: 1 },
        vin: { type: "number", minimum: 0, maximum: 1 },
        firstRegistration: { type: "number", minimum: 0, maximum: 1 },
        color: { type: "number", minimum: 0, maximum: 1 },
      },
    },
    reviewReasons: { type: "array", items: { type: "string" }, maxItems: 30 },
    sourceNotes: { type: "array", items: { type: "string" }, maxItems: 30 },
  },
} as const;

function inputPart(file: EvidenceInput) {
  const dataUrl = `data:${file.mediaType};base64,${file.buffer.toString("base64")}`;
  if (file.mediaType === "application/pdf") {
    return { type: "input_file", filename: file.filename, file_data: dataUrl, detail: "high" };
  }
  return { type: "input_image", image_url: dataUrl, detail: "original" };
}

function outputText(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("output" in payload) || !Array.isArray(payload.output)) return "";
  for (const item of payload.output) {
    if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (content && typeof content === "object" && "type" in content && content.type === "output_text" && "text" in content && typeof content.text === "string") return content.text;
    }
  }
  return "";
}

export function vehicleAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function extractVehicleData(files: EvidenceInput[]) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_NOT_CONFIGURED");
  const model = process.env.OPENAI_VISION_MODEL?.trim() || "gpt-5.4-mini";
  const content = [
    {
      type: "input_text",
      text: [
        "Lies das eingereichte Fahrzeug-Zulassungsdokument, das Fahrzeug-Außenfoto und das Foto der eingeschlagenen FIN aus.",
        "Übertrage ausschließlich Werte, die sichtbar in den Unterlagen stehen. Erfinde keine technischen Daten und leite keine fehlenden Typspezifikationen aus Modellwissen ab.",
        "Nutze das Außenfoto ausschließlich für die sichtbare Grundfarbe und gegebenenfalls das Kennzeichen. Standardisiere farbe auf SCHWARZ, WEISS, GRAU, SILBER, BLAU, ROT, GRUEN, BRAUN, GELB, ORANGE, VIOLETT, BEIGE, MEHRFARBIG oder UNBEKANNT; beschreibe den sichtbaren Ton in farbbeschreibung.",
        "Nutze das FIN-Foto für einen Zeichen-für-Zeichen-Abgleich. vin_ort darf nur beschrieben werden, wenn die Einbaustelle aus dem Foto erkennbar ist.",
        "Zahlenfelder ohne Einheit ausgeben, Datumswerte möglichst als TT.MM.JJJJ. Reifen vollständig und zeilenweise ausgeben. Nicht vorhandene oder unleserliche Werte sind null.",
        "Melde Widersprüche, abgeschnittene Felder, Unschärfe und unsichere Zeichen in reviewReasons. sourceNotes nennt knapp, aus welcher Quelle relevante Werte stammen.",
      ].join("\n"),
    },
    ...files.map(inputPart),
  ];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 6000,
      input: [
        { role: "system", content: "Du bist ein präziser OCR-Extraktor für europäische Fahrzeug-Zulassungsdokumente. Unsicherheit wird offengelegt, niemals ergänzt." },
        { role: "user", content },
      ],
      text: { format: { type: "json_schema", name: "vehicle_document_extraction", strict: true, schema: responseSchema } },
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { code?: string; type?: string } } | null;
    throw new Error(`OPENAI_${body?.error?.code || body?.error?.type || response.status}`);
  }
  const payload = await response.json();
  const text = outputText(payload);
  if (!text) throw new Error("OPENAI_EMPTY_OUTPUT");
  return { model, extraction: vehicleExtractionSchema.parse(JSON.parse(text)) };
}

function normalizedVin(value: string | null | undefined) {
  return (value || "").toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
}

function normalizedDate(value: string | null | undefined) {
  const text = (value || "").trim();
  const european = text.match(/^(\d{2})[.\/-](\d{2})[.\/-](\d{4})$/);
  if (european) return `${european[3]}${european[2]}${european[1]}`;
  const iso = text.match(/^(\d{4})[.\/-](\d{2})[.\/-](\d{2})$/);
  if (iso) return `${iso[1]}${iso[2]}${iso[3]}`;
  return text.replace(/\D/g, "") || text.toLowerCase();
}

export function assessVehicleExtraction(extraction: VehicleExtraction, submitted: { vin: string; firstRegistration: string }) {
  const reasons = [...extraction.reviewReasons];
  const extractedVin = normalizedVin(extraction.fields.vin);
  const submittedVin = normalizedVin(submitted.vin);
  if (!extractedVin) reasons.push("FIN konnte aus den Nachweisen nicht sicher gelesen werden.");
  else if (extractedVin !== submittedVin) reasons.push("FIN aus den Nachweisen stimmt nicht mit der Formulareingabe überein.");
  if (extraction.fields.ez && normalizedDate(extraction.fields.ez) !== normalizedDate(submitted.firstRegistration)) reasons.push("Erstzulassung aus dem Dokument stimmt nicht mit der Formulareingabe überein.");
  if (extraction.criticalConfidence.document < 0.75) reasons.push("Zulassungsdokument ist nicht ausreichend sicher lesbar.");
  if (extraction.criticalConfidence.vin < 0.9) reasons.push("FIN-Abgleich benötigt eine manuelle Sichtprüfung.");
  if (extraction.criticalConfidence.color < 0.65) reasons.push("Fahrzeugfarbe ist auf dem Außenfoto nicht eindeutig erkennbar.");
  if (!extraction.fields.marke) reasons.push("Fabrikmarke fehlt oder ist nicht lesbar.");
  if (!extraction.fields.K) reasons.push("EG-Typgenehmigungsnummer fehlt oder ist nicht lesbar.");
  return [...new Set(reasons)];
}
