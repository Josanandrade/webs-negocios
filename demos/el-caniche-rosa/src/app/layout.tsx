import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-display",
  display: "swap",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Demo privada: sin indexación, sin seguimiento.
export const metadata: Metadata = {
  title: "El Caniche Rosa · Peluquería y estética canina en Tomares",
  description:
    "Baño, corte, arreglo, deslanado y uñas para tu perro en Tomares (Sevilla). Cita por Booksy o por teléfono.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: "no-referrer",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#fbf5ec",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
