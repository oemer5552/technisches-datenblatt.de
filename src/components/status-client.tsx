"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { RESULT_KINDS } from "@/lib/site";
import { statusLabels } from "@/lib/status";
import { Icon } from "./icons";

type OrderStatus = { id: string; reference: string; status: string; paymentStatus: string; createdAt: string; updatedAt: string; files: Array<{ id: string; kind: keyof typeof RESULT_KINDS; label: string; downloadUrl: string }> };

export function StatusClient({ locale }: { locale: Locale }) {
  const query = useSearchParams(); const de = locale === "de";
  const [id, setId] = useState(() => query.get("id") || ""); const [token, setToken] = useState(() => query.get("token") || ""); const [order, setOrder] = useState<OrderStatus | null>(null); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);

  async function load(orderId: string, accessToken: string) {
    if (!orderId || !accessToken) return; setBusy(true); setError("");
    const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}?token=${encodeURIComponent(accessToken)}`, { cache: "no-store" }); const result = await response.json();
    if (!response.ok) { setError(de ? "Auftrag oder Zugriffscode ist ungültig." : "Order or access code is invalid."); setOrder(null); } else { setOrder(result); sessionStorage.setItem("td-order-id", orderId); sessionStorage.setItem("td-order-token", accessToken); }
    setBusy(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextId = query.get("id") || sessionStorage.getItem("td-order-id") || ""; const nextToken = query.get("token") || sessionStorage.getItem("td-order-token") || "";
      setId(nextId); setToken(nextToken); if (nextId && nextToken) void load(nextId, nextToken);
    }, 0);
    return () => window.clearTimeout(timer);
    // The initial status is deliberately loaded only when entering this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(event: React.FormEvent) { event.preventDefault(); void load(id.trim(), token.trim()); }

  if (order) return <div className="status-card"><div className="status-head"><div><span>{de ? "Auftragsnummer" : "Order reference"}</span><h2>{order.reference}</h2></div><span className="status-pill">{statusLabels[order.status]?.[locale] || order.status}</span></div><div className="status-progress"><span className="done"/><span className={["in_pruefung","rueckfrage","fertiggestellt"].includes(order.status) ? "done" : ""}/><span className={order.status === "fertiggestellt" ? "done" : ""}/></div><div className="status-meta"><div><small>{de ? "Zahlung" : "Payment"}</small><b>{order.paymentStatus === "paid" ? (de ? "Bezahlt" : "Paid") : (de ? "Noch offen" : "Pending")}</b></div><div><small>{de ? "Eingang" : "Received"}</small><b>{new Date(order.createdAt).toLocaleDateString(locale)}</b></div><div><small>{de ? "Letzte Änderung" : "Last update"}</small><b>{new Date(order.updatedAt).toLocaleString(locale)}</b></div></div>{order.paymentStatus !== "paid" && <div className="notice neutral">{de ? "Die Zahlung ist noch offen. Wir senden dir die Zahlungsinformationen separat beziehungsweise leiten dich nach Aktivierung direkt zu Stripe weiter." : "Payment is still pending. Payment information will be provided separately or via Stripe once enabled."}</div>}<div className="result-list"><h3>{de ? "Ergebnisdokumente" : "Result documents"}</h3>{order.files.length ? order.files.map((file) => <a key={file.id} href={file.downloadUrl}><Icon name="file"/><span><b>{file.label}</b><small>{de ? "Geschützt herunterladen" : "Protected download"}</small></span><Icon name="arrow"/></a>) : <p>{de ? "Noch keine Ergebnisdokumente freigegeben. Diese Ansicht aktualisiert sich nach erneutem Aufruf." : "No result documents have been released yet. Return later to refresh."}</p>}</div><button className="button ghost small" onClick={() => { setOrder(null); setId(""); setToken(""); }}>{de ? "Anderen Auftrag prüfen" : "Check another order"}</button></div>;

  return <form className="status-form" onSubmit={submit}><div><span className="kicker">{de ? "Geschützter Abruf" : "Protected access"}</span><h2>{de ? "Wo steht mein Auftrag?" : "Where is my order?"}</h2><p>{de ? "Den technischen Auftragsschlüssel und Zugriffscode findest du in deinem persönlichen Statuslink." : "Your technical order key and access code are contained in your personal status link."}</p></div><label><span>{de ? "Auftragsschlüssel" : "Order key"}</span><input value={id} onChange={(event) => setId(event.target.value)} placeholder="00000000-0000-0000-0000-000000000000" required/></label><label><span>{de ? "Zugriffscode" : "Access code"}</span><input value={token} onChange={(event) => setToken(event.target.value)} type="password" autoComplete="off" required/></label>{error && <div className="notice error" role="alert">{error}</div>}<button className="button primary submit" disabled={busy}>{busy ? (de ? "Wird geprüft …" : "Checking …") : (de ? "Status sicher abrufen" : "Retrieve status")}<Icon name="arrow"/></button></form>;
}
