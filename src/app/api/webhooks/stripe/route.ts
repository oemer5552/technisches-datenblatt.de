import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { getDb } from "@/db";
import { orderEvents, orders } from "@/db/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY; const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) return Response.json({ error: "Webhook nicht konfiguriert" }, { status: 503 });
  const signature = request.headers.get("stripe-signature"); if (!signature) return Response.json({ error: "Signatur fehlt" }, { status: 400 });
  let event: Stripe.Event;
  try { event = new Stripe(secret).webhooks.constructEvent(await request.text(), signature, webhookSecret); }
  catch { return Response.json({ error: "Signatur ungültig" }, { status: 400 }); }
  if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session; const id = session.metadata?.order_id || session.client_reference_id;
    if (id && ["paid", "no_payment_required"].includes(session.payment_status)) await getDb().transaction(async (tx) => {
      await tx.update(orders).set({ paymentStatus: "paid", status: "in_pruefung", paymentProvider: "stripe", paymentReference: session.id, updatedAt: new Date() }).where(eq(orders.id, id));
      await tx.insert(orderEvents).values({ id: randomUUID(), orderId: id, actor: "stripe", action: "payment.confirmed", detail: { sessionId: session.id } });
    });
  }
  return Response.json({ received: true });
}

