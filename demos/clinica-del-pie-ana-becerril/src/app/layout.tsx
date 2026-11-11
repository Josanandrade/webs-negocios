import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { practice } from "@/content/site";
import "./globals.css";

// Literata (serif de lectura, clásica) para titulares; Lexend para el texto y
// los botones: letra amplia, pensada para leerse sin esfuerzo.
const serif = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/literata/files/literata-latin-wght-normal.woff2", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/literata/files/literata-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-serif",
  weight: "200 900",
  display: "swap",
});

const sans = localFont({
  src: "../../node_modules/@fontsource-variable/lexend/files/lexend-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${practice.name} · Podóloga ${practice.professional} · ${practice.town}`,
  description: `Consulta de podología de ${practice.professional} en ${practice.town} (Sevilla). Solicite su cita eligiendo día y hora.`,
  // Demo privada: nunca indexable.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
