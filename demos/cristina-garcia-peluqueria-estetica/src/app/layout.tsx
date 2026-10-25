import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { business } from "@/content/site";
import "./globals.css";

// Gloock para titulares y cifras; Schibsted Grotesk para carta, precios y UI.
const display = localFont({
  src: "../../node_modules/@fontsource/gloock/files/gloock-latin-400-normal.woff2",
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

const sans = localFont({
  src: "../../node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "400 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${business.fullName} · Bollullos de la Mitación`,
  description:
    "Centro de peluquería y estética en Bollullos de la Mitación (Sevilla): corte, color y mechas, novias, cejas y pestañas, uñas, faciales, corporal y depilación láser.",
  // Demo privada: nunca indexable.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0E3B44",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
