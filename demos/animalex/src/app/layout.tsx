import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// Una sola familia variable: el eje de anchura da el rótulo condensado
// de los titulares y el texto normal para leer.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Demo privada: sin indexación, sin seguimiento.
export const metadata: Metadata = {
  title: "Animalex · Tienda de animales en El Cerro, Sevilla",
  description:
    "Alimentación, higiene, juguetes, correas, transportines y accesorios para perros y gatos en C. Lisboa 49, Sevilla. Pregunta por WhatsApp o por teléfono.",
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
  themeColor: "#f3f1ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
