import localFont from "next/font/local";

// Fuentes autoalojadas (sin peticiones a terceros).
// Fraunces "soft": serif editorial con remates redondeados → calidez sin infantilizar.
export const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-latin-soft-normal.woff2", style: "normal", weight: "300 800" },
    { path: "./fonts/fraunces-latin-soft-italic.woff2", style: "italic", weight: "300 800" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

// Figtree: sans geométrica cálida y muy legible, con cifras claras (teléfonos,
// direcciones). Cuerpo de texto a 17 px para lectores mayores o con baja visión.
export const figtree = localFont({
  src: [
    { path: "./fonts/figtree-latin-wght-normal.woff2", style: "normal", weight: "300 900" },
    { path: "./fonts/figtree-latin-wght-italic.woff2", style: "italic", weight: "300 900" },
  ],
  variable: "--font-figtree",
  display: "swap",
});
