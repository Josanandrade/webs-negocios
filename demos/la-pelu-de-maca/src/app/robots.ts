import type { MetadataRoute } from "next";

// Demo privada: bloqueada para todos los buscadores.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
