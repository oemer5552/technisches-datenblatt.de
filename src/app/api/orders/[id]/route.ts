import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { documents, orders } from "@/db/schema";
import { DOWNLOAD_RESULT_KINDS } from "@/lib/site";
import { tokenMatches } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const token = new URL(request.url).searchParams.get("token") || "";
  const [order] = await getDb().select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order || !tokenMatches(token, order.accessTokenHash)) return Response.json({ error: "Auftrag oder Zugriffscode ungültig" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const resultKinds = Object.keys(DOWNLOAD_RESULT_KINDS);
  const files = await getDb().select({ id: documents.id, kind: documents.kind, name: documents.originalName, mediaType: documents.mediaType, createdAt: documents.createdAt }).from(documents).where(and(eq(documents.orderId, id), inArray(documents.kind, resultKinds)));
  return Response.json({ id: order.id, reference: order.reference, locale: order.locale, status: order.status, paymentStatus: order.paymentStatus, createdAt: order.createdAt, updatedAt: order.updatedAt, files: files.map((file) => ({ ...file, label: DOWNLOAD_RESULT_KINDS[file.kind as keyof typeof DOWNLOAD_RESULT_KINDS], downloadUrl: `/api/orders/${id}/files/${file.id}?token=${encodeURIComponent(token)}` })) }, { headers: { "Cache-Control": "no-store" } });
}
