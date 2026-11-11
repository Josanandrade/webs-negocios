import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { clinic } from "@/content/site";
import "./globals.css";

// IBM Plex Sans para todo el texto (sobria, técnica, muy legible en móvil) y
// Plex Mono para horas, fechas y localizadores: el tono de una agenda clínica.
const sans = localFont({
  src: "../../node_modules/@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "100 700",
  display: "swap",
});

const mono = localFont({
  src: [
    { path: "../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${clinic.name} · Podología en ${clinic.town}`,
  description: `Clínica de podología en ${clinic.street}, ${clinic.town} (${clinic.province}). Atención con cita previa: reserva tu cita online.`,
  // Demo privada: nunca indexable.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
