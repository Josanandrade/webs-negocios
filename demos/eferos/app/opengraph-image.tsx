import { ImageResponse } from "next/og";
import { business } from "@/business.config";

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
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, letterSpacing: -1 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: "3px solid #e6ebe7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 999, background: "#a9b8ff" }} />
          </div>
          eferos
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
