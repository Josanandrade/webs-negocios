import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { business } from "@/business.config";
import { RevealObserver } from "@/components/RevealObserver";
import "./globals.css";

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Demo privada: noindex/nofollow en todas las páginas, sin canonical hacia el
// dominio del negocio y sin analítica. No debe competir con la web oficial.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${business.name} · Fisioterapia en ${business.city} — Propuesta de diseño`,
  description: `Propuesta de nueva web para ${business.name}, clínica de fisioterapia y rehabilitación en ${business.city} (${business.province}). Demo privada, no es la web oficial.`,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false },
  other: { "demo-status": "private-preview" },
};

export const viewport: Viewport = {
  themeColor: "#f7f2ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${body.variable} ${display.variable}`}>
      <head>
        {/* Marca .js antes de pintar para que el revelado no parpadee y sin JS todo se vea. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
