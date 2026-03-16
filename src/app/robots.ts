import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/demo", "/i64"],
        disallow: ["/dashboard/", "/auth/", "/api/"],
      },
    ],
    sitemap: "https://www.complexity-ai.fr/sitemap.xml",
  };
}
