import { z } from "zod";
import { EUROPEAN_COUNTRY_CODES } from "./european-countries";
import { normalizeVin } from "./security";

const accepted = z.literal("accepted");

export const orderInputSchema = z.object({
  locale: z.enum(["de", "en"]).default("de"),
  service: z.literal("data").default("data"),
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.email().toLowerCase(),
  customerPhone: z.string().trim().max(50).optional().default(""),
  company: z.string().trim().max(120).optional().default(""),
  vin: z.string().transform(normalizeVin).pipe(z.string().length(17)),
  firstRegistration: z.iso.date(),
  originCountry: z.enum(EUROPEAN_COUNTRY_CODES),
  notes: z.string().trim().max(2000).optional().default(""),
  vinConfirmation: accepted,
  privacy: accepted,
  terms: accepted,
  earlyPerformance: accepted,
  withdrawalAck: accepted,
});
