import createMDX from "@next/mdx";
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

const withMDX = createMDX({});

export default withMDX(nextConfig);
