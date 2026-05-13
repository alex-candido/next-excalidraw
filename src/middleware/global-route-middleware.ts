import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function globalRouteMiddleware(request: NextRequest) {
  return intlMiddleware(request);
}
