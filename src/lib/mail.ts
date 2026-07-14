import nodemailer, { type SendMailOptions } from "nodemailer";
import { formatEuCountry } from "./eu-countries";
import type { Locale } from "./i18n";
import { SITE } from "./site";

type DeliveryState = "sent" | "failed" | "skipped";

export type OrderMailInput = {
  id: string;
  accessToken: string;
  reference: string;
  locale: Locale;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  company: string | null;
  vin: string;
  firstRegistration: string;
  originCountry: string;
  notes: string | null;
  priceCents: number;
  testMode: boolean;
};

export type OrderMailResult = {
  customer: DeliveryState;
  operator: DeliveryState;
};

function smtpConfiguration() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const port = Number.parseInt(process.env.SMTP_PORT || "465", 10);

  if (!host || !user || !password || !Number.isInteger(port)) return null;
  const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase();

  return {
    host,
    port,
    secure: secureValue ? ["1", "true", "yes"].includes(secureValue) : port === 465,
    user,
    password,
  };
}

export function mailConfigured() {
  return smtpConfiguration() !== null;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

function safeErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return "UNKNOWN";
  return String(error.code).slice(0, 80);
}

async function deliver(
  transport: nodemailer.Transporter,
  channel: "customer" | "operator",
  options: SendMailOptions,
): Promise<DeliveryState> {
  try {
    await transport.sendMail(options);
    return "sent";
  } catch (error) {
    console.error("order_mail_delivery_failed", { channel, code: safeErrorCode(error) });
    return "failed";
  }
}

export async function sendOrderCreatedEmails(input: OrderMailInput): Promise<OrderMailResult> {
  const smtp = smtpConfiguration();
  if (!smtp) {
    console.warn("order_mail_skipped", { reason: "smtp_not_configured" });
    return { customer: "skipped", operator: "skipped" };
  }

  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  const baseUrl = (process.env.PUBLIC_BASE_URL || "https://technisches-datenblatt.de").replace(/\/$/, "");
  const statusUrl = `${baseUrl}/${input.locale}/status?id=${encodeURIComponent(input.id)}&token=${encodeURIComponent(input.accessToken)}`;
  const adminUrl = `${baseUrl}/de/app/${encodeURIComponent(input.id)}`;
  const from = process.env.MAIL_FROM?.trim() || `technisches-datenblatt.de <${smtp.user}>`;
  const operatorEmail = process.env.ORDER_NOTIFICATION_EMAIL?.trim() || SITE.email;
  const de = input.locale === "de";
  const country = formatEuCountry(input.originCountry, input.locale);
  const price = (input.priceCents / 100).toLocaleString(de ? "de-DE" : "en-IE", { style: "currency", currency: "EUR" });
  const mode = input.testMode ? (de ? "Kostenloser Testauftrag" : "Free test order") : price;

  const customerSubject = de
    ? `Ihre Anfrage ${input.reference} ist eingegangen`
    : `We received your request ${input.reference}`;
  const customerText = de
    ? `Hallo ${input.customerName},\n\nIhre Anfrage ${input.reference} ist sicher bei uns eingegangen.\n\nFIN: ${input.vin}\nErstzulassung: ${input.firstRegistration}\nHerkunftsland: ${country}\nModus: ${mode}\n\nPersönlicher Auftragsstatus:\n${statusUrl}\n\nBitte bewahren Sie diesen persönlichen Link vertraulich auf.\n\nAutohaus Dörrschuck Handels GmbH`
    : `Hello ${input.customerName},\n\nWe securely received your request ${input.reference}.\n\nVIN: ${input.vin}\nFirst registration: ${input.firstRegistration}\nCountry of origin: ${country}\nMode: ${mode}\n\nYour personal order status:\n${statusUrl}\n\nPlease keep this personal link confidential.\n\nAutohaus Dörrschuck Handels GmbH`;
  const customerHtml = `<!doctype html><html lang="${input.locale}"><body style="margin:0;background:#f4f4f2;color:#18201d;font-family:Arial,sans-serif"><div style="max-width:620px;margin:0 auto;padding:32px 18px"><div style="background:#fff;border-top:5px solid #b4202a;padding:28px;border-radius:4px"><p style="margin:0 0 8px;color:#b4202a;font-weight:700">technisches-datenblatt.de</p><h1 style="font-size:24px;margin:0 0 18px">${escapeHtml(customerSubject)}</h1><p>${de ? "Hallo" : "Hello"} ${escapeHtml(input.customerName)},</p><p>${de ? "Ihre Anfrage ist sicher bei uns eingegangen." : "We securely received your request."}</p><table style="width:100%;border-collapse:collapse;margin:20px 0"><tr><td style="padding:8px 0;border-bottom:1px solid #ddd">${de ? "Referenz" : "Reference"}</td><td style="padding:8px 0;border-bottom:1px solid #ddd;text-align:right;font-weight:700">${escapeHtml(input.reference)}</td></tr><tr><td style="padding:8px 0;border-bottom:1px solid #ddd">FIN</td><td style="padding:8px 0;border-bottom:1px solid #ddd;text-align:right">${escapeHtml(input.vin)}</td></tr><tr><td style="padding:8px 0;border-bottom:1px solid #ddd">${de ? "Erstzulassung" : "First registration"}</td><td style="padding:8px 0;border-bottom:1px solid #ddd;text-align:right">${escapeHtml(input.firstRegistration)}</td></tr><tr><td style="padding:8px 0">${de ? "Herkunftsland" : "Country of origin"}</td><td style="padding:8px 0;text-align:right">${escapeHtml(country)}</td></tr></table><p><a href="${escapeHtml(statusUrl)}" style="display:inline-block;background:#b4202a;color:#fff;text-decoration:none;padding:13px 18px;border-radius:3px;font-weight:700">${de ? "Auftragsstatus öffnen" : "Open order status"}</a></p><p style="font-size:13px;color:#59615e">${de ? "Dieser Link enthält Ihren persönlichen Zugriffscode. Bitte nicht weitergeben." : "This link contains your personal access code. Please do not share it."}</p></div></div></body></html>`;

  const operatorText = `Neue Anfrage ${input.reference}\n\nKunde: ${input.customerName}\nE-Mail: ${input.customerEmail}\nTelefon: ${input.customerPhone || "—"}\nUnternehmen: ${input.company || "—"}\nFIN: ${input.vin}\nErstzulassung: ${input.firstRegistration}\nEU-Herkunftsland: ${country}\nHinweise: ${input.notes || "—"}\nModus: ${mode}\n\nIm Backoffice öffnen:\n${adminUrl}`;
  const operatorHtml = `<!doctype html><html lang="de"><body style="font-family:Arial,sans-serif;color:#18201d"><h1>Neue Anfrage ${escapeHtml(input.reference)}</h1><table style="border-collapse:collapse"><tr><td style="padding:6px 14px 6px 0">Kunde</td><td><strong>${escapeHtml(input.customerName)}</strong></td></tr><tr><td style="padding:6px 14px 6px 0">E-Mail</td><td>${escapeHtml(input.customerEmail)}</td></tr><tr><td style="padding:6px 14px 6px 0">Telefon</td><td>${escapeHtml(input.customerPhone || "—")}</td></tr><tr><td style="padding:6px 14px 6px 0">Unternehmen</td><td>${escapeHtml(input.company || "—")}</td></tr><tr><td style="padding:6px 14px 6px 0">FIN</td><td>${escapeHtml(input.vin)}</td></tr><tr><td style="padding:6px 14px 6px 0">Erstzulassung</td><td>${escapeHtml(input.firstRegistration)}</td></tr><tr><td style="padding:6px 14px 6px 0">EU-Herkunftsland</td><td>${escapeHtml(country)}</td></tr><tr><td style="padding:6px 14px 6px 0">Hinweise</td><td>${escapeHtml(input.notes || "—")}</td></tr><tr><td style="padding:6px 14px 6px 0">Modus</td><td>${escapeHtml(mode)}</td></tr></table><p><a href="${escapeHtml(adminUrl)}">Anfrage im Backoffice öffnen</a></p></body></html>`;

  try {
    const [customer, operator] = await Promise.all([
      deliver(transport, "customer", {
        from,
        to: input.customerEmail,
        replyTo: SITE.email,
        subject: customerSubject,
        text: customerText,
        html: customerHtml,
      }),
      deliver(transport, "operator", {
        from,
        to: operatorEmail,
        replyTo: input.customerEmail,
        subject: `Neue Anfrage ${input.reference} · ${input.vin}`,
        text: operatorText,
        html: operatorHtml,
      }),
    ]);

    return { customer, operator };
  } finally {
    transport.close();
  }
}
