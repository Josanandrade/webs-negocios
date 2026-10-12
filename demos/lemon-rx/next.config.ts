import type { NextConfig } from "next";

// Cache Components desactivado a propósito: todas las pantallas dependen de la
// sesión y del estado de acceso del usuario, que debe comprobarse en cada
// petición (si un admin bloquea a alguien, deja de ver la programación al
// instante). El modelo dinámico clásico es más simple y seguro aquí.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // El service worker de las notificaciones siempre se descarga fresco.
  async headers() {
    return [{ source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] }];
  },
  experimental: {
    // Volver a una pantalla visitada hace menos de 30 s es instantáneo (se
    // reutiliza en el navegador). Cualquier cambio de un admin (acciones con
    // revalidatePath) invalida esta caché al momento.
    staleTimes: { dynamic: 30 },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
