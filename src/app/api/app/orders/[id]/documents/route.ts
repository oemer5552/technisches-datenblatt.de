import { randomUUID } from "node:crypto";
import { getDb } from "@/db";
import { documents, orderEvents } from "@/db/schema";
import { hasAdminSession, sameOrigin } from "@/lib/auth";
import { extensionFor, validateDocument } from "@/lib/files";
import { safeFilename } from "@/lib/security";
import { MAX_UPLOAD_BYTES, RESULT_KINDS, type ResultKind } from "@/lib/site";
import { deletePrivateObject, putPrivateObject } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !(await hasAdminSession())) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  const { id } = await params; let objectKey = "";
  try {
    const form = await request.formData(); const kind = String(form.get("kind") || "") as ResultKind; const file = form.get("file");
    if (!(kind in RESULT_KINDS)) return Response.json({ error: "Dokumentart ungültig" }, { status: 400 });
    if (!(file instanceof File) || !file.size || file.size > MAX_UPLOAD_BYTES) return Response.json({ error: "Eine Datei bis 20 MB ist erforderlich" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer()); const validated = validateDocument(file, buffer);
    objectKey = `orders/${id}/results/${kind}/${randomUUID()}${extensionFor(validated.mediaType)}`;
    await putPrivateObject(objectKey, buffer, validated.mediaType);
    await getDb().transaction(async (tx) => {
      await tx.insert(documents).values({ id: randomUUID(), orderId: id, kind, originalName: safeFilename(file.name), objectKey, mediaType: validated.mediaType, size: buffer.length, sha256: validated.sha256 });
      await tx.insert(orderEvents).values({ id: randomUUID(), orderId: id, actor: "admin", action: "result.uploaded", detail: { kind } });
    });
    return Response.json({ ok: true });
  } catch (reason) {
    if (objectKey) await deletePrivateObject(objectKey).catch(() => undefined);
    const message = reason instanceof Error ? reason.message : "Upload fehlgeschlagen";
    return Response.json({ error: message }, { status: 400 });
  }
}

