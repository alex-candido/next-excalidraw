import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { routing } from "./src/i18n/routing";

const lang = `:lang(${routing.locales.join("|")})`;

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactCompiler: true,
  transpilePackages: ["@excalidraw/excalidraw", "@excalidraw/utils", "@excalidraw/math"],
  // Chrome restringe o evento `unload` por Permissions-Policy por padrão
  // (parte da depreciação do evento, quebra o bfcache) — o próprio
  // @excalidraw/excalidraw ainda usa `window.addEventListener("unload", ...)`
  // internamente (App.tsx do pacote), gerando "Permissions policy violation:
  // unload is not allowed in this document" no console/dev overlay. Não dá
  // pra tirar isso do lado deles sem patch-package; permitir explicitamente
  // via header silencia o aviso sem mexer na dependência.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Permissions-Policy", value: "unload=(self)" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Landing
      {
        source: `/${lang}`,
        destination: "/:lang/landing/home",
        permanent: false,
      },
      {
        source: `/${lang}/landing`,
        destination: "/:lang/landing/home",
        permanent: false,
      },
      // Auth
      {
        source: `/${lang}/auth`,
        destination: "/:lang/auth/sign-in",
        permanent: false,
      },
      // App
      {
        source: `/${lang}/app`,
        destination: "/:lang/app/start",
        permanent: false,
      },
      {
        source: `/${lang}/app/settings`,
        destination: "/:lang/app/settings/profile",
        permanent: false,
      },
      // Admin
      {
        source: `/${lang}/admin`,
        destination: "/:lang/admin/dashboard",
        permanent: false,
      },
      {
        source: `/${lang}/admin/settings`,
        destination: "/:lang/admin/settings/profile",
        permanent: false,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const withMDX = createMDX({});

export default withNextIntl(withMDX(nextConfig));
