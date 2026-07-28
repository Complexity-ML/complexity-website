import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ai-lab", "/i64"],
        disallow: ["/dashboard/", "/auth/", "/api/"],
      },
    ],
    sitemap: "https://www.complexity-ai.fr/sitemap.xml",
  };
}
