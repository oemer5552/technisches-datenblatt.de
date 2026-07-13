import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orderEvents, orders } from "@/db/schema";
import { hasAdminSession, sameOrigin } from "@/lib/auth";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/site";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !(await hasAdminSession())) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  const { id } = await params; const body = await request.json().catch(() => ({}));
  const status = String(body.status || ""); const paymentStatus = String(body.paymentStatus || "");
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number]) || !PAYMENT_STATUSES.includes(paymentStatus as (typeof PAYMENT_STATUSES)[number])) return Response.json({ error: "Status ungültig" }, { status: 400 });
  await getDb().transaction(async (tx) => {
    await tx.update(orders).set({ status, paymentStatus, updatedAt: new Date() }).where(eq(orders.id, id));
    await tx.insert(orderEvents).values({ id: randomUUID(), orderId: id, actor: "admin", action: "order.updated", detail: { status, paymentStatus } });
  });
  return Response.json({ ok: true });
}

