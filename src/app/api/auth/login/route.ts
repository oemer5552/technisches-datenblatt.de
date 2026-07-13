import { AUTH_COOKIE, createAdminSession, isValidAdminPassword, loginAllowed, recordLogin, requestIp, sameOrigin } from "@/lib/auth";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Ungültige Anfragequelle" }, { status: 403 });
  const ip = requestIp(request); if (!loginAllowed(ip)) return Response.json({ error: "Zu viele Versuche. Bitte warte 15 Minuten." }, { status: 429 });
  const body = await request.json().catch(() => ({})); const valid = isValidAdminPassword(String(body.password || "")); recordLogin(ip, valid);
  if (!valid) return Response.json({ error: "Passwort ungültig" }, { status: 401 });
  const response = Response.json({ ok: true });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append("Set-Cookie", `${AUTH_COOKIE}=${await createAdminSession()}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=28800`);
  return response;
}
