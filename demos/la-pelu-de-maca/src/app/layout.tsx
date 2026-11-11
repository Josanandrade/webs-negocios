import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Reveal } from "@/components/Reveal";
import "./globals.css";

const display = localFont({
  src: "./fonts/fraunces-latin-soft-normal.woff2",
  weight: "100 900",
  variable: "--font-display",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/onest-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-sans",
  display: "swap",
});

const hand = localFont({
  src: "./fonts/caveat-latin-600-normal.woff2",
  weight: "600",
  variable: "--font-hand",
  display: "swap",
  preload: false,
});

// Web privada de muestra: sin indexación, sin analítica y sin seguimiento.
export const metadata: Metadata = {
  title: "La Pelu de Maca · Peluquería en Dos Hermanas",
  description:
    "Corte, color y peinado con Maca, Carmen y Mari Carmen en Av. Reyes Católicos, Dos Hermanas. Cita por teléfono.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nosnippet: true },
  },
  referrer: "no-referrer",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#fbf3e8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable} ${hand.variable}`}>
      <body>
        {children}
        <Reveal />
      </body>
    </html>
  );
}
