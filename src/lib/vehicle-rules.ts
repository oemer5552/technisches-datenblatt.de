function normalized(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[éèê]/g, "e");
}

const COLOR_CODES: Record<string, string> = {
  weiss: "0", blanc: "0", white: "0",
  gelb: "1", beige: "1", elfenbein: "1", gold: "1", creme: "1", jaune: "1", yellow: "1",
  orange: "2",
  rot: "3", rosa: "3", rose: "3", rouge: "3", red: "3",
  lila: "4", violett: "4", violet: "4", purpur: "4", purple: "4", bordeaux: "4",
  blau: "5", bleu: "5", blue: "5",
  gruen: "6", oliv: "6", vert: "6", green: "6",
  grau: "7", silber: "7", anthrazit: "7", aluminium: "7", platin: "7", gris: "7", grey: "7", gray: "7", silver: "7",
  braun: "8", marron: "8", brun: "8", brown: "8",
  schwarz: "9", noir: "9", black: "9",
};

function singleColorCode(value: string) {
  const text = normalized(value);
  if (!text || ["—", "-", "none", "null", "unbekannt"].includes(text)) return null;
  if (["mehrfarbig", "harlekin", "multicolor", "multicolore"].some((item) => text.includes(item))) return "00";
  let best: { code: string; end: number } | null = null;
  for (const [stem, code] of Object.entries(COLOR_CODES)) {
    const index = text.lastIndexOf(stem);
    const end = index < 0 ? -1 : index + stem.length;
    if (end >= 0 && (!best || end > best.end)) best = { code, end };
  }
  return best?.code || null;
}

export function colorCode(value: string | null | undefined) {
  const parts = (value || "").split("/").filter((part) => part.trim());
  if (!parts.length) return "—";
  const codes = parts.map(singleColorCode);
  return codes.every(Boolean) ? codes.join("/") : "—";
}

export function fuelCode(value: string | null | undefined) {
  const text = normalized(value);
  if (!text || text === "—" || text === "-") return "—";
  const plugIn = text.includes("plug") || text.includes("extern");
  const hybrid = text.includes("hybrid");
  if (text.includes("elektro") && !hybrid && !text.includes("benzin") && !text.includes("diesel")) return "0004";
  if (hybrid || plugIn) {
    if (text.includes("diesel")) return plugIn ? "0026" : "0010";
    if (text.includes("benzin") || text.includes("otto")) return plugIn ? "0025" : "0008";
    return "—";
  }
  if (text.includes("diesel")) return "0002";
  if (text.includes("e85") || text.includes("ethanol")) return "0023";
  if (["lpg", "autogas", "fluessiggas"].some((item) => text.includes(item))) return text.includes("benzin") ? "0006" : "0005";
  if (text.includes("cng") || text.includes("erdgas")) return text.includes("benzin") ? "0007" : "0009";
  if (["benzin", "essence", "otto"].some((item) => text.includes(item))) return "0001";
  return "—";
}

export function hasExactApprovalNumber(value: string | null | undefined) {
  const compact = (value || "").replace(/\s/g, "");
  const parts = compact.split("*");
  return /^e\d+$/i.test(parts[0] || "") && parts.length >= 4 && parts.slice(1, -1).every(Boolean) && /^\d+$/.test(parts.at(-1) || "");
}
