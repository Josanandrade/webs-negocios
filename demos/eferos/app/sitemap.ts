import type { MetadataRoute } from "next";
import { business } from "@/business.config";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    ...business.services.map((s) => ({
      url: `${siteUrl}/especialidades/${s.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
