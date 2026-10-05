import localFont from "next/font/local";

/** Archivo variable: pesos 100–900 y anchura 62–125 %. Titulares en estrecho, texto en normal. */
export const archivo = localFont({
  src: "./fonts/archivo-variable.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  style: "normal",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

/** Newsreader cursiva: solo para palabras de acento. No se precarga. */
export const newsreader = localFont({
  src: "./fonts/newsreader-italic-variable.woff2",
  variable: "--font-newsreader",
  weight: "200 800",
  style: "italic",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

/** IBM Plex Mono: datos clínicos, etiquetas y horarios. */
export const plexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["ui-monospace", "Menlo", "monospace"],
});
