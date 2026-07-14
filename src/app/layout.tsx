import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const baseUrl = process.env.PUBLIC_BASE_URL || "https://technisches-datenblatt.de";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: "Technisches Datenblatt, COC & HU/AU für Importfahrzeuge", template: "%s | technisches-datenblatt.de" },
  description: "Ausländische Fahrzeuge in Deutschland oder deutsche Fahrzeuge im EU-Ausland zulassen: technisches Datenblatt, COC-/Typdaten und HU/AU-Paket.",
  applicationName: "technisches-datenblatt.de",
  creator: "Autohaus Dörrschuck Handels GmbH",
  publisher: "Autohaus Dörrschuck Handels GmbH",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: { type: "website", siteName: "technisches-datenblatt.de", locale: "de_DE" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { colorScheme: "light dark", themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f2f0e9" }, { media: "(prefers-color-scheme: dark)", color: "#0b100f" }] };

const themeScript = `(function(){try{var t=localStorage.getItem('td-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}})()`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get("x-td-locale") || "de";
  return (
    <html lang={locale} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
