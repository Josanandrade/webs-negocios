import type { NextRequest } from "next/server";

/** Origen público de la app. Detrás de un proxy (Railway) usa SITE_URL o las cabeceras reenviadas. */
export function siteOrigin(request: NextRequest) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return host ? `${proto}://${host}` : request.nextUrl.origin;
}
