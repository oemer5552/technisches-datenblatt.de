import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { hasAdminSession } from "@/lib/auth";
import { formatEuropeanCountry } from "@/lib/european-countries";
import { isLocale } from "@/lib/i18n";
import { statusLabels } from "@/lib/status";

export const metadata: Metadata = { title: "Aufträge", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound(); if (!(await hasAdminSession())) redirect(`/${locale}/app/login`);
  const rows = await getDb().select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
  return <AdminShell locale={locale} title="Aufträge"><section className="admin-stats"><div><small>Gesamt</small><strong>{rows.length}</strong></div><div><small>In Prüfung</small><strong>{rows.filter((row) => row.status === "in_pruefung").length}</strong></div><div><small>Fertig</small><strong>{rows.filter((row) => row.status === "fertiggestellt").length}</strong></div></section><section className="table-wrap"><table><thead><tr><th>Referenz</th><th>Kunde</th><th>Fahrzeug</th><th>Zahlung</th><th>Status</th><th>Eingang</th></tr></thead><tbody>{rows.map((order) => <tr key={order.id}><td><Link href={`/${locale}/app/${order.id}`}>{order.reference}</Link></td><td><b>{order.customerName}</b><small>{order.customerEmail}</small></td><td><b>{formatEuropeanCountry(order.originCountry, "de")}</b><small>{order.vin} · EZ {order.firstRegistration || "—"}</small></td><td><span className={`badge ${order.paymentStatus}`}>{order.paymentStatus}</span></td><td>{statusLabels[order.status]?.de || order.status}</td><td>{order.createdAt.toLocaleString("de-DE")}</td></tr>)}{!rows.length && <tr><td colSpan={6}>Noch keine Aufträge vorhanden.</td></tr>}</tbody></table></section></AdminShell>;
}
