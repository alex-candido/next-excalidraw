import { betterFetch } from "@better-fetch/fetch";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { getGroupNameKey, groupAllowedRoutes, groupRedirects } from "@/config/roles-config";

const protectedRoutes = ["/app", "/admin"];
const authRoutes = ["/auth"];

export async function authRouteMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameWithoutLocale = pathname.replace(/^\/(pt-BR|en-US|es)/, "");

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  if (!isProtectedRoute && !isAuthRoute) return undefined;

  const { data: session } = await betterFetch<{ user: { group: string } }>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: { cookie: request.headers.get("cookie") ?? "" },
    }
  );

  const locale = pathname.split("/")[1] ?? routing.defaultLocale;

  if (!session && isProtectedRoute) {
    return NextResponse.redirect(
      new URL(`/${locale}/auth/sign-in`, request.url)
    );
  }

  if (session) {
    const groupKey = getGroupNameKey(session.user.group ?? "guest");
    const allowedRoutes = groupAllowedRoutes[groupKey];

    if (isAuthRoute) {
      return NextResponse.redirect(
        new URL(`/${locale}${groupRedirects[groupKey]}`, request.url)
      );
    }

    const hasAccess = allowedRoutes.some((route) =>
      pathnameWithoutLocale.startsWith(route)
    );

    if (!hasAccess) {
      return NextResponse.redirect(
        new URL(`/${locale}${groupRedirects[groupKey]}`, request.url)
      );
    }
  }

  return undefined;
}
