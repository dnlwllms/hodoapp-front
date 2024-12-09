import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
      {
        protocol: "https",
        hostname: "hodoapp.s3.ap-northeast-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
