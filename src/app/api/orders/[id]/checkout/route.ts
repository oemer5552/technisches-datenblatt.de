import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { getDb } from "@/db";
import { orderEvents, orders } from "@/db/schema";
import { sameOrigin } from "@/lib/auth";
import { tokenMatches } from "@/lib/security";
import { SITE, getProduct } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "Ungültige Anfragequelle" }, { status: 403 });
  const { id } = await params; const body = await request.json().catch(() => ({}));
  const token = String(body.accessToken || ""); const locale = body.locale === "en" ? "en" : "de";
  const [order] = await getDb().select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order || !tokenMatches(token, order.accessTokenHash)) return Response.json({ error: "Auftrag oder Zugriffscode ungültig" }, { status: 401 });
  const baseUrl = (process.env.PUBLIC_BASE_URL || new URL(request.url).origin).replace(/\/$/, "");
  const statusUrl = `${baseUrl}/${locale}/status?id=${id}&token=${encodeURIComponent(token)}`;
  if (order.paymentStatus === "paid") return Response.json({ checkoutUrl: statusUrl });

  if (process.env.PAYMENT_MODE !== "stripe" || !process.env.STRIPE_SECRET_KEY) {
    await getDb().transaction(async (tx) => {
      await tx.update(orders).set({ status: "zahlung_offen", paymentProvider: "manual", updatedAt: new Date() }).where(eq(orders.id, id));
      await tx.insert(orderEvents).values({ id: randomUUID(), orderId: id, actor: "system", action: "payment.manual_selected", detail: {} });
    });
    return Response.json({ checkoutUrl: statusUrl, paymentMode: "manual" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const product = getProduct(order.service);
  const session = await stripe.checkout.sessions.create({
    mode: "payment", locale: locale === "de" ? "de" : "en", client_reference_id: id, customer_email: order.customerEmail,
    success_url: `${baseUrl}/${locale}/status?id=${id}&paid=1`, cancel_url: `${baseUrl}/${locale}/status?id=${id}&cancelled=1`,
    line_items: [{ quantity: 1, price_data: { currency: SITE.currency, unit_amount: order.priceCents, product_data: { name: locale === "de" ? product.name : product.nameEn, description: product.stripeDescription } } }],
    metadata: { order_id: id, reference: order.reference },
  });
  await getDb().update(orders).set({ status: "zahlung_offen", paymentProvider: "stripe", paymentReference: session.id, updatedAt: new Date() }).where(eq(orders.id, id));
  return Response.json({ checkoutUrl: session.url });
}
