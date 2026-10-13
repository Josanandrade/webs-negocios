import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { business } from "@/content/site";
import "./globals.css";

const sans = localFont({
  src: [
    { path: "../../node_modules/@fontsource/hanken-grotesk/files/hanken-grotesk-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/hanken-grotesk/files/hanken-grotesk-latin-500-normal.woff2", weight: "500" },
    { path: "../../node_modules/@fontsource/hanken-grotesk/files/hanken-grotesk-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const serif = localFont({
  src: [
    { path: "../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${business.name} · Pino Montano, Sevilla`,
  description:
    "Centro de estética en Pino Montano, Sevilla. Tratamientos faciales, peeling químico, dermaplaning, depilación con hilo, masaje de espalda, remodelación corporal y maquillaje.",
  // Demo privada: nunca indexable.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F2F3F1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
