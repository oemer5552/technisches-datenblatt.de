import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { getDb } from "@/db";
import { documents, orderEvents, orders } from "@/db/schema";
import { sameOrigin } from "@/lib/auth";
import { extensionFor, validateDocument } from "@/lib/files";
import { createAccessToken, hashToken, makeReference, safeFilename } from "@/lib/security";
import { EVIDENCE_KINDS, MAX_UPLOAD_BYTES, SITE, getProduct, type EvidenceKind } from "@/lib/site";
import { paymentsEnabled } from "@/lib/payments";
import { sendOrderCreatedEmails } from "@/lib/mail";
import { processOrderWithAi } from "@/lib/order-ai-processing";
import { deletePrivateObject, putPrivateObject } from "@/lib/storage";
import { orderInputSchema } from "@/lib/validation";
import { ZodError } from "zod";

export const runtime = "nodejs";

const uploadFields: Array<{ field: EvidenceKind; imagesOnly: boolean }> = [
  { field: "foreignRegistrationDocument", imagesOnly: false },
  { field: "vehiclePhoto", imagesOnly: true },
  { field: "stampedVinPhoto", imagesOnly: true },
];

function text(form: FormData, name: string) { const value = form.get(name); return typeof value === "string" ? value : ""; }

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Ungültige Anfragequelle" }, { status: 403 });
  const uploadedKeys: string[] = [];
  try {
    const form = await request.formData();
    const input = orderInputSchema.parse({
      locale: text(form, "locale") || "de", service: text(form, "service") || "data", customerName: text(form, "customerName"), customerEmail: text(form, "customerEmail"), customerPhone: text(form, "customerPhone"), company: text(form, "company"), vin: text(form, "vin"), firstRegistration: text(form, "firstRegistration"), originCountry: text(form, "originCountry"), notes: text(form, "notes"), vinConfirmation: text(form, "vinConfirmation"), privacy: text(form, "privacy"), terms: text(form, "terms"), earlyPerformance: text(form, "earlyPerformance"), withdrawalAck: text(form, "withdrawalAck"),
    });
    const product = getProduct(input.service);
    const selected = uploadFields.map(({ field, imagesOnly }) => {
      const file = form.get(field);
      if (!(file instanceof File) || file.size === 0) throw new Error(`Pflichtdatei fehlt: ${EVIDENCE_KINDS[field]}`);
      return { field, imagesOnly, file };
    });
    const totalSize = selected.reduce((sum, item) => sum + item.file.size, 0);
    if (totalSize > MAX_UPLOAD_BYTES) throw new Error("Die Dateien dürfen zusammen höchstens 20 MB groß sein");

    const id = randomUUID(); const accessToken = createAccessToken(); const reference = makeReference();
    const documentRows: Array<typeof documents.$inferInsert> = [];
    for (const item of selected) {
      const buffer = Buffer.from(await item.file.arrayBuffer());
      const validated = validateDocument(item.file, buffer, item.imagesOnly);
      const objectKey = `orders/${id}/evidence/${item.field}/${randomUUID()}${extensionFor(validated.mediaType)}`;
      await putPrivateObject(objectKey, buffer, validated.mediaType); uploadedKeys.push(objectKey);
      documentRows.push({ id: randomUUID(), orderId: id, kind: item.field, originalName: safeFilename(item.file.name), objectKey, mediaType: validated.mediaType, size: buffer.length, sha256: validated.sha256 });
    }

    const now = new Date();
    const paymentActive = paymentsEnabled();
    await getDb().transaction(async (tx) => {
      await tx.insert(orders).values({ id, reference, accessTokenHash: hashToken(accessToken), locale: input.locale, service: input.service, customerName: input.customerName, customerEmail: input.customerEmail, customerPhone: input.customerPhone || null, company: input.company || null, vin: input.vin, make: null, model: null, firstRegistration: input.firstRegistration, originCountry: input.originCountry, vinLocation: null, notes: input.notes || null, priceCents: product.priceCents, currency: SITE.currency, paymentProvider: paymentActive ? null : "test", consentData: { version: "2026-07-14.6", recordedAt: now.toISOString(), service: input.service, priceCents: product.priceCents, testMode: !paymentActive, acceptanceGuarantee: true, terms: true, privacyNotice: true, earlyPerformance: true, withdrawalAcknowledged: true, vinConfirmed: true } });
      await tx.insert(documents).values(documentRows);
      await tx.insert(orderEvents).values({ id: randomUUID(), orderId: id, actor: "customer", action: "order.created", detail: { locale: input.locale, service: input.service, priceCents: product.priceCents, originCountry: input.originCountry, evidenceKinds: uploadFields.map((item) => item.field) } });
    });
    after(async () => {
      const processing = processOrderWithAi(id);
      const delivery = await sendOrderCreatedEmails({
        id,
        accessToken,
        reference,
        locale: input.locale,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone || null,
        company: input.company || null,
        vin: input.vin,
        firstRegistration: input.firstRegistration,
        originCountry: input.originCountry,
        notes: input.notes || null,
        priceCents: product.priceCents,
        testMode: !paymentActive,
      });
      console.info("order_mail_result", { orderId: id, reference, ...delivery });
      try {
        await getDb().insert(orderEvents).values({ id: randomUUID(), orderId: id, actor: "system", action: "order.mail", detail: delivery });
      } catch (error) {
        console.error("order_mail_event_failed", { orderId: id, code: error instanceof Error ? error.name : "UNKNOWN" });
      }
      await processing;
    });
    return Response.json({ id, reference, accessToken }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (reason) {
    await Promise.allSettled(uploadedKeys.map(deletePrivateObject));
    if (reason instanceof ZodError) {
      const emailIssue = reason.issues.find((issue) => issue.path[0] === "customerEmail" && issue.message.includes("Meintest du"));
      return Response.json({ error: emailIssue?.message || "Bitte prüfe die Pflichtfelder, die FIN und alle Erklärungen." }, { status: 400 });
    }
    if (reason instanceof Error && (/Pflichtdatei|Dateityp|Dateiendung|20 MB|Foto erforderlich|Dokumentenspeicher/.test(reason.message))) return Response.json({ error: reason.message }, { status: 400 });
    console.error("order_create_failed", reason);
    return Response.json({ error: "Der Auftrag konnte nicht gespeichert werden. Bitte versuche es später erneut." }, { status: 500 });
  }
}
