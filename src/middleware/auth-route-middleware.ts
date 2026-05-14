import { betterFetch } from "@better-fetch/fetch";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { getRoleKey, roleAllowedRoutes, roleRedirects } from "@/config/roles-config";

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

  const { data: session } = await betterFetch<{ user: { role: number } }>(
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
    const roleKey = getRoleKey(session.user.role);
    const allowedRoutes = roleAllowedRoutes[roleKey];

    if (isAuthRoute) {
      return NextResponse.redirect(
        new URL(`/${locale}${roleRedirects[roleKey]}`, request.url)
      );
    }

    const hasAccess = allowedRoutes.some((route) =>
      pathnameWithoutLocale.startsWith(route)
    );

    if (!hasAccess) {
      return NextResponse.redirect(
        new URL(`/${locale}${roleRedirects[roleKey]}`, request.url)
      );
    }
  }

  return undefined;
}
