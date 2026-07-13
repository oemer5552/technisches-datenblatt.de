import { createHash } from "node:crypto";

const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/png"]);

export function detectMediaType(buffer: Buffer): string | null {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  return null;
}

export function validateDocument(file: File, buffer: Buffer, imagesOnly = false) {
  const mediaType = detectMediaType(buffer);
  if (!mediaType || !ALLOWED.has(mediaType)) throw new Error(`${file.name}: Dateityp nicht erlaubt`);
  if (imagesOnly && mediaType === "application/pdf") throw new Error(`${file.name}: Hier ist ein Foto erforderlich`);
  if (file.type && file.type !== mediaType && !(file.type === "image/jpg" && mediaType === "image/jpeg")) {
    throw new Error(`${file.name}: Dateiendung und Dateiinhalt stimmen nicht überein`);
  }
  return { mediaType, sha256: createHash("sha256").update(buffer).digest("hex") };
}

export function extensionFor(mediaType: string) {
  if (mediaType === "application/pdf") return ".pdf";
  if (mediaType === "image/png") return ".png";
  return ".jpg";
}

