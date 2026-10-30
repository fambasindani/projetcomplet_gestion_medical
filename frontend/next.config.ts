import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/medical",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/",
        destination: "/medical/login",
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
