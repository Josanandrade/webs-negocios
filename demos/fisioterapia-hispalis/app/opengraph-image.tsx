import { ImageResponse } from "next/og";
import { business } from "@/business.config";

export const dynamic = "force-static";
export const alt = `${business.name} · Propuesta de nueva web`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f7f2ea",
          color: "#1d2721",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#a4502c" }}>
          Fisioterapia · {business.city}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, lineHeight: 1, fontStyle: "italic", color: "#2f4a3a" }}>Híspalis</div>
          <div style={{ marginTop: 24, fontSize: 40, color: "#47524b" }}>Vuelve a moverte con confianza.</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#6b746d" }}>Propuesta de nueva web · demo privada</div>
      </div>
    ),
    size,
  );
}
