import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function normalizeVin(value: string): string {
  return value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
}

export function createAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function tokenMatches(value: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashToken(value), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function safeFilename(value: string): string {
  const base = value.split(/[\\/]/).pop() || "dokument";
  return base.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[.-]+|[.-]+$/g, "").slice(0, 100) || "dokument";
}

export function makeReference(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `TD-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!/^[a-f0-9]{32}$/i.test(saltHex || "") || !/^[a-f0-9]{128}$/i.test(hashHex || "")) return false;
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(hashHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

