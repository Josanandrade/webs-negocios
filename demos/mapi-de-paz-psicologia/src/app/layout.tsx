import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { business } from "@/content/site";
import "./globals.css";

// Cormorant Garamond para la voz editorial; Albert Sans, discreta, para la UI.
const serif = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-serif",
  weight: "300 700",
  display: "swap",
});

const sans = localFont({
  src: "../../node_modules/@fontsource-variable/albert-sans/files/albert-sans-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "300 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${business.name} · Consulta de Psicología en Bollullos de la Mitación`,
  description:
    "Mapi de Paz, psicóloga en Bollullos de la Mitación (Sevilla). Terapia individual, de pareja, de familia y grupos, presencial u online, con un enfoque integrador.",
  // Demo privada: nunca indexable.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F3F1EA",
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
