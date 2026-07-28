import type { NextConfig } from "next";

const laboWebOrigin = (process.env.LABO_WEB_ORIGIN || "https://labo-ai.vercel.app").replace(/\/$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async rewrites() {
    return [{ source: "/labo-live/:path*", destination: `${laboWebOrigin}/:path*` }];
  },
};

export default nextConfig;
