import { business } from "@/business.config";

/**
 * URL pública del sitio (canonical, sitemap, Open Graph). Orden de prioridad:
 * variable explícita, dominio que expone la plataforma de despliegue, localhost.
 * Nunca se asume eferos.es: una demo desplegada debe apuntar a sí misma.
 */
const platformDomain =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.RAILWAY_PUBLIC_DOMAIN ?? process.env.VERCEL_URL;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (platformDomain ? `https://${platformDomain}` : "http://localhost:3000")
).replace(/\/$/, "");

/**
 * Mientras la web sea una demo no debe indexarse: competiría con eferos.es.
 * Activar con NEXT_PUBLIC_ALLOW_INDEXING=true al pasar a producción.
 */
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export const getService = (slug: string) => business.services.find((s) => s.slug === slug);

/** Teléfono enlazable (tel:) a partir del formato E.164. */
export const telHref = `tel:${business.contact.phoneE164}`;
export const mailHref = `mailto:${business.contact.email}`;

/** Lista de redes con URL real; las vacías no se renderizan. */
export const activeSocial = business.social.filter((s) => s.url.trim().length > 0);
