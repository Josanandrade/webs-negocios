import type { CSSProperties } from "react";
import type { BookingTheme } from "./types";

/** Tema neutro por defecto: hereda tipografía y colores razonables de cualquier web */
export const defaultBookingTheme: BookingTheme = {
  primaryColor: "#111827",
  primaryTextColor: "#ffffff",
  accentColor: "#2563eb",
  backgroundColor: "transparent",
  surfaceColor: "#f4f5f7",
  textColor: "inherit",
  mutedTextColor: "#4b5563",
  borderColor: "rgb(17 24 39 / 0.18)",
  dangerColor: "#b42318",
  successColor: "#067647",
  fontFamily: "inherit",
  headingFontFamily: "inherit",
  headingFontStretch: "normal",
  labelFontFamily: "inherit",
  borderRadius: "6px",
  maxWidth: "72rem",
  logoUrl: null,
};

/**
 * Acepta solo valores CSS inofensivos. Si el tema llega de un servidor
 * (AvanttAI), esto impide inyectar reglas (`;`, `{`, `url(`, `expression`…).
 */
function safeCssValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v || v.length > 200) return null;
  if (/[;{}<>\\]|url\s*\(|expression\s*\(|@import/i.test(v)) return null;
  return v;
}

function safeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^(https:\/\/|\/)[^\s"'<>]+$/.test(value.trim()) ? value.trim() : null;
}

/** Combina tema remoto (AvanttAI) y local (la web). El local manda. */
export function resolveBookingTheme(...layers: Array<Partial<BookingTheme> | undefined | null>): BookingTheme {
  const theme: BookingTheme = { ...defaultBookingTheme };
  for (const layer of layers) {
    if (!layer) continue;
    for (const key of Object.keys(defaultBookingTheme) as Array<keyof BookingTheme>) {
      if (!(key in layer)) continue;
      if (key === "logoUrl") {
        theme.logoUrl = layer.logoUrl === null ? null : safeUrl(layer.logoUrl) ?? theme.logoUrl;
        continue;
      }
      const value = safeCssValue(layer[key]);
      if (value) theme[key] = value;
    }
  }
  return theme;
}

/** Variables CSS `--bk-*` que consumen los estilos del kit */
export function bookingThemeStyle(theme: BookingTheme): CSSProperties {
  return {
    ["--bk-primary" as string]: theme.primaryColor,
    ["--bk-on-primary" as string]: theme.primaryTextColor,
    ["--bk-accent" as string]: theme.accentColor,
    ["--bk-bg" as string]: theme.backgroundColor,
    ["--bk-surface" as string]: theme.surfaceColor,
    ["--bk-text" as string]: theme.textColor,
    ["--bk-muted" as string]: theme.mutedTextColor,
    ["--bk-border" as string]: theme.borderColor,
    ["--bk-danger" as string]: theme.dangerColor,
    ["--bk-success" as string]: theme.successColor,
    ["--bk-font" as string]: theme.fontFamily,
    ["--bk-font-heading" as string]: theme.headingFontFamily,
    ["--bk-heading-stretch" as string]: theme.headingFontStretch,
    ["--bk-font-label" as string]: theme.labelFontFamily,
    ["--bk-radius" as string]: theme.borderRadius,
    ["--bk-max-width" as string]: theme.maxWidth,
  };
}
