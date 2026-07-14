import { z } from "zod";
import { normalizeVin } from "./security";

const accepted = z.literal("accepted");

export const orderInputSchema = z.object({
  locale: z.enum(["de", "en"]).default("de"),
  service: z.enum(["data", "registration"]).default("registration"),
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.email().toLowerCase(),
  customerPhone: z.string().trim().max(50).optional().default(""),
  company: z.string().trim().max(120).optional().default(""),
  vin: z.string().transform(normalizeVin).pipe(z.string().length(17)),
  make: z.string().trim().max(80).optional().default(""),
  model: z.string().trim().max(120).optional().default(""),
  firstRegistration: z.string().trim().max(20).optional().default(""),
  originCountry: z.string().trim().max(80).optional().default(""),
  vinLocation: z.string().trim().min(2).max(160),
  notes: z.string().trim().max(2000).optional().default(""),
  vinConfirmation: accepted,
  privacy: accepted,
  terms: accepted,
  earlyPerformance: accepted,
  withdrawalAck: accepted,
});
