import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./globals.css";

const serif = localFont({
  src: [
    { path: "./fonts/newsreader-latin-opsz-normal.woff2", weight: "200 800", style: "normal" },
    { path: "./fonts/newsreader-latin-opsz-italic.woff2", weight: "200 800", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/hanken-grotesk-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-sans",
  display: "swap",
});

const title = `${site.name} · ${site.role} en ${site.city}`;
const description = `Consulta de psicología de ${site.name} en ${site.city} (${site.province}). Un espacio tranquilo y confidencial para hablar de lo que te está pasando.`;

export const metadata: Metadata = {
  title: `${title} — Propuesta (demo privada)`,
  description,
  // Demo comercial privada: no debe indexarse ni seguirse.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  other: {
    "demo-status": "private-commercial-demo",
    "demo-note": "Propuesta no solicitada por la profesional. No es su web oficial.",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f4efe7",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
