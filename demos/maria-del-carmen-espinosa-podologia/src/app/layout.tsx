import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { practice } from "@/content/site";
import "./globals.css";

// Literata para el nombre y los titulares (cálida, de libro); Albert Sans
// para todo lo que se lee y se toca.
const display = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/literata/files/literata-latin-wght-normal.woff2", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/literata/files/literata-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-display",
  weight: "200 900",
  display: "swap",
});

const sans = localFont({
  src: "../../node_modules/@fontsource-variable/albert-sans/files/albert-sans-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${practice.kind} ${practice.name} · ${practice.town}`,
  description: `Consulta de podología de ${practice.name} en ${practice.town} (Sevilla). Mira los huecos libres y pide cita eligiendo día y hora.`,
  // Demo privada: nunca indexable.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F6F4EE",
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
