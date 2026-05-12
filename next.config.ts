import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/:lang/landing",
        destination: "/:lang/landing/home",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
