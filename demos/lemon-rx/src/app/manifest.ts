import type { MetadataRoute } from "next";

// Necesario para instalar la app en la pantalla de inicio (y, en iPhone, para
// poder recibir notificaciones).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lemon RX",
    short_name: "Lemon RX",
    description: "Programación de CrossFit de Lemon RX.",
    lang: "es",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#0c0c0b",
    theme_color: "#0c0c0b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
