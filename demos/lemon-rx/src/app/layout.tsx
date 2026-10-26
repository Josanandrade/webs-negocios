import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { GlobalToast } from "@/components/toast";
import "./globals.css";

const body = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  // Solo los pesos que se usan con esta fuente (los títulos van en Barlow Condensed).
  weight: ["400", "600"],
  display: "swap",
});

const display = Barlow_Condensed({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Lemon RX", template: "%s · Lemon RX" },
  description: "Programación de CrossFit de Lemon RX.",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Lemon RX", statusBarStyle: "black" },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${body.variable} ${display.variable} antialiased`}>
      <body className="min-h-dvh">
        {children}
        <GlobalToast />
      </body>
    </html>
  );
}
