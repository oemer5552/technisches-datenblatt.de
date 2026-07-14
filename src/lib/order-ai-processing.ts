import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { documents, orderEvents, orders } from "@/db/schema";
import { AI_RESULT_KINDS, EVIDENCE_KINDS } from "./site";
import { deletePrivateObject, getPrivateObject, putPrivateObject } from "./storage";
import { assessVehicleExtraction, extractVehicleData, vehicleAiConfigured, type VehicleExtraction } from "./vehicle-ai";

const draftFiles = [
  { kind: "aiDraftCocResearch", filename: "coc-typgenehmigungsdaten-ki-entwurf.pdf", rendered: "coc-typgenehmigungsdaten-entwurf.pdf" },
  { kind: "aiDraftTechnicalData", filename: "technisches-datenblatt-ki-entwurf.pdf", rendered: "technisches-datenblatt-entwurf.pdf" },
  { kind: "aiDraftVinConfirmation", filename: "fin-abgleich-ki-entwurf.pdf", rendered: "fin-abgleich-entwurf.pdf" },
] as const;

function event(orderId: string, action: string, detail: Record<string, unknown>) {
  return getDb().insert(orderEvents).values({ id: randomUUID(), orderId, actor: "ai", action, detail });
}

function safeErrorCode(error: unknown) {
  if (!(error instanceof Error)) return "UNKNOWN";
  return error.message.replace(/[^A-Z0-9_-]/gi, "_").slice(0, 100) || error.name;
}

function rendererData(extraction: VehicleExtraction, order: typeof orders.$inferSelect) {
  return {
    ...extraction.fields,
    vin: extraction.fields.vin || order.vin,
    ez: extraction.fields.ez || order.firstRegistration || "—",
    briefquelle: extraction.fields.briefquelle || "europäisches Zulassungsdokument",
    briefnr: extraction.fields.briefnr || "—",
    kz_land: extraction.fields.kz_land || order.originCountry || "EU",
    kennzeichen: extraction.fields.kennzeichen || "—",
    farbe: extraction.fields.farbe || "UNBEKANNT",
    aufbau: extraction.fields.aufbau || "— – —",
    reifen_liste: extraction.reifen_liste,
  };
}

async function renderDrafts(data: Record<string, unknown>) {
  const directory = await mkdtemp(path.join(tmpdir(), "td-ai-pdf-"));
  // The server and Docker image both run with the repository/application root as cwd.
  const script = process.env.PDF_RENDERER_PATH || "scripts/pdf-engine/render_order.py";
  const python = process.env.PYTHON_BIN || "python3";
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(python, [script, directory], { stdio: ["pipe", "ignore", "pipe"] });
      let stderr = "";
      child.stderr.on("data", (chunk) => { stderr = `${stderr}${String(chunk)}`.slice(-8_000); });
      child.on("error", reject);
      child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`PDF_RENDER_${code}_${stderr.slice(-200)}`)));
      child.stdin.end(JSON.stringify(data));
    });
    return await Promise.all(draftFiles.map(async (file) => ({ ...file, buffer: await readFile(path.join(directory, file.rendered)) })));
  } finally {
    const resolved = path.resolve(directory);
    if (resolved.startsWith(path.resolve(tmpdir()) + path.sep)) await rm(resolved, { recursive: true, force: true });
  }
}

export async function processOrderWithAi(orderId: string) {
  if (!vehicleAiConfigured()) {
    await event(orderId, "ai.skipped", { reason: "openai_not_configured" }).catch(() => undefined);
    console.warn("order_ai_skipped", { orderId, reason: "openai_not_configured" });
    return { state: "skipped" as const };
  }

  const [order] = await getDb().select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return { state: "missing" as const };
  const allFiles = await getDb().select().from(documents).where(eq(documents.orderId, orderId));
  if (allFiles.some((file) => file.kind in AI_RESULT_KINDS)) return { state: "already_processed" as const };

  const evidenceRows = allFiles.filter((file) => file.kind in EVIDENCE_KINDS);
  if (evidenceRows.length !== Object.keys(EVIDENCE_KINDS).length) {
    await event(orderId, "ai.failed", { code: "EVIDENCE_INCOMPLETE" });
    await getDb().update(orders).set({ status: "rueckfrage", updatedAt: new Date() }).where(eq(orders.id, orderId));
    return { state: "failed" as const, code: "EVIDENCE_INCOMPLETE" };
  }

  await getDb().transaction(async (tx) => {
    await tx.update(orders).set({ status: "in_pruefung", updatedAt: new Date() }).where(eq(orders.id, orderId));
    await tx.insert(orderEvents).values({ id: randomUUID(), orderId, actor: "ai", action: "ai.processing.started", detail: {} });
  });

  const uploadedKeys: string[] = [];
  try {
    const evidence = await Promise.all(evidenceRows.map(async (file) => ({
      kind: file.kind,
      filename: file.originalName,
      mediaType: file.mediaType,
      buffer: await getPrivateObject(file.objectKey),
    })));
    const { model, extraction } = await extractVehicleData(evidence);
    const reviewReasons = assessVehicleExtraction(extraction, { vin: order.vin, firstRegistration: order.firstRegistration || "" });
    const rendered = await renderDrafts(rendererData(extraction, order));
    const rows: Array<typeof documents.$inferInsert> = [];
    for (const file of rendered) {
      const objectKey = `orders/${orderId}/ai-drafts/${file.kind}/${randomUUID()}.pdf`;
      await putPrivateObject(objectKey, file.buffer, "application/pdf");
      uploadedKeys.push(objectKey);
      rows.push({
        id: randomUUID(), orderId, kind: file.kind, originalName: file.filename, objectKey,
        mediaType: "application/pdf", size: file.buffer.length,
        sha256: createHash("sha256").update(file.buffer).digest("hex"),
      });
    }
    await getDb().transaction(async (tx) => {
      await tx.insert(documents).values(rows);
      await tx.update(orders).set({
        status: reviewReasons.length ? "rueckfrage" : "in_pruefung",
        make: extraction.fields.marke || order.make,
        model: extraction.fields.handelsname || order.model,
        vinLocation: extraction.fields.vin_ort || order.vinLocation,
        updatedAt: new Date(),
      }).where(eq(orders.id, orderId));
      await tx.insert(orderEvents).values({
        id: randomUUID(), orderId, actor: "ai", action: "ai.processing.completed",
        detail: { model, confidence: extraction.confidence, criticalConfidence: extraction.criticalConfidence, reviewReasons, fields: extraction.fields, reifen_liste: extraction.reifen_liste },
      });
    });
    console.info("order_ai_completed", { orderId, model, confidence: extraction.confidence, reviewCount: reviewReasons.length });
    return { state: "completed" as const, reviewReasons };
  } catch (error) {
    await Promise.allSettled(uploadedKeys.map(deletePrivateObject));
    const code = safeErrorCode(error);
    await getDb().transaction(async (tx) => {
      await tx.update(orders).set({ status: "rueckfrage", updatedAt: new Date() }).where(eq(orders.id, orderId));
      await tx.insert(orderEvents).values({ id: randomUUID(), orderId, actor: "ai", action: "ai.processing.failed", detail: { code } });
    }).catch(() => undefined);
    console.error("order_ai_failed", { orderId, code });
    return { state: "failed" as const, code };
  }
}
