import type { Metadata, Viewport } from "next";
import { figtree, fraunces } from "./fonts";
import { site } from "@/lib/site";
import "./globals.css";

const description =
  "Propuesta de rediseño (demo privada) para el Centro de Logopedia Esperanza Ruiz, Sevilla: logopedia para la infancia, adultos y daño neurológico.";

// URL pública de la preview (para la imagen OG). En Railway se toma del dominio asignado.
const siteUrl =
  process.env.SITE_URL ??
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${site.name} · Logopedia en Sevilla — Propuesta de diseño`,
  description,
  applicationName: "Demo privada · AvanttAI",
  // Demo comercial privada: no indexar, no seguir enlaces, no cachear.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nosnippet: true },
  },
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
  other: {
    "demo-status": "private-commercial-proposal",
    "demo-official-site": site.officialUrl,
  },
  openGraph: {
    title: `${site.name} — Propuesta de nueva web`,
    description: "Demo privada de rediseño. No es la web oficial del centro.",
    locale: "es_ES",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f2ea",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  );
}
