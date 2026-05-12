import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
    async redirects() {
    return [
      {
        source: '/',
        destination: '/landing/home',
        permanent: true,
      },
      {
        source: '/landing',
        destination: '/landing/home',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
