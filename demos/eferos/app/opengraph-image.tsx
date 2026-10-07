import { ImageResponse } from "next/og";
import { business } from "@/business.config";
import { brandColors, symbol, wordmark } from "@/components/brand";

const svgUri = (w: number, h: number, d: string, fill: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><path fill="${fill}" fill-rule="evenodd" d="${d}"/></svg>`,
  )}`;

export const alt = `${business.name} · ${business.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#172b28",
          color: "#e6ebe7",
        }}
      >
        {/* Logotipo oficial: símbolo + nombre (en claro sobre pino) */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img
            src={svgUri(symbol.width, symbol.height, symbol.d, brandColors.blue)}
            width={110}
            height={Math.round((110 * symbol.height) / symbol.width)}
            alt=""
          />
          <img
            src={svgUri(wordmark.width, wordmark.height, `${wordmark.d} ${wordmark.flipD}`, "#e6ebe7")}
            width={162}
            height={Math.round((162 * wordmark.height) / wordmark.width)}
            alt=""
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 88, lineHeight: 0.95, letterSpacing: -3, maxWidth: 980 }}>
            Tratamos la lesión desde su origen.
          </div>
          <div style={{ fontSize: 28, color: "#a9b8b3" }}>
            {`Fisioterapia avanzada · ${business.address.locality} · ${business.contact.phoneDisplay}`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
