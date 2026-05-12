import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, hasLocale } from "@/i18n/dictionaries";

function getLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const preferred = acceptLanguage.split(",")[0].trim().split(";")[0];
  return hasLocale(preferred) ? preferred : defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
