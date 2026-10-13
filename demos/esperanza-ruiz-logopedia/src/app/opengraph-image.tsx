import { ImageResponse } from "next/og";

export const alt = "Centro de Logopedia Esperanza Ruiz — propuesta de nueva web";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Vista previa al compartir el enlace de la demo (WhatsApp, email…).
export default function OpengraphImage() {
  const wave = Array.from({ length: 16 }, () => "q 19 -16 38 0 t 38 0").join(" ");
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#f7f2ea",
        color: "#1d2925",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", width: 760 }}>
        <div style={{ fontSize: 22, letterSpacing: 4, color: "#934024", fontFamily: "sans-serif", fontWeight: 700 }}>
          LOGOPEDIA EN SEVILLA
        </div>
        <div style={{ fontSize: 68, lineHeight: 1.05, marginTop: 24 }}>Centro de Logopedia Esperanza Ruiz</div>
        <div style={{ fontSize: 28, marginTop: 28, color: "#4b5a54", fontFamily: "sans-serif" }}>
          Infancia · adultos · voz · deglución · daño neurológico
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          margin: "48px 48px 48px 0",
          borderRadius: "300px 300px 28px 28px",
          background: "#1d3d32",
          alignItems: "center",
        }}
      >
        <svg width="360" height="120" viewBox="0 0 600 120">
          <path d={`M0 40 ${wave}`} fill="none" stroke="#d9a547" strokeWidth="4" />
          <path d={`M0 75 ${wave}`} fill="none" stroke="#d9a547" strokeWidth="4" opacity="0.6" />
        </svg>
      </div>
    </div>,
    size,
  );
}
