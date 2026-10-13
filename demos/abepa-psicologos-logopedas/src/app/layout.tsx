import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./globals.css";

const display = localFont({
  src: "./fonts/bricolage-grotesque-latin-opsz-normal.woff2",
  weight: "200 800",
  variable: "--font-display",
  display: "swap",
});

// Atkinson Hyperlegible: diseñada para máxima legibilidad. Pensada para
// familias que leen desde el móvil y para personas con baja visión.
const text = localFont({
  src: "./fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-text",
  display: "swap",
});

const title = `${site.name} · Psicología, logopedia y pedagogía en ${site.city}`;
const description = `Centro multidisciplinar en ${site.city} (${site.province}). Psicología, logopedia y apoyo al aprendizaje para niños, adolescentes, adultos y familias.`;

export const metadata: Metadata = {
  title: `${title} — Propuesta (demo privada)`,
  description,
  // Demo comercial privada: no debe indexarse ni seguirse.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nosnippet: true },
  },
  other: {
    "demo-status": "private-commercial-demo",
    "demo-note": "Propuesta no solicitada por el centro. No es su web oficial.",
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#fbf9f5",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  );
}
