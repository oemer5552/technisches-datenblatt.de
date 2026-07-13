import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.PUBLIC_BASE_URL || "https://technisches-datenblatt.de";
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/de/app", "/en/app"] }], sitemap: `${base}/sitemap.xml` };
}

