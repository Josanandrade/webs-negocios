import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { business } from "@/content/site";
import "./globals.css";

// Source Serif 4 (con eje óptico) para los titulares; Mona Sans para lectura e interfaz.
const serif = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-normal.woff2", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-italic.woff2", style: "italic" },
  ],
  variable: "--font-serif",
  weight: "200 900",
  display: "swap",
});

const sans = localFont({
  src: "../../node_modules/@fontsource-variable/mona-sans/files/mona-sans-latin-standard-normal.woff2",
  variable: "--font-sans",
  weight: "200 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${business.name} · Bollullos de la Mitación`,
  description: `${business.name}: consulta de psicología en ${business.street}, ${business.town} (${business.province}). Pide cita de lunes a viernes.`,
  // Demo privada: nunca indexable.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F6F5F1",
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
