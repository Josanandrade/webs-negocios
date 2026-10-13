import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Reveal } from "@/components/Reveal";
import "./globals.css";

const display = localFont({
  src: "./fonts/gabarito-latin-wght-normal.woff2",
  weight: "400 900",
  variable: "--font-display",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/figtree-latin-wght-normal.woff2",
  weight: "300 900",
  variable: "--font-sans",
  display: "swap",
});

// Demo comercial privada: sin indexación, sin analítica, sin seguimiento y
// sin presentarse como la web oficial de la clínica.
export const metadata: Metadata = {
  title: "Clínica Veterinaria Camas · Veterinario en Camas, Sevilla (demo)",
  description:
    "Consulta, vacunas, cirugía, especialidades y peluquería para perros y gatos en la calle Santa Paula, 6, Camas (Sevilla). Diseño de demostración, no oficial.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nosnippet: true },
  },
  referrer: "no-referrer",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f8fc",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>
        {children}
        <Reveal />
      </body>
    </html>
  );
}
