import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@napi-rs/canvas",
    "qrcode",
    "bcryptjs",
    "@prisma/adapter-neon",
    "@neondatabase/serverless",
    "ws",
  ],
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
