import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/:lang(pt-BR|en-US)",
        destination: "/:lang/landing/home",
        permanent: false,
      },
      {
        source: "/:lang(pt-BR|en-US)/landing",
        destination: "/:lang/landing/home",
        permanent: false,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const withMDX = createMDX({});

export default withNextIntl(withMDX(nextConfig));
