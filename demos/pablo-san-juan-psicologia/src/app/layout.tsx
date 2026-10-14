import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { business } from "@/content/site";
import "./globals.css";

// Petrona (serif cálida, con cursiva propia) para la voz; Familjen Grotesk para lectura e interfaz.
const serif = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/petrona/files/petrona-latin-wght-normal.woff2", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/petrona/files/petrona-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-serif",
  weight: "100 900",
  display: "swap",
});

const sans = localFont({
  src: "../../node_modules/@fontsource-variable/familjen-grotesk/files/familjen-grotesk-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${business.brand} · ${business.town}`,
  description: `${business.name}, consulta de psicología en ${business.town} (${business.province}). Conoce cómo es la consulta y solicita tu cita eligiendo día y hora.`,
  // Demo privada: nunca indexable.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F6F3EA",
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
