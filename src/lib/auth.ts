import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { verifyPassword } from "./security";

export const AUTH_COOKIE = "td_admin";

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET ist nicht sicher konfiguriert");
  return new TextEncoder().encode(secret);
}

export function isValidAdminPassword(value: string) {
  return verifyPassword(value, process.env.ADMIN_PASSWORD_HASH || "");
}

export async function createAdminSession() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("technisches-datenblatt-admin")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key());
}

export async function verifyAdminSession(token?: string) {
  if (!token) return false;
  try {
    const result = await jwtVerify(token, key(), { algorithms: ["HS256"], subject: "technisches-datenblatt-admin" });
    return result.payload.role === "admin";
  } catch {
    return false;
  }
}

export async function hasAdminSession() {
  return verifyAdminSession((await cookies()).get(AUTH_COOKIE)?.value);
}

type Attempt = { count: number; resetAt: number };
const globalAttempts = globalThis as unknown as { tdLoginAttempts?: Map<string, Attempt> };
const attempts = globalAttempts.tdLoginAttempts || new Map<string, Attempt>();
globalAttempts.tdLoginAttempts = attempts;

export function loginAllowed(ip: string) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt < now) return true;
  return current.count < 5;
}

export function recordLogin(ip: string, success: boolean) {
  if (success) return attempts.delete(ip);
  const now = Date.now();
  const current = attempts.get(ip);
  attempts.set(ip, !current || current.resetAt < now ? { count: 1, resetAt: now + 15 * 60_000 } : { ...current, count: current.count + 1 });
}

export function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const expected = process.env.PUBLIC_BASE_URL;
  if (expected) return origin === new URL(expected).origin;
  return origin === new URL(request.url).origin;
}

