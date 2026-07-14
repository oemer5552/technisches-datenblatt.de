"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { PRODUCTS, type ProductId } from "@/lib/site";
import { Icon } from "./icons";

type Created = { id: string; reference: string; accessToken: string };

export function OrderForm({ locale }: { locale: Locale }) {
  const de = locale === "de";
  const [service, setService] = useState<ProductId>("registration");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const product = PRODUCTS[service];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const formData = new FormData(event.currentTarget); formData.set("locale", locale);
      const response = await fetch("/api/orders", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || (de ? "Auftrag konnte nicht angelegt werden." : "The order could not be created."));
      const order = result as Created; setCreated(order);
      sessionStorage.setItem("td-order-id", order.id); sessionStorage.setItem("td-order-token", order.accessToken);
      const checkoutResponse = await fetch(`/api/orders/${order.id}/checkout`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ accessToken: order.accessToken, locale }) });
      const checkout = await checkoutResponse.json();
      if (!checkoutResponse.ok) throw new Error(checkout.error || (de ? "Zahlungsweg konnte nicht vorbereitet werden." : "Payment could not be prepared."));
      window.location.assign(checkout.checkoutUrl || `/${locale}/status?id=${order.id}&token=${encodeURIComponent(order.accessToken)}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unbekannter Fehler"); setBusy(false); }
  }

  return <form className="order-form" onSubmit={submit} encType="multipart/form-data">
    <div className="form-head"><div><span>{de ? "Sicheres Auftragsformular" : "Secure order form"}</span><h3>{de ? "Leistung und Fahrzeug" : "Service and vehicle"}</h3></div><Icon name="shield" size={32}/></div>
    <fieldset disabled={busy}><legend><span>01</span>{de ? "Leistung wählen" : "Choose a service"}</legend><div className="service-options">
      <label className={service === "registration" ? "service-option selected" : "service-option"}>
        <input type="radio" name="service" value="registration" checked={service === "registration"} onChange={() => setService("registration")}/>
        <span><b>{de ? "Zulassungspaket" : "Registration package"}</b><small>{de ? "HU/AU durch TÜV Hessen + technisches Datenblatt" : "Roadworthiness/emissions test by TÜV Hessen + technical data sheet"}</small></span><strong>{PRODUCTS.registration.price}</strong><em>{de ? "Empfohlen" : "Recommended"}</em>
      </label>
      <label className={service === "data" ? "service-option selected" : "service-option"}>
        <input type="radio" name="service" value="data" checked={service === "data"} onChange={() => setService("data")}/>
        <span><b>{de ? "Digitales Datenpaket" : "Digital data package"}</b><small>{de ? "Datenblatt, FIN-Erklärung und COC-/Typdaten-Prüfung" : "Data sheet, VIN declaration and COC/type-data review"}</small></span><strong>{PRODUCTS.data.price}</strong>
      </label>
    </div>{service === "registration" && <p className="service-hint">{de ? "Für HU/AU ist ein Termin mit Fahrzeugvorführung erforderlich. Wir stimmen ihn nach der Unterlagenprüfung persönlich mit dir ab." : "A vehicle appointment is required for the roadworthiness and emissions test. We arrange it with you after reviewing the documents."}</p>}</fieldset>
    <fieldset disabled={busy}><legend><span>02</span>{de ? "Kontaktdaten" : "Contact details"}</legend><div className="form-grid"><label><span>{de ? "Vor- und Nachname" : "Full name"} *</span><input name="customerName" autoComplete="name" required minLength={2}/></label><label><span>E-Mail *</span><input name="customerEmail" type="email" autoComplete="email" required/></label><label><span>{de ? "Telefon" : "Phone"}</span><input name="customerPhone" autoComplete="tel"/></label><label><span>{de ? "Unternehmen" : "Company"}</span><input name="company" autoComplete="organization"/></label></div></fieldset>
    <fieldset disabled={busy}><legend><span>03</span>{de ? "Fahrzeug" : "Vehicle"}</legend><div className="form-grid"><label className="wide"><span>{de ? "FIN / Fahrgestellnummer" : "VIN"} *</span><input name="vin" minLength={17} maxLength={20} autoCapitalize="characters" spellCheck={false} placeholder="WVWZZZ1JZ3W386752" required/></label><label><span>{de ? "Hersteller" : "Make"}</span><input name="make" placeholder="Volkswagen"/></label><label><span>{de ? "Modell" : "Model"}</span><input name="model" placeholder="Golf"/></label><label><span>{de ? "Erstzulassung" : "First registration"}</span><input name="firstRegistration" type="date"/></label><label><span>{de ? "Herkunfts- oder Zielland" : "Origin or destination country"}</span><input name="originCountry" placeholder={de ? "z. B. Italien" : "e.g. Italy"}/></label><label className="wide"><span>{de ? "Fundstelle der eingeschlagenen FIN" : "Location of stamped VIN"} *</span><input name="vinLocation" placeholder={de ? "z. B. Motorraum rechts" : "e.g. engine bay, right side"} required/></label><label className="wide"><span>{de ? "Hinweise" : "Notes"}</span><textarea name="notes" rows={3} maxLength={2000} placeholder={de ? "Import nach Deutschland oder Zulassung im EU-Ausland? Besondere Frist oder Rückfrage?" : "Import into Germany or registration in another EU country? Deadline or special question?"}/></label></div></fieldset>
    <fieldset disabled={busy}><legend><span>04</span>{de ? "Pflichtnachweise" : "Required evidence"}</legend><div className="upload-grid"><label className="upload-card"><Icon name="upload"/><b>{de ? "Ausländischer Fahrzeugschein" : "Foreign registration"} *</b><small>PDF, JPG, PNG</small><input name="foreignRegistrationDocument" type="file" accept="application/pdf,image/jpeg,image/png" required/></label><label className="upload-card"><Icon name="upload"/><b>{de ? "Fahrzeugfoto" : "Vehicle photo"} *</b><small>JPG, PNG</small><input name="vehiclePhoto" type="file" accept="image/jpeg,image/png" required/></label><label className="upload-card"><Icon name="upload"/><b>{de ? "Eingeschlagene FIN" : "Stamped VIN"} *</b><small>JPG, PNG</small><input name="stampedVinPhoto" type="file" accept="image/jpeg,image/png" required/></label></div></fieldset>
    <fieldset className="confirmations" disabled={busy}><legend><span>05</span>{de ? "Erklärungen" : "Confirmations"}</legend><label><input type="checkbox" name="vinConfirmation" value="accepted" required/><span>{de ? "Ich habe die eingeschlagene FIN selbst am Fahrzeug geprüft." : "I personally checked the stamped VIN on the vehicle."} *</span></label><label><input type="checkbox" name="privacy" value="accepted" required/><span>{de ? "Ich habe die" : "I have read the"} <Link href={`/${locale}/datenschutz`} target="_blank">{de ? "Datenschutzhinweise" : "privacy notice"}</Link> {de ? "gelesen." : "."} *</span></label><label><input type="checkbox" name="terms" value="accepted" required/><span>{de ? "Ich akzeptiere die" : "I accept the"} <Link href={`/${locale}/agb`} target="_blank">{de ? "AGB" : "terms"}</Link>. *</span></label><label><input type="checkbox" name="earlyPerformance" value="accepted" required/><span>{de ? "Ich verlange ausdrücklich, dass vor Ablauf der Widerrufsfrist mit der Dienstleistung begonnen wird." : "I expressly request performance to begin before the cancellation period ends."} *</span></label><label><input type="checkbox" name="withdrawalAck" value="accepted" required/><span>{de ? "Ich habe die" : "I have read the"} <Link href={`/${locale}/widerruf`} target="_blank">{de ? "Widerrufsbelehrung" : "cancellation policy"}</Link> {de ? "gelesen und weiß, dass mein Widerrufsrecht bei vollständiger Vertragserfüllung erlischt." : "and understand that the right ends once the service is fully performed."} *</span></label></fieldset>
    {created && <div className="notice success"><Icon name="check"/>{de ? `Auftrag ${created.reference} wurde sicher gespeichert.` : `Order ${created.reference} has been stored securely.`}</div>}
    {error && <div className="notice error" role="alert">{error}</div>}
    <button className="button primary submit" type="submit" disabled={busy}>{busy ? (de ? "Wird sicher übertragen …" : "Uploading securely …") : (de ? `${product.price} · Auftrag verbindlich starten` : `${product.price} · Place binding order`)}<Icon name="arrow"/></button><small className="form-note">{de ? `${product.price} einmalig inkl. MwSt. · Zahlungsweg im nächsten Schritt` : `${product.price} one-off incl. VAT · Payment in the next step`}</small>
  </form>;
}
