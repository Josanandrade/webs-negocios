// Genera las ilustraciones SVG de la demo (no son fotos del salón).
// Uso: node demos/free-style-peluqueria/tools/generate-art.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../demo-host/assets");
const out = (name, svg) => {
  const file = join(root, name);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg.replace(/\n\s*/g, "\n").trim() + "\n");
};

const C = {
  plum: "#2E1430",
  plum2: "#4A2147",
  saffron: "#F2A93B",
  honey: "#F7C873",
  blush: "#F4C7C3",
  rose: "#E58E8A",
  cream: "#FBF5EC",
  sand: "#EADDCB",
  ink: "#1C1219",
};

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const r = (a, b) => a + (b - a) * rnd();
const f = (n) => n.toFixed(1);

const svg = (w, h, body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>${defs}</defs>${body}</svg>`;

const grain = `<filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .07 0"/></filter>`;
const grainRect = (w, h) => `<rect width="${w}" height="${h}" filter="url(#g)"/>`;

// 1. Melena con ondas: mechones que caen y se curvan
function melena() {
  seed = 11;
  const W = 800, H = 1000;
  let p = "";
  for (let i = 0; i < 46; i++) {
    const x0 = 180 + i * 10 + r(-6, 6);
    const amp = r(40, 90);
    const d = `M${f(x0)} -20 C ${f(x0 + amp)} 220, ${f(x0 - amp)} 420, ${f(x0 + amp * 0.6)} 620 S ${f(x0 - amp * 1.2)} 900, ${f(x0 + r(-20, 60))} 1040`;
    const col = i % 5 === 0 ? C.honey : i % 3 === 0 ? C.plum2 : C.saffron;
    p += `<path d="${d}" fill="none" stroke="${col}" stroke-width="${f(r(2, 7))}" stroke-linecap="round" opacity="${f(r(0.55, 1))}"/>`;
  }
  return svg(W, H, `<rect width="${W}" height="${H}" fill="${C.plum}"/>${p}${grainRect(W, H)}`, grain);
}

// 2. Mechas / balayage: hebras verticales de oscuro a rubio
function balayage() {
  seed = 23;
  const W = 800, H = 1000;
  let p = "";
  for (let i = 0; i < 70; i++) {
    const x = 40 + i * 10.5 + r(-4, 4);
    const sway = r(-40, 40);
    p += `<path d="M${f(x)} -10 Q ${f(x + sway)} 500 ${f(x - sway / 2)} 1010" fill="none" stroke="url(#bal)" stroke-width="${f(r(3, 9))}" stroke-linecap="round" opacity="${f(r(0.6, 1))}"/>`;
  }
  const defs = `${grain}<linearGradient id="bal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.ink}"/><stop offset=".35" stop-color="${C.plum2}"/><stop offset=".7" stop-color="${C.saffron}"/><stop offset="1" stop-color="${C.honey}"/></linearGradient>`;
  return svg(W, H, `<rect width="${W}" height="${H}" fill="${C.sand}"/>${p}${grainRect(W, H)}`, defs);
}

// 3. Rizos: espirales
function rizos() {
  seed = 5;
  const W = 800, H = 800;
  let p = "";
  for (let k = 0; k < 16; k++) {
    const cx = r(60, 740), cy = r(60, 740), turns = r(2, 3.5), rad = r(30, 80);
    let d = "";
    for (let t = 0; t <= turns * Math.PI * 2; t += 0.18) {
      const rr = (rad * t) / (turns * Math.PI * 2);
      d += `${d ? "L" : "M"}${f(cx + rr * Math.cos(t))} ${f(cy + rr * Math.sin(t))}`;
    }
    p += `<path d="${d}" fill="none" stroke="${[C.plum, C.rose, C.saffron][k % 3]}" stroke-width="${f(r(4, 9))}" stroke-linecap="round"/>`;
  }
  return svg(W, H, `<rect width="${W}" height="${H}" fill="${C.blush}"/>${p}${grainRect(W, H)}`, grain);
}

// 4. Tijeras y peine, trazo de línea
function tijeras() {
  const W = 800, H = 800;
  const body = `<rect width="${W}" height="${H}" fill="${C.saffron}"/>
  <g fill="none" stroke="${C.plum}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="250" cy="560" r="70"/><circle cx="420" cy="610" r="70"/>
  <path d="M300 505 L610 150"/><path d="M365 555 L640 190"/><circle cx="455" cy="380" r="9" fill="${C.plum}"/>
  </g>
  <g transform="rotate(-18 560 600)"><rect x="430" y="560" width="300" height="46" rx="12" fill="${C.plum}"/>
  ${Array.from({ length: 22 }, (_, i) => `<rect x="${442 + i * 13}" y="600" width="6" height="${i % 2 ? 46 : 60}" rx="3" fill="${C.plum}"/>`).join("")}</g>
  ${grainRect(W, H)}`;
  return svg(W, H, body, grain);
}

// 5. Uñas: cinco formas con brillo
function unas() {
  const W = 800, H = 1000;
  const cols = [C.rose, C.plum, C.saffron, C.blush, C.plum2];
  const nails = cols
    .map((c, i) => {
      const x = 110 + i * 125, y = 330 + Math.abs(2 - i) * 60;
      return `<g transform="rotate(${(i - 2) * 6} ${x + 45} ${y + 160})">
      <rect x="${x}" y="${y}" width="90" height="230" rx="45" fill="${c}"/>
      <rect x="${x + 18}" y="${y + 22}" width="14" height="90" rx="7" fill="#fff" opacity=".35"/></g>`;
    })
    .join("");
  return svg(W, H, `<rect width="${W}" height="${H}" fill="${C.cream}"/>
  <circle cx="400" cy="460" r="330" fill="${C.sand}"/>${nails}${grainRect(W, H)}`, grain);
}

// 6. Mirada: ceja y pestañas
function mirada() {
  const W = 800, H = 800;
  const lashes = Array.from({ length: 15 }, (_, i) => {
    const t = i / 14, x = 190 + t * 420, y = 420 - Math.sin(t * Math.PI) * 120;
    const ang = -90 + (t - 0.5) * 70, len = 40 + Math.sin(t * Math.PI) * 30;
    const x2 = x + len * Math.cos((ang * Math.PI) / 180), y2 = y + len * Math.sin((ang * Math.PI) / 180);
    return `<path d="M${f(x)} ${f(y)} Q ${f((x + x2) / 2 + 8)} ${f((y + y2) / 2)} ${f(x2)} ${f(y2)}"/>`;
  }).join("");
  const brow = Array.from({ length: 26 }, (_, i) => {
    const t = i / 25, x = 170 + t * 470, y = 230 - Math.sin(Math.min(t * 1.4, 1) * Math.PI * 0.75) * 50;
    return `<path d="M${f(x)} ${f(y + 18)} L ${f(x + 26)} ${f(y - 6)}"/>`;
  }).join("");
  return svg(W, H, `<rect width="${W}" height="${H}" fill="${C.plum}"/>
  <g fill="none" stroke="${C.blush}" stroke-width="7" stroke-linecap="round">
  <path d="M180 420 Q 400 230 620 420 Q 400 560 180 420Z"/>${lashes}</g>
  <circle cx="400" cy="420" r="62" fill="${C.saffron}"/><circle cx="400" cy="420" r="26" fill="${C.ink}"/><circle cx="420" cy="398" r="10" fill="${C.cream}"/>
  <g stroke="${C.honey}" stroke-width="6" stroke-linecap="round">${brow}</g>${grainRect(W, H)}`, grain);
}

// 7. Facial: perfil de línea y círculos suaves
function facial() {
  const W = 800, H = 1000;
  return svg(W, H, `<rect width="${W}" height="${H}" fill="${C.blush}"/>
  <circle cx="560" cy="300" r="190" fill="${C.cream}" opacity=".7"/><circle cx="250" cy="760" r="150" fill="${C.honey}" opacity=".6"/>
  <path d="M470 120 C 330 130 270 250 290 350 C 300 400 250 440 240 470 C 235 490 270 495 285 500 C 280 530 290 545 300 552 C 290 570 300 590 320 595 C 330 640 340 690 420 690 C 470 690 520 720 540 880" fill="none" stroke="${C.plum}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M330 420 q 25 -14 50 0" fill="none" stroke="${C.plum}" stroke-width="7" stroke-linecap="round"/>
  ${grainRect(W, H)}`, grain);
}

// 8. Recogido: espiral de moño con hebras
function recogido() {
  seed = 41;
  const W = 800, H = 800;
  let p = "";
  for (let k = 0; k < 9; k++) {
    const rr = 60 + k * 26;
    p += `<path d="M${400 - rr} 400 A ${rr} ${f(rr * 0.82)} 0 1 1 ${f(400 + rr * 0.7)} ${f(400 + rr * 0.55)}" fill="none" stroke="${k % 2 ? C.saffron : C.cream}" stroke-width="${f(r(6, 12))}" stroke-linecap="round" transform="rotate(${f(k * 23)} 400 400)"/>`;
  }
  return svg(W, H, `<rect width="${W}" height="${H}" fill="${C.plum2}"/>${p}<circle cx="400" cy="400" r="36" fill="${C.rose}"/>${grainRect(W, H)}`, grain);
}

// Imagen social (og) y favicon
function og() {
  const W = 1200, H = 630;
  return svg(W, H, `<rect width="${W}" height="${H}" fill="${C.plum}"/>
  <path d="M-20 520 C 200 380 380 640 600 470 S 980 300 1220 420" fill="none" stroke="${C.saffron}" stroke-width="14" stroke-linecap="round"/>
  <text x="80" y="260" font-family="Arial Black, sans-serif" font-weight="900" font-size="150" fill="${C.cream}">Free Style</text>
  <text x="86" y="330" font-family="Arial, sans-serif" font-size="40" fill="${C.honey}">Peluquería y Estética · San José de la Rinconada</text>`);
}

out("galeria/melena.svg", melena());
out("galeria/balayage.svg", balayage());
out("galeria/rizos.svg", rizos());
out("galeria/tijeras.svg", tijeras());
out("galeria/unas.svg", unas());
out("galeria/mirada.svg", mirada());
out("galeria/facial.svg", facial());
out("galeria/recogido.svg", recogido());
out("og.svg", og());
console.log("Ilustraciones generadas en", root);
