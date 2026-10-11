import type { NextConfig } from "next";

// Cache Components desactivado a propósito: todas las pantallas dependen de la
// sesión y del estado de acceso del usuario, que debe comprobarse en cada
// petición (si un admin bloquea a alguien, deja de ver la programación al
// instante). El modelo dinámico clásico es más simple y seguro aquí.
const nextConfig: NextConfig = {
  poweredByHeader: false,
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
