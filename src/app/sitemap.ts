import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.complexity-ai.fr";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/demo`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/labo-ai`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/labo-ai/live`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/i64`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  ];
}
