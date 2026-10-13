import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Reveal } from "@/components/Reveal";
import "./globals.css";

const display = localFont({
  src: "./fonts/bricolage-grotesque-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-display",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-sans",
  display: "swap",
});

// Demo comercial privada: sin indexación, sin analítica, sin seguimiento y
// sin presentarse como la web oficial del salón.
export const metadata: Metadata = {
  title: "Helena García · Beauty Salon en Bormujos — Propuesta (demo privada)",
  description:
    "Propuesta privada de web para Helena García Beauty Salon (Bormujos, Sevilla). Demo no oficial.",
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
  themeColor: "#fff7f2",
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
