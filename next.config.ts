import type { NextConfig } from "next";

const laboWebOrigin = (process.env.LABO_WEB_ORIGIN || "https://labo-ai.vercel.app").replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async rewrites() {
    return [{ source: "/labo-live/:path*", destination: `${laboWebOrigin}/:path*` }];
  },
  async redirects() {
    return [
      { source: "/dashboard", destination: "/dashboard/settings", permanent: false },
      { source: "/dashboard/keys", destination: "/dashboard/settings", permanent: false },
      { source: "/dashboard/team", destination: "/dashboard/settings", permanent: false },
    ];
  },
};

export default nextConfig;
