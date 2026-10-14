import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { practice } from "@/content/site";
import "./globals.css";

// Young Serif para el nombre y los titulares; Atkinson Hyperlegible Next para
// todo lo que hay que leer bien (también con vista cansada).
const display = localFont({
  src: "../../node_modules/@fontsource/young-serif/files/young-serif-latin-400-normal.woff2",
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

const sans = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-italic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${practice.name} · Podología en ${practice.town}`,
  description: `Consulta de podología de ${practice.name} en ${practice.town} (Sevilla). Pide cita eligiendo motivo, día y hora.`,
  // Demo privada: nunca indexable.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F2ECE1",
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
