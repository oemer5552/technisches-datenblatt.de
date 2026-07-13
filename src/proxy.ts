import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/") return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url), 308);
  const firstSegment = pathname.split("/")[1];
  const headers = new Headers(request.headers);
  headers.set("x-td-locale", isLocale(firstSegment) ? firstSegment : defaultLocale);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };

