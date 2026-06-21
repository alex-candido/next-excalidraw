import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactCompiler: true,
  transpilePackages: ["@excalidraw/excalidraw", "@excalidraw/utils", "@excalidraw/math"],
  async redirects() {
    return [
      // Landing
      {
        source: "/:lang(pt-BR|en-US|es)",
        destination: "/:lang/landing/home",
        permanent: false,
      },
      {
        source: "/:lang(pt-BR|en-US|es)/landing",
        destination: "/:lang/landing/home",
        permanent: false,
      },
      // Auth
      {
        source: "/:lang(pt-BR|en-US|es)/auth",
        destination: "/:lang/auth/sign-in",
        permanent: false,
      },
      // App
      {
        source: "/:lang(pt-BR|en-US|es)/app",
        destination: "/:lang/app/dashboard",
        permanent: false,
      },
      {
        source: "/:lang(pt-BR|en-US|es)/app/settings",
        destination: "/:lang/app/settings/profile",
        permanent: false,
      },
      // Admin
      {
        source: "/:lang(pt-BR|en-US|es)/admin",
        destination: "/:lang/admin/dashboard",
        permanent: false,
      },
      {
        source: "/:lang(pt-BR|en-US|es)/admin/settings",
        destination: "/:lang/admin/settings/profile",
        permanent: false,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const withMDX = createMDX({});

export default withNextIntl(withMDX(nextConfig));
