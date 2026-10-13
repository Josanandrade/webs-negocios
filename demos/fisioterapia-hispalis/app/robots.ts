import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Demo privada: se bloquea todo el rastreo.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
