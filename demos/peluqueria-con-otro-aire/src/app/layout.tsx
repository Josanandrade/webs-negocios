import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peluquería Con Otro Aire · Umbrete",
  description: "Demo privada para Peluquería Con Otro Aire en Umbrete: corte, color, peinado y una experiencia cercana.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5f0e7" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
