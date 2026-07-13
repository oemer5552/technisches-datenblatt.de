"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUSES, PAYMENT_STATUSES, RESULT_KINDS } from "@/lib/site";

export function AdminActions({ orderId, status, paymentStatus }: { orderId: string; status: string; paymentStatus: string }) {
  const router = useRouter(); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function update(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); const data = new FormData(event.currentTarget); const response = await fetch(`/api/app/orders/${orderId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: data.get("status"), paymentStatus: data.get("paymentStatus") }) }); const result = await response.json(); setMessage(response.ok ? "Status gespeichert." : result.error); setBusy(false); if (response.ok) router.refresh(); }
  async function upload(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); const response = await fetch(`/api/app/orders/${orderId}/documents`, { method: "POST", body: new FormData(event.currentTarget) }); const result = await response.json(); setMessage(response.ok ? "Ergebnisdokument hochgeladen." : result.error); setBusy(false); if (response.ok) { event.currentTarget.reset(); router.refresh(); } }
  return <section className="admin-actions"><form onSubmit={update}><h2>Status & Zahlung</h2><label><span>Bearbeitungsstatus</span><select name="status" defaultValue={status}>{ORDER_STATUSES.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></label><label><span>Zahlungsstatus</span><select name="paymentStatus" defaultValue={paymentStatus}>{PAYMENT_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></label><button className="button primary small" disabled={busy}>Speichern</button></form><form onSubmit={upload}><h2>Ergebnis bereitstellen</h2><label><span>Dokumentart</span><select name="kind">{Object.entries(RESULT_KINDS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span>PDF oder Bild</span><input name="file" type="file" accept="application/pdf,image/jpeg,image/png" required/></label><button className="button primary small" disabled={busy}>Sicher hochladen</button></form>{message && <div className="notice success">{message}</div>}</section>;
}

