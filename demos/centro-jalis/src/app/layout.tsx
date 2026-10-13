import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const bodoniModa = localFont({
  src: [
    { path: "./fonts/bodoni-moda-latin-standard-normal.woff2", style: "normal", weight: "400 900" },
    { path: "./fonts/bodoni-moda-latin-standard-italic.woff2", style: "italic", weight: "400 900" },
  ],
  variable: "--font-serif",
  display: "swap",
  fallback: ["Didot", "Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

const hankenGrotesk = localFont({
  src: "./fonts/hanken-grotesk-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

// Demo privada: sin indexación, sin seguimiento, sin presentarse como oficial.
export const metadata: Metadata = {
  title: "Jalis · Centro de belleza y bienestar — Propuesta de diseño",
  description:
    "Propuesta privada de web para Jalis, centro de belleza y bienestar en Castilleja de la Cuesta. Demo no oficial.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nosnippet: true },
  },
  referrer: "no-referrer",
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#16231f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bodoniModa.variable} ${hankenGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
