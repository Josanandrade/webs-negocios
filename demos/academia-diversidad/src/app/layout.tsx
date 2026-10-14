import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { academy } from "@/content/site";
import "./globals.css";

// Lexend (pensada para facilitar la lectura) en pesos altos para titulares; Rethink Sans para lectura e interfaz.
const display = localFont({
  src: "../../node_modules/@fontsource-variable/lexend/files/lexend-latin-wght-normal.woff2",
  variable: "--font-display",
  weight: "100 900",
  display: "swap",
});

const sans = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/rethink-sans/files/rethink-sans-latin-wght-normal.woff2", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/rethink-sans/files/rethink-sans-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-sans",
  weight: "400 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${academy.name} · ${academy.town}, ${academy.province}`,
  description: `${academy.name}, academia en ${academy.town} (${academy.province}). Cuéntanos qué necesitas y te contactamos.`,
  // Demo privada: nunca indexable.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#1C2340",
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
