import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { business } from "@/content/site";
import "./globals.css";

// Young Serif para los titulares (cálida, con carácter, nada infantil) y
// Atkinson Hyperlegible Next para el texto: pensada para leerse sin esfuerzo.
const display = localFont({
  src: [
    { path: "../../node_modules/@fontsource/young-serif/files/young-serif-latin-400-normal.woff2", weight: "400" },
  ],
  variable: "--font-display",
  display: "swap",
});

const sans = localFont({
  src: "../../node_modules/@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${business.name} · Centro veterinario y peluquería & spa en Bollullos de la Mitación`,
  description:
    "Consulta veterinaria, medicina preventiva y peluquería & spa para perros y gatos en la calle Virgen de la Soledad, Bollullos de la Mitación (Sevilla). Con cita previa.",
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
  themeColor: "#faf6f0",
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
