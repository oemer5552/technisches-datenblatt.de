import { AUTH_COOKIE, hasAdminSession, sameOrigin } from "@/lib/auth";
export async function POST(request: Request) {
  if (!sameOrigin(request) || !(await hasAdminSession())) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  const response = Response.json({ ok: true }); const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""; response.headers.append("Set-Cookie", `${AUTH_COOKIE}=; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=0`); return response;
}
