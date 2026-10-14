import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { business } from "@/content/site";
import "./globals.css";

// Young Serif para el letrero, Work Sans para leer y Kalam para la pizarra.
const youngSerif = localFont({
  src: "../../node_modules/@fontsource/young-serif/files/young-serif-latin-400-normal.woff2",
  variable: "--font-sign",
  weight: "400",
  display: "swap",
});

const workSans = localFont({
  src: "../../node_modules/@fontsource-variable/work-sans/files/work-sans-latin-wght-normal.woff2",
  variable: "--font-text",
  weight: "100 900",
  display: "swap",
});

const kalam = localFont({
  src: [
    { path: "../../node_modules/@fontsource/kalam/files/kalam-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/kalam/files/kalam-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-chalk",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${business.name} · Cocina de mercado en ${business.town}`,
  description:
    "Taberna en la calle Murillo de Pilas (Sevilla) desde 1988. Sin carta impresa: los platos del día se cantan en la mesa. Mediodías de lunes a sábado.",
  // Demo privada: nunca indexable.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#7d2a1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${youngSerif.variable} ${workSans.variable} ${kalam.variable}`}>
      <body>{children}</body>
    </html>
  );
}
