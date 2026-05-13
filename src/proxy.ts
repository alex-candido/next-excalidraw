// import { authRouteMiddleware } from "@/middleware/auth-route-middleware";
import { globalRouteMiddleware } from "@/middleware/global-route-middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  try {
    let response: NextResponse | undefined;

    // response = await authRouteMiddleware(request);
    // if (response) return response;

    response = await globalRouteMiddleware(request);
    if (response) return response;

    return NextResponse.next();
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.redirect(
      new URL("/pt-BR/auth/sign-in", request.url)
    );
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|images|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js)$).*)",
  ],
};
