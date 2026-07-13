import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.PUBLIC_BASE_URL || "https://technisches-datenblatt.de").replace(/\/$/, "");
  const routes = ["", "/status", "/wissen/technisches-datenblatt-importfahrzeug", "/wissen/coc-papiere", "/wissen/fin-fahrgestellnummer", "/impressum", "/datenschutz", "/agb", "/widerruf"];
  return locales.flatMap((locale) => routes.map((route) => ({ url: `${base}/${locale}${route}`, lastModified: new Date(), changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : route.startsWith("/wissen") ? .8 : .4 })));
}

