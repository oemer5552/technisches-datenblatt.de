import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { documents, orders } from "@/db/schema";
import { tokenMatches } from "@/lib/security";
import { DOWNLOAD_RESULT_KINDS } from "@/lib/site";
import { signedPrivateUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params; const token = new URL(request.url).searchParams.get("token") || "";
  const [order] = await getDb().select({ accessTokenHash: orders.accessTokenHash }).from(orders).where(eq(orders.id, id)).limit(1);
  if (!order || !tokenMatches(token, order.accessTokenHash)) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  const [file] = await getDb().select().from(documents).where(and(eq(documents.id, fileId), eq(documents.orderId, id), inArray(documents.kind, Object.keys(DOWNLOAD_RESULT_KINDS)))).limit(1);
  if (!file) return Response.json({ error: "Dokument nicht gefunden" }, { status: 404 });
  return Response.redirect(await signedPrivateUrl(file.objectKey, file.originalName), 303);
}
