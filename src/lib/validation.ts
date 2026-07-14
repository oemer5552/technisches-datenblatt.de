import { z } from "zod";
import { suggestEmailCorrection } from "./email-address";
import { EU_COUNTRY_CODES } from "./eu-countries";
import { normalizeVin } from "./security";

const accepted = z.literal("accepted");

export const orderInputSchema = z.object({
  locale: z.enum(["de", "en"]).default("de"),
  service: z.literal("data").default("data"),
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().toLowerCase().pipe(z.email()).superRefine((email, context) => {
    const suggestion = suggestEmailCorrection(email);
    if (suggestion) context.addIssue({ code: "custom", message: `Bitte prüfe die E-Mail-Adresse: Meintest du ${suggestion}?` });
  }),
  customerPhone: z.string().trim().max(50).optional().default(""),
  company: z.string().trim().max(120).optional().default(""),
  vin: z.string().transform(normalizeVin).pipe(z.string().length(17)),
  firstRegistration: z.iso.date(),
  originCountry: z.enum(EU_COUNTRY_CODES),
  notes: z.string().trim().max(2000).optional().default(""),
  vinConfirmation: accepted,
  privacy: accepted,
  terms: accepted,
  earlyPerformance: accepted,
  withdrawalAck: accepted,
});
