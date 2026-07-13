import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "technisches-datenblatt.de", short_name: "TD.de", description: "Technische Fahrzeugdaten digital beauftragen.", start_url: "/de", display: "standalone", background_color: "#f2f0e9", theme_color: "#183e35", lang: "de" };
}

