import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const display = localFont({
  src: "./fonts/anton-latin-400-normal.woff2",
  weight: "400",
  variable: "--font-display",
  display: "swap",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});

const accent = localFont({
  src: "./fonts/instrument-serif-latin-400-italic.woff2",
  weight: "400",
  style: "italic",
  variable: "--font-accent",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const body = localFont({
  src: "./fonts/figtree-latin-wght-normal.woff2",
  weight: "300 900",
  variable: "--font-body",
  display: "swap",
});

// Demo privada: sin indexación, sin seguimiento, sin presentarse como oficial.
export const metadata: Metadata = {
  title: "Los Ángeles · Peluquería y estética en Dos Hermanas — Propuesta de diseño",
  description:
    "Propuesta privada de web para Peluquería y Estética Los Ángeles, Dos Hermanas (Sevilla). Demo no oficial.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: "no-referrer",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${accent.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
