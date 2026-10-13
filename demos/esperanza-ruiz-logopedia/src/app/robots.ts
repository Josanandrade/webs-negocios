import type { MetadataRoute } from "next";

// Demo privada: se bloquea todo el rastreo.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
