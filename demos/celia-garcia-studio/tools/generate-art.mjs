// Genera las ilustraciones SVG de la demo (puntas de uñas, línea fina, pestañas).
// No forma parte del despliegue: se ejecuta a mano y escribe en public/assets/.
//   node tools/generate-art.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets");
mkdirSync(join(root, "works"), { recursive: true });

const INK = "#3b2a26";

// Generador pseudoaleatorio estable para que el resultado no cambie entre ejecuciones.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Punta almendrada con origen en el centro de la base; la punta queda en y = -152.
const NAIL = "M-35,-8 L-35,-85 C-35,-125 -14,-148 0,-153 C14,-148 35,-125 35,-85 L35,-8 Q0,6 -35,-8 Z";

const defsCommon = (id) => `
  <filter id="${id}-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 .23  0 0 0 0 .16  0 0 0 0 .15  0 0 0 .05 0"/>
  </filter>
  <filter id="${id}-shadow" x="-40%" y="-30%" width="180%" height="160%">
    <feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#6b3f36" flood-opacity=".18"/>
  </filter>
  <filter id="${id}-soft"><feGaussianBlur stdDeviation="1.6"/></filter>
  <filter id="blur" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="10"/></filter>
  <linearGradient id="${id}-gloss" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
    <stop offset=".5" stop-color="#fff" stop-opacity=".75"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>`;

// Cada diseño devuelve { defs, body } en coordenadas de la uña.
const designs = {
  milky(id, i, seed = 1) {
    const r = rng(seed + i * 17);
    let flecks = "";
    for (let k = 0; k < 26; k++) {
      const x = -32 + r() * 64, y = -150 + r() * 120, s = 0.6 + r() * 1.6;
      flecks += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(2)}" fill="#c9a25e" opacity="${(0.55 + r() * 0.45).toFixed(2)}"/>`;
    }
    return {
      defs: `<linearGradient id="${id}-milky" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ecc9c0"/><stop offset="1" stop-color="#f7e3dd"/></linearGradient>`,
      body: `<path d="${NAIL}" fill="url(#${id}-milky)"/>${i % 2 === 0 ? flecks : ""}`,
    };
  },
  boomer(id) {
    return {
      defs: `<linearGradient id="${id}-boomer" x1="0" y1="1" x2="0" y2="0"><stop offset=".05" stop-color="#e7c1b1"/><stop offset=".55" stop-color="#f3dfd6"/><stop offset=".85" stop-color="#fdf8f5"/></linearGradient>`,
      body: `<path d="${NAIL}" fill="url(#${id}-boomer)"/>`,
    };
  },
  chrome(id, i) {
    const rot = 20 + i * 25;
    return {
      defs: `<linearGradient id="${id}-chrome${i}" x1="0" y1="1" x2="1" y2="0" gradientTransform="rotate(${rot} .5 .5)">
        <stop offset="0" stop-color="#e9dde3"/><stop offset=".22" stop-color="#fbf7f3"/><stop offset=".42" stop-color="#d9cbe0"/>
        <stop offset=".6" stop-color="#f6efe6"/><stop offset=".8" stop-color="#dccfd6"/><stop offset="1" stop-color="#fffdfb"/></linearGradient>`,
      body: `<path d="${NAIL}" fill="url(#${id}-chrome${i})"/>`,
    };
  },
  french(id, i) {
    const y = -122 - (i % 2) * 6;
    return {
      defs: `<linearGradient id="${id}-nude" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e9c4b8"/><stop offset="1" stop-color="#f2d7ce"/></linearGradient>`,
      body: `<path d="${NAIL}" fill="url(#${id}-nude)"/><path d="M-42,${y} Q0,${y - 26} 42,${y} L42,-160 L-42,-160 Z" fill="#fffaf7"/>`,
    };
  },
  floral(id, i) {
    const flower = (cx, cy, s) => {
      let p = "";
      for (let k = 0; k < 5; k++) {
        p += `<ellipse cx="${cx}" cy="${cy - 5 * s}" rx="${2.6 * s}" ry="${5 * s}" transform="rotate(${k * 72} ${cx} ${cy})" fill="#fffaf7" stroke="${INK}" stroke-width=".9"/>`;
      }
      return p + `<circle cx="${cx}" cy="${cy}" r="${1.6 * s}" fill="#c9a25e"/>`;
    };
    const leaf = (x, y, a) =>
      `<path d="M${x},${y} q6,-7 12,0 q-6,7 -12,0z" transform="rotate(${a} ${x} ${y})" fill="none" stroke="${INK}" stroke-width=".9"/>`;
    const accent = i === 1 || i === 3;
    const art = accent
      ? flower(-6, -104, 1.25) + flower(10, -78, 0.9) + leaf(4, -112, -30) + leaf(-18, -84, 40) +
        `<path d="M-14,-60 C-6,-72 0,-80 10,-78" fill="none" stroke="${INK}" stroke-width=".8"/>`
      : i === 2
        ? flower(0, -122, 0.8)
        : "";
    return {
      defs: `<linearGradient id="${id}-rose" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ead0c6"/><stop offset="1" stop-color="#f6e6e0"/></linearGradient>`,
      body: `<path d="${NAIL}" fill="url(#${id}-rose)"/>${art}`,
    };
  },
  cateye(id, i) {
    return {
      defs: `<linearGradient id="${id}-cherry" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3a0f19"/><stop offset="1" stop-color="#6e2234"/></linearGradient>
        <linearGradient id="${id}-band${i}" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${-8 + i * 4} .5 .5)">
        <stop offset=".3" stop-color="#ffd9df" stop-opacity="0"/><stop offset=".5" stop-color="#ffd9df" stop-opacity=".75"/><stop offset=".7" stop-color="#ffd9df" stop-opacity="0"/></linearGradient>`,
      body: `<path d="${NAIL}" fill="url(#${id}-cherry)"/><path d="${NAIL}" fill="url(#${id}-band${i})"/>`,
    };
  },
  aura(id, i) {
    const colors = ["#e48aa0", "#d78fb8", "#e9a07f", "#d58aa8", "#e48aa0"];
    return {
      defs: `<radialGradient id="${id}-aura${i}" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="${colors[i]}"/><stop offset=".55" stop-color="${colors[i]}" stop-opacity=".35"/><stop offset="1" stop-color="#f6e7e2" stop-opacity="0"/></radialGradient>`,
      body: `<path d="${NAIL}" fill="#f6e7e2"/><path d="${NAIL}" fill="url(#${id}-aura${i})"/>`,
    };
  },
  lines(id, i) {
    const r = rng(40 + i);
    const y1 = -60 - r() * 60;
    return {
      defs: `<linearGradient id="${id}-sand" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e3c2b0"/><stop offset="1" stop-color="#efd9cc"/></linearGradient>`,
      body: `<path d="${NAIL}" fill="url(#${id}-sand)"/>
        <path d="M-40,${y1.toFixed(0)} C-10,${(y1 - 30).toFixed(0)} 5,${(y1 + 22).toFixed(0)} 40,${(y1 - 18).toFixed(0)}" fill="none" stroke="${INK}" stroke-width="1.1"/>
        <path d="M-40,${(y1 + 14).toFixed(0)} C-12,${(y1 - 12).toFixed(0)} 8,${(y1 + 34).toFixed(0)} 40,${(y1 - 4).toFixed(0)}" fill="none" stroke="#c9a25e" stroke-width="1.4"/>`,
    };
  },
};

function nail(id, design, i, transform, opts = {}) {
  const d = designs[design](id, i, opts.seed);
  const clip = `${id}-clip${i}`;
  return {
    defs: d.defs + `<clipPath id="${clip}"><path d="${NAIL}"/></clipPath>`,
    body: `<g transform="${transform}" filter="url(#${id}-shadow)">
      <g clip-path="url(#${clip})">${d.body}
        <path d="M-22,-24 C-26,-70 -22,-112 -8,-138" fill="none" stroke="url(#${id}-gloss)" stroke-width="7" stroke-linecap="round" opacity=".7" filter="url(#${id}-soft)"/>
        <path d="M-35,-8 Q0,6 35,-8" fill="none" stroke="#000" stroke-opacity=".06" stroke-width="5"/>
      </g>
      <path d="${NAIL}" fill="none" stroke="#7a4b40" stroke-opacity=".12" stroke-width="1"/>
    </g>`,
  };
}

function fan(id, designsPerNail, { cx, cy, scale = 1, spread = 13, pivot = 210, seed } = {}) {
  let defs = "", body = "";
  const n = designsPerNail.length;
  designsPerNail.forEach((design, i) => {
    const a = (i - (n - 1) / 2) * spread;
    const t = `translate(${cx} ${cy}) scale(${scale}) rotate(${a} 0 ${pivot})`;
    const nn = nail(id, design, i, t, { seed });
    defs += nn.defs;
    body += nn.body;
  });
  return { defs, body };
}

// Ramita en línea fina (rama con hojas y una flor abierta).
function sprig(x, y, s = 1, rot = 0, color = INK) {
  const leaves = [
    [18, -40, -35], [6, -78, 30], [26, -112, -40], [10, -150, 25], [30, -60, 55],
  ].map(([lx, ly, a]) =>
    `<path d="M${lx},${ly} q14,-14 30,-2 q-16,12 -30,2z M${lx},${ly} q16,-4 28,-2" transform="rotate(${a} ${lx} ${ly})"/>`
  ).join("");
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" fill="none" stroke="${color}" stroke-width="${(1.1 / s).toFixed(2)}" stroke-linecap="round">
    <path d="M0,0 C10,-40 4,-90 22,-140 C30,-160 34,-175 30,-190"/>
    ${leaves}
    <g transform="translate(30 -196)">
      <path d="M0,0 c-12,-6 -16,-22 -4,-28 c4,8 6,14 4,28z"/>
      <path d="M0,0 c12,-6 16,-22 4,-28 c-4,8 -6,14 -4,28z"/>
      <path d="M0,0 c-18,2 -26,-10 -20,-20 c8,4 14,10 20,20z"/>
      <path d="M0,0 c18,2 26,-10 20,-20 c-8,4 -14,10 -20,20z"/>
      <circle cx="0" cy="-12" r="1.2" fill="${color}"/><circle cx="-3" cy="-16" r=".9" fill="${color}"/><circle cx="3" cy="-17" r=".9" fill="${color}"/>
    </g>
  </g>`;
}

function svg(id, w, h, bg, inner, defs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
<defs>${defsCommon(id)}${bg.defs || ""}${defs}</defs>
${bg.body}
${inner}
<rect width="${w}" height="${h}" filter="url(#${id}-grain)"/>
</svg>
`;
}

function background(id, w, h, a, b, accent) {
  return {
    defs: `<linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <radialGradient id="${id}-glow" cx=".7" cy=".25" r=".7"><stop offset="0" stop-color="${accent}" stop-opacity=".55"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>`,
    body: `<rect width="${w}" height="${h}" fill="url(#${id}-bg)"/><rect width="${w}" height="${h}" fill="url(#${id}-glow)"/>`,
  };
}

// Sombra suave de apoyo bajo el abanico de puntas.
const stand = (cx, y, w) =>
  `<ellipse cx="${cx}" cy="${y}" rx="${w / 2}" ry="14" fill="#7a4b40" opacity=".10" filter="url(#blur)"/>`;

function work(name, set, bg, extra = "", opts = {}) {
  const id = name.replace(/[^a-z]/g, "");
  const W = 600, H = 750;
  const b = background(id, W, H, ...bg);
  const f = fan(id, set, { cx: 300, cy: 500, scale: 1.42, spread: opts.spread ?? 14, seed: opts.seed });
  const out = svg(id, W, H, b, `${extra}${stand(300, 530, 330)}${f.body}`, f.defs);
  writeFileSync(join(root, "works", `${name}.svg`), out);
}

work("milky-rose", ["milky", "milky", "milky", "milky", "milky"], ["#f7ece7", "#ead3cb", "#fff6f1"],
  sprig(70, 720, 1.1, -8, "#a8786c"), { seed: 3 });
work("baby-boomer", ["boomer", "boomer", "boomer", "boomer", "boomer"], ["#efe3dc", "#dcc2b6", "#ffffff"],
  sprig(540, 730, 1, 12, "#a8786c"));
work("chrome-perla", ["chrome", "chrome", "chrome", "chrome", "chrome"], ["#e9e2ea", "#cfc3d1", "#fffaf2"]);
work("micro-french", ["french", "french", "french", "french", "french"], ["#f4ebe5", "#e4d2c8", "#fff5ee"],
  sprig(520, 735, 1.15, 10, "#8f6b60"));
work("floral-linea-fina", ["floral", "floral", "floral", "floral", "floral"], ["#f8efe9", "#ecd6cd", "#fffaf6"],
  sprig(80, 730, 1.2, -10, INK) + sprig(540, 720, 0.9, 14, INK));
work("cat-eye-cereza", ["cateye", "cateye", "cateye", "cateye", "cateye"], ["#efe1dd", "#d7b9b3", "#fbe9e6"],
  "", { spread: 15 });
work("aura", ["aura", "aura", "aura", "aura", "aura"], ["#f7ebe8", "#ecd2d6", "#fff1ec"]);
work("nude-lineas", ["lines", "lines", "lines", "lines", "lines"], ["#f3e8df", "#e2cbbb", "#fff8f1"],
  sprig(80, 735, 1, -6, "#8f6b60"));

// Tatuaje en línea fina sobre piel.
{
  const id = "tattoo", W = 600, H = 750;
  const b = background(id, W, H, "#ecc9b6", "#d6a891", "#f7dccd");
  let dots = "";
  const r = rng(9);
  for (let k = 0; k < 40; k++) {
    const x = 300 + (r() - 0.5) * 120, y = 250 + r() * 220;
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.5 + r() * 0.9).toFixed(2)}" fill="${INK}" opacity=".7"/>`;
  }
  const inner = `
    <ellipse cx="300" cy="380" rx="250" ry="340" fill="#f2d3c2" opacity=".35"/>
    ${sprig(250, 620, 2.2, 6, "#2b1d1a")}
    ${dots}
    <g fill="none" stroke="#2b1d1a" stroke-width="1" opacity=".75">
      <path d="M455,180 c-8,-10 -22,-8 -24,4 c-2,12 14,18 24,30 c10,-12 26,-18 24,-30 c-2,-12 -16,-14 -24,-4z"/>
    </g>`;
  writeFileSync(join(root, "works", "tattoo-linea-fina.svg"), svg(id, W, H, b, inner));
}

// Pestañas: ojo cerrado en línea fina.
{
  const id = "lash", W = 600, H = 750;
  const b = background(id, W, H, "#f6ece8", "#e6cfc9", "#fff6f2");
  let lashes = "";
  for (let k = 0; k <= 26; k++) {
    const t = k / 26;
    const x = 140 + t * 320;
    const y = 370 + Math.sin(t * Math.PI) * 58;
    const len = 26 + Math.sin(t * Math.PI) * 46;
    const ang = (t - 0.5) * 70;
    const rad = (ang * Math.PI) / 180;
    const ex = x + Math.sin(rad) * len, ey = y + Math.cos(rad) * len;
    lashes += `<path d="M${x.toFixed(1)},${y.toFixed(1)} Q${(x + Math.sin(rad) * len * 0.4 + 6).toFixed(1)},${(y + len * 0.6).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}"/>`;
  }
  const inner = `
    <g fill="none" stroke="${INK}" stroke-linecap="round">
      <path d="M120,360 C200,440 400,440 480,360" stroke-width="2.4"/>
      <path d="M150,300 C230,250 380,250 460,292" stroke-width="1.2" opacity=".55"/>
      <g stroke-width="1.6">${lashes}</g>
    </g>
    ${sprig(80, 720, 0.9, -8, "#a8786c")}`;
  writeFileSync(join(root, "works", "pestanas.svg"), svg(id, W, H, b, inner));
}

// Hero: abanico mixto, más grande, con ramita cruzando.
{
  const id = "hero", W = 720, H = 900;
  const b = background(id, W, H, "#f6e6df", "#e7c9be", "#fff7f2");
  const f = fan(id, ["milky", "chrome", "floral", "french", "aura"], { cx: 360, cy: 600, scale: 1.7, spread: 14, seed: 5 });
  const inner = `${sprig(110, 880, 1.6, -12, "#9c6f63")}${stand(360, 640, 420)}${f.body}${sprig(640, 900, 1.2, 16, "#9c6f63")}`;
  writeFileSync(join(root, "hero.svg"), svg(id, W, H, b, inner, f.defs));
}

// Estudio: lámina de bocetos con paleta de color.
{
  const id = "sketch", W = 720, H = 860;
  const b = background(id, W, H, "#fbf6f1", "#efe2d9", "#ffffff");
  const chips = ["#f3d9d3", "#e7c1b1", "#d9cbe0", "#6e2234", "#e48aa0", "#c9a25e", "#fffaf7"]
    .map((c, i) => `<circle cx="${130 + (i % 4) * 82}" cy="${640 + Math.floor(i / 4) * 82}" r="30" fill="${c}" stroke="${INK}" stroke-opacity=".25"/>`)
    .join("");
  const f = fan(id, ["floral", "floral", "floral"], { cx: 520, cy: 470, scale: 1.05, spread: 14 });
  const inner = `
    <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${INK}" stroke-opacity=".15"/>
    ${sprig(150, 520, 2, -4, INK)}
    <g fill="none" stroke="${INK}" stroke-width="1" opacity=".55">
      <path d="M440,140 c40,-20 90,-10 120,20" stroke-dasharray="3 5"/>
      <path d="M560,160 l-12,-2 l6,-10"/>
    </g>
    ${stand(520, 490, 200)}${f.body}
    ${chips}`;
  writeFileSync(join(root, "sketch.svg"), svg(id, W, H, b, inner, f.defs));
}

console.log("Ilustraciones generadas en", root);
