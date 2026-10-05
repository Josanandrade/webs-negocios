"use client";

import { useEffect, useRef } from "react";
import styles from "./ScanPanel.module.css";

/**
 * Ilustración generativa de una ecografía (sonda convexa) con una aguja guiada
 * hasta una zona de tejido degenerado: el gesto central de la EPI®.
 *
 * El ruido speckle se calcula una sola vez en canvas (sin animación continua).
 * La aguja, las marcas y la escala son SVG para que se vean nítidos y puedan
 * animarse solo con transform / opacity / stroke.
 */

const W = 480;
const H = 600;
const APEX = { x: W / 2, y: -60 };
const HALF_ANGLE = (38 * Math.PI) / 180;
const R_MIN = 80;
const R_MAX = 680;
const PX_PER_CM = 130; // y = 20 → 0 cm

// Lesión hipoecoica dentro del tendón
const LESION = { angle: (6 * Math.PI) / 180, r: 296, ra: 0.075, rr: 17 };
const lesionX = APEX.x + LESION.r * Math.sin(LESION.angle);
const lesionY = APEX.y + LESION.r * Math.cos(LESION.angle);

// Entrada de la aguja (borde izquierdo del sector, plano superficial)
const needleStart = {
  x: APEX.x + 118 * Math.sin(-HALF_ANGLE + 0.02),
  y: APEX.y + 118 * Math.cos(-HALF_ANGLE + 0.02),
};

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** Banda brillante gaussiana centrada en r0 */
const band = (r: number, r0: number, w: number) => Math.exp(-((r - r0) ** 2) / (2 * w * w));

/** Pinta las filas [y0, y1) en `d`. Se llama por tramos para no bloquear el hilo principal. */
function paintRows(d: Uint8ClampedArray, rand: () => number, y0: number, y1: number) {
  // Speckle alargado lateralmente: media móvil horizontal de ruido.
  let carry = 0;

  for (let y = y0; y < y1; y++) {
    carry = rand();
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const dx = x - APEX.x;
      const dy = y - APEX.y;
      const r = Math.hypot(dx, dy);
      const a = Math.atan2(dx, dy);

      // Fondo fuera del sector
      let v = 0;
      if (Math.abs(a) <= HALF_ANGLE && r >= R_MIN && r <= R_MAX) {
        carry = carry * 0.62 + rand() * 0.38;
        const speckle = Math.pow(carry, 1.7) * 1.9;

        // Capas anatómicas (arcos concéntricos)
        let tissue = 0.2;
        tissue += band(r, 86, 4) * 1.6; // piel
        tissue -= smooth(92, 110, r) * (1 - smooth(140, 156, r)) * 0.08; // grasa
        tissue += band(r, 128, 2.5) * 0.5 * (0.6 + 0.4 * Math.sin(a * 18)); // septos
        tissue += band(r, 158, 3) * 1.1; // fascia
        // Músculo con fibras oblicuas
        const muscle = smooth(165, 175, r) * (1 - smooth(240, 252, r));
        tissue += muscle * (0.1 + 0.18 * Math.max(0, Math.sin(r * 0.32 + a * 60)));
        // Tendón fibrilar
        const tendon = smooth(252, 262, r) * (1 - smooth(332, 342, r));
        tissue += tendon * (0.32 + 0.42 * Math.pow(Math.max(0, Math.sin(r * 0.95)), 3));
        tissue += band(r, 256, 2.2) * 0.9 + band(r, 338, 2.2) * 0.9; // paratendón
        // Cortical ósea y sombra acústica
        const bone = band(r, 470 + Math.sin(a * 3) * 10, 3.2);
        tissue += bone * 2.3;
        const shadow = smooth(474, 490, r);

        // Lesión hipoecoica (elipse en coordenadas polares)
        const ea = (a - LESION.angle) / LESION.ra;
        const er = (r - LESION.r) / LESION.rr;
        const inLesion = 1 - smooth(0.7, 1.05, ea * ea + er * er);
        tissue = tissue * (1 - inLesion * 0.78);

        // Atenuación en profundidad + compensación (TGC) y viñeteado lateral
        const depth = (r - R_MIN) / (R_MAX - R_MIN);
        const gain = (1 - depth * 0.55) * (1 - shadow * 0.85);
        const edge = 1 - smooth(HALF_ANGLE * 0.82, HALF_ANGLE, Math.abs(a)) * 0.6;

        v = Math.min(1, tissue * speckle * gain * edge);
      }

      const g = Math.round(v * 236);
      d[i] = g * 0.9 + 7;
      d[i + 1] = g * 0.97 + 13;
      d[i + 2] = g * 0.95 + 13;
      d[i + 3] = 255;
    }
  }
}

export default function ScanPanel({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // Pintar fuera del camino crítico y por tramos de filas: ninguna tarea
    // larga bloquea la interacción. Se vuelca al canvas una sola vez al final.
    const img = ctx.createImageData(W, H);
    const rand = mulberry32(57826);
    const ROWS = 24;
    let y = 0;
    let handle = 0;
    let cancelled = false;

    type IdleDeadline = { timeRemaining: () => number };
    const w = window as Window & {
      requestIdleCallback?: (cb: (d: IdleDeadline) => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (h: number) => void;
    };
    const schedule = (cb: (d: IdleDeadline) => void) =>
      w.requestIdleCallback
        ? w.requestIdleCallback(cb, { timeout: 1000 })
        : window.setTimeout(() => cb({ timeRemaining: () => 8 }), 16);

    const step = (deadline: IdleDeadline) => {
      if (cancelled) return;
      do {
        paintRows(img.data, rand, y, Math.min(H, y + ROWS));
        y += ROWS;
      } while (y < H && deadline.timeRemaining() > 4);
      if (y < H) {
        handle = schedule(step);
      } else {
        ctx.putImageData(img, 0, 0);
        canvas.dataset.ready = "true";
      }
    };
    handle = schedule(step);

    return () => {
      cancelled = true;
      if (w.cancelIdleCallback) w.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  const ticks = Array.from({ length: 5 }, (_, cm) => cm);

  return (
    <figure className={`${styles.panel} ${className}`}>
      <div className={styles.screen}>
        <canvas ref={canvasRef} width={W} height={H} className={styles.canvas} aria-hidden="true" />
        <svg
          className={styles.overlay}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMin slice"
          aria-hidden="true"
          focusable="false"
        >
          {/* Escala de profundidad */}
          <g className={styles.scale}>
            <line x1={W - 28} y1={20} x2={W - 28} y2={20 + PX_PER_CM * 4} />
            {ticks.map((cm) => (
              <g key={cm} transform={`translate(${W - 28} ${20 + cm * PX_PER_CM})`}>
                <line x1={0} x2={-10} />
                <text x={-16} y={4} textAnchor="end">
                  {cm}
                </text>
              </g>
            ))}
            {ticks.slice(0, 4).map((cm) => (
              <line
                key={`h${cm}`}
                x1={W - 28}
                x2={W - 33}
                y1={20 + cm * PX_PER_CM + PX_PER_CM / 2}
                y2={20 + cm * PX_PER_CM + PX_PER_CM / 2}
              />
            ))}
            <text x={W - 28} y={20 + PX_PER_CM * 4 + 22} textAnchor="middle">
              cm
            </text>
          </g>

          {/* Aguja */}
          <line
            className={styles.needle}
            x1={needleStart.x}
            y1={needleStart.y}
            x2={lesionX - 6}
            y2={lesionY - 4}
            pathLength={1}
          />

          {/* Pulso en la punta: aplicación de la corriente */}
          <g className={styles.pulse} transform={`translate(${lesionX - 6} ${lesionY - 4})`}>
            <circle r={7} />
            <circle r={7} />
          </g>

          {/* Calipers sobre la lesión */}
          <g className={styles.calipers}>
            <path d={`M${lesionX - 30} ${lesionY + 26}h10m-5 -5v10`} />
            <path d={`M${lesionX + 38} ${lesionY + 26}h10m-5 -5v10`} />
            <line x1={lesionX - 18} y1={lesionY + 26} x2={lesionX + 36} y2={lesionY + 26} strokeDasharray="2 4" />
          </g>

          {/* Lecturas */}
          <g className={styles.readout}>
            <text x={18} y={30}>EPI®</text>
            <text x={18} y={46} className={styles.dim}>GUÍA ECOGRÁFICA</text>
            <text x={18} y={H - 22} className={styles.dim}>TENDÓN · CORTE LONGITUDINAL</text>
          </g>
        </svg>
        <span className={styles.sweep} aria-hidden="true" />
      </div>
      <figcaption className={styles.caption}>
        <span className="label mark">Ilustración</span>
        <span>La aguja llega al tejido lesionado mientras lo vemos en el ecógrafo.</span>
      </figcaption>
    </figure>
  );
}
