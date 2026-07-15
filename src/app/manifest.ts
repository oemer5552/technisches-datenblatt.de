import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "technisches-datenblatt.de", short_name: "TD.de", description: "Technische Fahrzeugdaten digital beauftragen.", start_url: "/de", display: "standalone", background_color: "#e7ebf0", theme_color: "#046bd2", lang: "de" };
}
