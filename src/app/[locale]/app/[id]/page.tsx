import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminActions } from "@/components/admin-actions";
import { AdminShell } from "@/components/admin-shell";
import { getDb } from "@/db";
import { documents, orderEvents, orders } from "@/db/schema";
import { hasAdminSession } from "@/lib/auth";
import { formatEuCountry } from "@/lib/eu-countries";
import { isLocale } from "@/lib/i18n";
import { paymentsEnabled } from "@/lib/payments";
import { EVIDENCE_KINDS, RESULT_KINDS } from "@/lib/site";

export const metadata: Metadata = { title: "Auftragsdetails", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OrderDetail({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params; if (!isLocale(locale)) notFound(); if (!(await hasAdminSession())) redirect(`/${locale}/app/login`);
  const [order] = await getDb().select().from(orders).where(eq(orders.id, id)).limit(1); if (!order) notFound();
  const [files, events] = await Promise.all([getDb().select().from(documents).where(eq(documents.orderId, id)).orderBy(asc(documents.createdAt)), getDb().select().from(orderEvents).where(eq(orderEvents.orderId, id)).orderBy(asc(orderEvents.createdAt))]);
  const labels = { ...EVIDENCE_KINDS, ...RESULT_KINDS } as Record<string, string>;
  return <AdminShell locale={locale} title={order.reference}><Link className="back-link" href={`/${locale}/app`}>← Alle Aufträge</Link><div className="detail-grid"><section className="admin-panel"><h2>Kunde & Fahrzeug</h2><dl><dt>Leistung</dt><dd>{order.service === "data" ? "Digitales Fahrzeugdatenpaket" : "Altauftrag"} · {(order.priceCents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}{order.paymentProvider === "test" ? " · Testbetrieb" : ""}</dd><dt>Name</dt><dd>{order.customerName}</dd><dt>E-Mail</dt><dd><a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a></dd><dt>Telefon</dt><dd>{order.customerPhone || "—"}</dd><dt>Unternehmen</dt><dd>{order.company || "—"}</dd><dt>FIN</dt><dd className="mono">{order.vin}</dd><dt>Erstzulassung</dt><dd>{order.firstRegistration || "—"}</dd><dt>EU-Herkunftsland</dt><dd>{formatEuCountry(order.originCountry, "de")}</dd><dt>FIN-Fundstelle (intern)</dt><dd>{order.vinLocation || "Noch nicht ermittelt"}</dd><dt>Hinweise</dt><dd>{order.notes || "—"}</dd></dl></section><section className="admin-panel"><h2>Dokumente</h2><ul className="document-list">{files.map((file) => <li key={file.id}><div><b>{labels[file.kind] || file.kind}</b><small>{file.originalName} · {(file.size / 1024 / 1024).toFixed(2)} MB</small></div><a className="button ghost small" href={`/api/app/documents/${file.id}`}>Abrufen</a></li>)}</ul></section></div><AdminActions orderId={id} status={order.status} paymentStatus={order.paymentStatus} paymentsEnabled={paymentsEnabled()}/><section className="admin-panel timeline"><h2>Protokoll</h2>{events.map((event) => <div key={event.id}><span>{event.createdAt.toLocaleString("de-DE")}</span><b>{event.action}</b><small>{event.actor}</small></div>)}</section></AdminShell>;
}
