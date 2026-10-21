// Genera las escenas interiores de la demo (SVG propios en perspectiva cónica, sin fotos de terceros).
// Uso: node demos/moreno-casado-reformas/tools/gen-images.mjs
// Salida: demo-host/assets/img/*.svg — todas son imágenes demostrativas, no obras reales.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '../../../demo-host/assets/img');
mkdirSync(out, { recursive: true });

const W = 1600, H = 1067;
let uid = 0;
const nid = (p) => `${p}${++uid}`;
const f2 = (n) => Math.round(n * 10) / 10;

function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function shade(c, k) {
  const [r, g, b] = hex(c);
  const m = (v) => Math.max(0, Math.min(255, Math.round(k >= 1 ? v + (255 - v) * (k - 1) : v * k)));
  return '#' + [m(r), m(g), m(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

// Cámara y proyección. Habitación: X ∈ [-hw, hw], Y ∈ [0, h], Z ∈ [near, d]
function room(o) {
  const R = { hw: 3, h: 2.7, d: 4.5, camX: 0, camY: 1.45, cx: 800, cy: 520, z0: 3.4, ...o };
  R.f = o.f ?? (800 * R.z0) / R.hw;
  R.near = -R.z0 + 0.6;
  R.p = (X, Y, Z) => {
    const s = R.f / (Z + R.z0);
    return [f2(R.cx + (X - R.camX) * s), f2(R.cy - (Y - R.camY) * s)];
  };
  R.defs = []; R.layers = [];
  return R;
}
const pts = (R, list) => list.map(([x, y, z]) => R.p(x, y, z).join(',')).join(' ');
function poly(R, list, fill, extra = '') { R.layers.push(`<polygon points="${pts(R, list)}" fill="${fill}" ${extra}/>`); }
function line(R, a, b, stroke, w = 1, extra = '') {
  const [x1, y1] = R.p(...a), [x2, y2] = R.p(...b);
  R.layers.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" ${extra}/>`);
}
function grad(R, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
  const g = nid('g');
  R.defs.push(`<linearGradient id="${g}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`);
  return `url(#${g})`;
}

// Caja con caras visibles según la posición de la cámara
function box(R, x0, x1, y0, y1, z0, z1, c, o = {}) {
  const top = o.top ?? shade(c, 1.12), side = o.side ?? shade(c, 0.82), front = o.front ?? c;
  if (x0 > R.camX) poly(R, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], side);
  if (x1 < R.camX) poly(R, [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], side);
  if (y1 < R.camY) poly(R, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], top);
  if (y0 > R.camY) poly(R, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], shade(c, 0.7));
  poly(R, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], front);
  if (o.doors) {
    const n = o.doors, w = (x1 - x0) / n;
    for (let i = 1; i < n; i++) line(R, [x0 + w * i, y0 + 0.02, z0], [x0 + w * i, y1 - 0.02, z0], shade(front, 0.72), 1.4);
    if (o.handles) for (let i = 0; i < n; i++) line(R, [x0 + w * i + w * 0.15, y1 - 0.08, z0], [x0 + w * i + w * 0.45, y1 - 0.08, z0], o.handles, 2.4);
  }
  if (o.drawers) for (let i = 1; i < o.drawers; i++) line(R, [x0 + 0.02, y0 + ((y1 - y0) / o.drawers) * i, z0], [x1 - 0.02, y0 + ((y1 - y0) / o.drawers) * i, z0], shade(front, 0.72), 1.4);
}

// Superficies de la habitación
function shell(R, c) {
  const { hw, h, d, near } = R;
  // techo
  poly(R, [[-hw, h, near], [hw, h, near], [hw, h, d], [-hw, h, d]], grad(R, [[0, shade(c.ceil, 0.9)], [1, c.ceil]]));
  // paredes laterales
  poly(R, [[-hw, 0, near], [-hw, 0, d], [-hw, h, d], [-hw, h, near]], grad(R, [[0, shade(c.left, 0.86)], [1, c.left]], 0, 0, 1, 0));
  poly(R, [[hw, 0, near], [hw, 0, d], [hw, h, d], [hw, h, near]], grad(R, [[0, c.right], [1, shade(c.right, 0.86)]], 0, 0, 1, 0));
  // fondo
  poly(R, [[-hw, 0, d], [hw, 0, d], [hw, h, d], [-hw, h, d]], grad(R, [[0, shade(c.back, 1.04)], [1, shade(c.back, 0.94)]]));
  // suelo
  poly(R, [[-hw, 0, near], [hw, 0, near], [hw, 0, d], [-hw, 0, d]], grad(R, [[0, shade(c.floor, 0.9)], [0.7, c.floor], [1, shade(c.floor, 0.86)]]));
}
function floorLines(R, { along = 0, across = 0, color = '#000', op = 0.12, w = 1 }) {
  const { hw, d, near } = R;
  if (along) for (let x = -hw + along; x < hw - 0.001; x += along) line(R, [x, 0, near], [x, 0, d], color, w, `stroke-opacity="${op}"`);
  if (across) for (let z = d - across; z > near; z -= across) line(R, [-hw, 0, z], [hw, 0, z], color, w, `stroke-opacity="${op}"`);
}
// Retícula de azulejo en un plano de pared ('back' | 'left' | 'right') entre alturas
function wallTiles(R, wall, { tw, th, y0 = 0, y1, color, op = 0.2, w = 1, z0, z1, x0, x1 }) {
  const { hw, d, near } = R;
  y1 = y1 ?? R.h;
  if (wall === 'back') {
    x0 = x0 ?? -hw; x1 = x1 ?? hw;
    for (let x = x0 + tw; x < x1 - 0.001; x += tw) line(R, [x, y0, d], [x, y1, d], color, w, `stroke-opacity="${op}"`);
    for (let y = y0 + th; y < y1 - 0.001; y += th) line(R, [x0, y, d], [x1, y, d], color, w, `stroke-opacity="${op}"`);
  } else {
    const X = wall === 'left' ? -hw : hw;
    z0 = z0 ?? near; z1 = z1 ?? d;
    for (let z = z1 - tw; z > z0 + 0.001; z -= tw) line(R, [X, y0, z], [X, y1, z], color, w, `stroke-opacity="${op}"`);
    for (let y = y0 + th; y < y1 - 0.001; y += th) line(R, [X, y, z0], [X, y, z1], color, w, `stroke-opacity="${op}"`);
  }
}
function wallBand(R, wall, y0, y1, fill, o = {}) {
  const { hw, d, near } = R;
  if (wall === 'back') poly(R, [[o.x0 ?? -hw, y0, d], [o.x1 ?? hw, y0, d], [o.x1 ?? hw, y1, d], [o.x0 ?? -hw, y1, d]], fill);
  else { const X = wall === 'left' ? -hw : hw; poly(R, [[X, y0, o.z0 ?? near], [X, y0, o.z1 ?? d], [X, y1, o.z1 ?? d], [X, y1, o.z0 ?? near]], fill); }
}
// Ventana en la pared del fondo con haz de luz
function backWindow(R, x0, x1, y0, y1, o = {}) {
  const d = R.d - 0.001, frame = o.frame ?? '#2B2A28';
  const sky = grad(R, o.sky ?? [[0, '#BFD3E2'], [0.6, '#E9EEF0'], [1, '#F6EFE3']]);
  poly(R, [[x0 - 0.05, y0 - 0.05, d], [x1 + 0.05, y0 - 0.05, d], [x1 + 0.05, y1 + 0.05, d], [x0 - 0.05, y1 + 0.05, d]], frame);
  poly(R, [[x0, y0, d], [x1, y0, d], [x1, y1, d], [x0, y1, d]], sky);
  if (o.trees) {
    const [a, b] = R.p(x0, y0, d), [c2, e] = R.p(x1, y1, d);
    const wpx = c2 - a, hpx = b - e;
    R.layers.push(`<path d="M${a} ${b} ${Array.from({ length: 9 }, (_, i) => `Q${f2(a + wpx * (i + 0.5) / 9)} ${f2(b - hpx * (0.35 + 0.18 * Math.sin(i * 1.7)))} ${f2(a + wpx * (i + 1) / 9)} ${f2(b - hpx * (0.22 + 0.1 * Math.cos(i)))}`).join(' ')} L${c2} ${b}Z" fill="${o.trees}" opacity=".55"/>`);
  }
  if (o.mullions) for (let i = 1; i < o.mullions; i++) { const x = x0 + ((x1 - x0) / o.mullions) * i; line(R, [x, y0, d], [x, y1, d], frame, 3); }
  if (o.beam !== false) {
    const k = o.beamLen ?? 2.2;
    poly(R, [[x0 - 0.3, 0, R.d - k * 0.6], [x1 - 0.3, 0, R.d - k * 0.6], [x1, 0, R.d - 0.02], [x0, 0, R.d - 0.02]], grad(R, [[0, '#FFF4DF', 0], [1, '#FFF4DF', o.beamOp ?? 0.5]]));
  }
}
// Ventanal en pared izquierda (luz lateral)
function leftGlazing(R, z0, z1, y0, y1, o = {}) {
  const X = -R.hw + 0.001, frame = o.frame ?? '#232220';
  poly(R, [[X, y0 - 0.06, z0 - 0.06], [X, y0 - 0.06, z1 + 0.06], [X, y1 + 0.06, z1 + 0.06], [X, y1 + 0.06, z0 - 0.06]], frame);
  poly(R, [[X, y0, z0], [X, y0, z1], [X, y1, z1], [X, y1, z0]], grad(R, o.sky ?? [[0, '#AFC6D6'], [0.55, '#E4EAEC'], [0.8, '#B9C3A6'], [1, '#93A07F']]));
  const n = o.panes ?? 3;
  for (let i = 1; i < n; i++) { const z = z0 + ((z1 - z0) / n) * i; line(R, [X, y0, z], [X, y1, z], frame, 4); }
  // haz de luz en el suelo
  const sx = o.spread ?? 2.6;
  poly(R, [[-R.hw, 0, z0], [-R.hw, 0, z1], [-R.hw + sx, 0, z1 - 0.9], [-R.hw + sx, 0, z0 - 0.9]], grad(R, [[0, '#FFF1D6', o.beamOp ?? 0.55], [1, '#FFF1D6', 0]], 0, 0, 1, 0));
}
function pendant(R, x, z, yb, o = {}) {
  const [tx, ty] = R.p(x, R.h, z), [bx, by] = R.p(x, yb, z);
  const s = R.f / (z + R.z0), r = (o.r ?? 0.17) * s;
  const c = o.color ?? '#1E1D1B';
  R.layers.push(`<line x1="${tx}" y1="${ty}" x2="${bx}" y2="${by}" stroke="${c}" stroke-width="1.4"/>`);
  if (o.shape === 'globe') R.layers.push(`<circle cx="${bx}" cy="${f2(by + r)}" r="${f2(r)}" fill="${o.fill ?? '#F7EBD3'}"/><circle cx="${bx}" cy="${f2(by + r)}" r="${f2(r * 1.8)}" fill="#FFE9B8" opacity=".08"/>`);
  else R.layers.push(`<path d="M${f2(bx - r)} ${f2(by + r * 0.9)} Q${bx} ${f2(by - r * 0.5)} ${f2(bx + r)} ${f2(by + r * 0.9)}Z" fill="${c}"/><ellipse cx="${bx}" cy="${f2(by + r * 0.9)}" rx="${f2(r * 0.8)}" ry="${f2(r * 0.18)}" fill="#FFE7B0"/><ellipse cx="${bx}" cy="${f2(by + r * 2)}" rx="${f2(r * 2.4)}" ry="${f2(r * 1.6)}" fill="#FFE9B8" opacity=".1"/>`);
}
function plant(R, x, z, s = 1, potC = '#C9BBA6') {
  const [px, py] = R.p(x, 0, z); const k = (R.f / (z + R.z0)) * s;
  R.layers.push(`<path d="M${f2(px - 0.16 * k)} ${f2(py - 0.42 * k)} H${f2(px + 0.16 * k)} L${f2(px + 0.12 * k)} ${py} H${f2(px - 0.12 * k)}Z" fill="${potC}"/>` +
    [[-0.2, -0.95, 0.2], [0.18, -1.05, 0.22], [0, -1.25, 0.24], [-0.1, -0.7, 0.16], [0.22, -0.72, 0.15]].map(([dx, dy, rr], i) =>
      `<ellipse cx="${f2(px + dx * k)}" cy="${f2(py + dy * k)}" rx="${f2(rr * k)}" ry="${f2(rr * 1.5 * k)}" fill="${['#5F7556', '#6E8463', '#55694D', '#7A8F6C', '#4E6147'][i]}" transform="rotate(${[-25, 20, 0, -40, 35][i]} ${f2(px + dx * k)} ${f2(py + dy * k)})"/>`).join(''));
}
function rug(R, x0, x1, z0, z1, c) { poly(R, [[x0, 0.005, z0], [x1, 0.005, z0], [x1, 0.005, z1], [x0, 0.005, z1]], c); }
function shadowUnder(R, x0, x1, z0, z1, op = 0.18) { poly(R, [[x0 - 0.05, 0.002, z0 - 0.08], [x1 + 0.05, 0.002, z0 - 0.08], [x1, 0.002, z1], [x0, 0.002, z1]], '#000', `opacity="${op}"`); }
function frameArt(R, x0, x1, y0, y1, c) {
  const d = R.d - 0.002;
  poly(R, [[x0, y0, d], [x1, y0, d], [x1, y1, d], [x0, y1, d]], '#F4EFE6');
  poly(R, [[x0 + 0.05, y0 + 0.05, d], [x1 - 0.05, y0 + 0.05, d], [x1 - 0.05, y1 - 0.05, d], [x0 + 0.05, y1 - 0.05, d]], c);
}

function render(R, name, o = {}) {
  const vign = nid('v'), warm = nid('w');
  const defs = R.defs.join('') +
    `<radialGradient id="${vign}" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${o.vignette ?? 0.22}"/></radialGradient>` +
    `<linearGradient id="${warm}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.tint ?? '#FFE6C2'}" stop-opacity="${o.tintOp ?? 0.12}"/><stop offset="1" stop-color="#2A1E14" stop-opacity="${o.shadeOp ?? 0.08}"/></linearGradient>`;
  const body = R.layers.join('') + `<rect width="${W}" height="${H}" fill="url(#${warm})"/><rect width="${W}" height="${H}" fill="url(#${vign})"/>`;
  writeFileSync(join(out, `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs><rect width="${W}" height="${H}" fill="#222"/>${body}</svg>\n`);
  console.log('ok', name);
}

/* ---------- Escenas ---------- */

// Hero: salón-cocina abierto con ventanal lateral
{
  const R = room({ hw: 3.2, d: 5, camX: 0.4, cy: 500 });
  shell(R, { ceil: '#ECE7DF', left: '#E4DDD2', right: '#DCD3C6', back: '#E8E2D8', floor: '#B89A78' });
  floorLines(R, { along: 0.22, color: '#5A4129', op: 0.16 });
  floorLines(R, { across: 1.1, color: '#5A4129', op: 0.06 });
  leftGlazing(R, 0.6, 4.6, 0.02, 2.5, { panes: 4, beamOp: 0.6 });
  // muro de fondo con revestimiento de lamas
  wallBand(R, 'back', 0, R.h, '#C9B79E', { x0: -0.6, x1: 3.2 });
  for (let x = -0.6; x < 3.2; x += 0.08) line(R, [x, 0, R.d - 0.003], [x, R.h, R.d - 0.003], '#6E5A44', 1, 'stroke-opacity=".22"');
  // columnas altas y bancada
  box(R, 0.9, 3.2, 0, 2.4, R.d - 0.62, R.d - 0.02, '#2F2E2B', { doors: 4 });
  box(R, -0.6, 0.9, 0, 0.9, R.d - 0.62, R.d - 0.02, '#2F2E2B', { doors: 2 });
  box(R, -0.62, 0.92, 0.9, 0.93, R.d - 0.64, R.d - 0.02, '#D8D2C8');
  // isla
  shadowUnder(R, -0.9, 1.7, 2.5, 3.3, 0.22);
  box(R, -0.9, 1.7, 0, 0.92, 2.5, 3.3, '#A2876A', { side: '#8B7259' });
  box(R, -0.95, 1.75, 0.92, 0.96, 2.46, 3.34, '#E3DDD3');
  pendant(R, -0.2, 2.9, 1.75, { shape: 'globe' });
  pendant(R, 0.5, 2.9, 1.75, { shape: 'globe' });
  pendant(R, 1.2, 2.9, 1.75, { shape: 'globe' });
  // salón: alfombra, sofá
  rug(R, -2.6, -0.2, 0.2, 1.8, '#D7CBB9');
  box(R, -2.9, -1.2, 0, 0.42, 1.4, 2.3, '#8C8577', { side: '#7A7366' });
  box(R, -2.9, -1.2, 0.42, 0.8, 2.1, 2.3, '#9A9385');
  plant(R, -2.7, 4.6, 1.1);
  frameArt(R, 0, 0.7, 1.35, 2.1, '#B9653C');
  render(R, 'hero-salon-cocina', { tintOp: 0.16 });
}

// Cocina — antes / después (misma cámara)
const kitchenCam = { hw: 2.6, d: 4.2, camX: 0.2, cy: 560 };
{
  const R = room(kitchenCam);
  shell(R, { ceil: '#E8E3D2', left: '#DCD3B4', right: '#D6CDB0', back: '#DDD5BA', floor: '#B7A27F' });
  wallTiles(R, 'back', { tw: 0.2, th: 0.2, color: '#6D6248', op: 0.35 });
  wallTiles(R, 'right', { tw: 0.2, th: 0.2, color: '#6D6248', op: 0.3 });
  wallTiles(R, 'left', { tw: 0.2, th: 0.2, color: '#6D6248', op: 0.3, z0: 2.2 });
  floorLines(R, { along: 0.33, across: 0.33, color: '#3F321E', op: 0.3 });
  // tabique que cierra la cocina
  const zP = 2.2;
  poly(R, [[-R.hw, 0, zP], [-0.9, 0, zP], [-0.9, R.h, zP], [-R.hw, R.h, zP]], '#D9D0B2');
  poly(R, [[-0.9, 0, zP], [-0.9, 0, R.near], [-0.9, R.h, R.near], [-0.9, R.h, zP]], '#CFC5A6');
  wallTiles(R, 'back', { tw: 0.2, th: 0.2, color: '#6D6248', op: 0 });
  // puerta en el tabique
  poly(R, [[-0.9, 0, 1.4], [-0.9, 0, 0.6], [-0.9, 2.05, 0.6], [-0.9, 2.05, 1.4]], '#8A6A43');
  backWindow(R, -0.2, 0.8, 1.15, 2.05, { frame: '#E9E4D6', mullions: 2, beamOp: 0.2, sky: [[0, '#C9D2D6'], [1, '#E7E5DC']] });
  box(R, -0.9, 2.6, 0, 0.86, R.d - 0.6, R.d - 0.02, '#8A6A43', { doors: 6, handles: '#C9B88E' });
  box(R, -0.92, 2.6, 0.86, 0.9, R.d - 0.62, R.d - 0.02, '#B9A98A');
  box(R, 1.0, 2.6, 1.5, 2.25, R.d - 0.35, R.d - 0.02, '#7A5B37', { doors: 3, handles: '#C9B88E' });
  box(R, 2.0, 2.6, 0, 0.86, 1.6, R.d - 0.62, '#8A6A43', { doors: 3, handles: '#C9B88E' });
  box(R, 2.0, 2.62, 0.86, 0.9, 1.6, R.d - 0.62, '#B9A98A');
  // fluorescente
  box(R, -0.4, 0.8, R.h - 0.05, R.h - 0.01, 2.6, 2.75, '#F4F4EC');
  render(R, 'cocina-antes', { tint: '#E9E0B0', tintOp: 0.2, shadeOp: 0.16, vignette: 0.32 });
}
{
  const R = room(kitchenCam);
  shell(R, { ceil: '#EEEAE3', left: '#E7E1D7', right: '#DED6CA', back: '#E9E4DB', floor: '#C3A988' });
  floorLines(R, { along: 0.2, color: '#5A4129', op: 0.15 });
  backWindow(R, -0.6, 1.1, 1.1, 2.3, { frame: '#2B2A28', trees: '#7E8F6A', beamOp: 0.45 });
  box(R, -2.6, -0.9, 0, 2.5, R.d - 0.62, R.d - 0.02, '#3A3936', { doors: 3 });
  box(R, -0.9, 2.6, 0, 0.88, R.d - 0.62, R.d - 0.02, '#D9CFC0', { doors: 5 });
  box(R, -0.92, 2.6, 0.88, 0.92, R.d - 0.64, R.d - 0.02, '#F0ECE6');
  wallBand(R, 'back', 0.92, 1.05, '#E3DCD0', { x0: -0.9 });
  // estante abierto
  box(R, 1.4, 2.6, 1.55, 1.59, R.d - 0.28, R.d - 0.02, '#A2876A');
  box(R, 1.55, 1.7, 1.59, 1.82, R.d - 0.2, R.d - 0.1, '#EFE9DF');
  box(R, 1.9, 2.0, 1.59, 1.74, R.d - 0.2, R.d - 0.1, '#B9653C');
  // isla
  shadowUnder(R, -1.1, 1.3, 2.1, 2.9, 0.2);
  box(R, -1.1, 1.3, 0, 0.92, 2.1, 2.9, '#3A3936', { side: '#2C2B29' });
  box(R, -1.14, 1.34, 0.92, 0.96, 2.06, 2.94, '#F0ECE6');
  pendant(R, -0.4, 2.5, 1.85);
  pendant(R, 0.6, 2.5, 1.85);
  plant(R, 2.25, 1.0, 0.9, '#E3DCD0');
  render(R, 'cocina-despues', { tintOp: 0.14 });
}

// Baño — antes / después
const bathCam = { hw: 1.5, d: 3, camX: 0.1, cy: 520, camY: 1.4 };
{
  const R = room(bathCam);
  shell(R, { ceil: '#EAE5DC', left: '#E8CFC4', right: '#E3C9BE', back: '#E8D0C5', floor: '#A88E77' });
  wallTiles(R, 'back', { tw: 0.15, th: 0.2, y1: 1.9, color: '#7A5547', op: 0.35 });
  wallTiles(R, 'left', { tw: 0.15, th: 0.2, y1: 1.9, color: '#7A5547', op: 0.3 });
  wallTiles(R, 'right', { tw: 0.15, th: 0.2, y1: 1.9, color: '#7A5547', op: 0.3 });
  wallBand(R, 'back', 1.9, 1.98, '#9C6C5A'); wallBand(R, 'left', 1.9, 1.98, '#9C6C5A'); wallBand(R, 'right', 1.9, 1.98, '#9C6C5A');
  wallBand(R, 'back', 1.98, R.h, '#EFE7D8'); wallBand(R, 'left', 1.98, R.h, '#ECE3D3'); wallBand(R, 'right', 1.98, R.h, '#E6DDCD');
  floorLines(R, { along: 0.25, across: 0.25, color: '#3F2C20', op: 0.3 });
  // bañera
  box(R, -1.5, 1.5, 0, 0.55, R.d - 0.75, R.d - 0.02, '#F2EEE6', { side: '#E0D9CC' });
  box(R, -1.5, 1.5, 0.55, 0.6, R.d - 0.78, R.d - 0.02, '#FAF7F0');
  // cortina
  const [cx0, cy0] = R.p(-1.2, 1.95, R.d - 0.78), [cx1] = R.p(0.6, 1.95, R.d - 0.78), [, cyb] = R.p(0, 0.62, R.d - 0.78);
  let dpath = `M${cx0} ${cy0}`; const n = 9, wpx = (cx1 - cx0) / n;
  for (let i = 0; i < n; i++) dpath += ` q${f2(wpx / 2)} 14 ${f2(wpx)} 0`;
  dpath += ` L${cx1} ${cyb}`; for (let i = n; i > 0; i--) dpath += ` q${f2(-wpx / 2)} 10 ${f2(-wpx)} 0`; dpath += 'Z';
  R.layers.push(`<path d="${dpath}" fill="#E7B9AE" opacity=".92"/>`);
  for (let i = 1; i < n; i++) R.layers.push(`<line x1="${f2(cx0 + wpx * i)}" y1="${cy0}" x2="${f2(cx0 + wpx * i)}" y2="${cyb}" stroke="#B9847A" stroke-opacity=".35"/>`);
  line(R, [-1.5, 1.97, R.d - 0.78], [1.5, 1.97, R.d - 0.78], '#B8B2A6', 3);
  // lavabo de pedestal y espejo en pared derecha
  box(R, 1.1, 1.5, 0, 0.7, 0.7, 1.0, '#F2EEE6');
  box(R, 1.05, 1.5, 0.7, 0.86, 0.55, 1.15, '#FAF7F0');
  poly(R, [[1.499, 1.15, 0.6], [1.499, 1.15, 1.1], [1.499, 1.65, 1.1], [1.499, 1.65, 0.6]], '#C7CED0');
  render(R, 'bano-antes', { tint: '#F0D2B8', tintOp: 0.2, shadeOp: 0.14, vignette: 0.32 });
}
{
  const R = room(bathCam);
  shell(R, { ceil: '#EDEAE4', left: '#CFC8BD', right: '#C9C1B5', back: '#D4CDC2', floor: '#BDB4A6' });
  wallTiles(R, 'back', { tw: 0.6, th: 1.2, color: '#5A5246', op: 0.18 });
  wallTiles(R, 'left', { tw: 0.6, th: 1.2, color: '#5A5246', op: 0.16 });
  wallTiles(R, 'right', { tw: 0.6, th: 1.2, color: '#5A5246', op: 0.16 });
  floorLines(R, { along: 0.6, across: 1.2, color: '#4A4237', op: 0.16 });
  // ducha de obra a la derecha: hornacina con luz y mampara
  poly(R, [[0.6, 1.0, R.d - 0.004], [1.3, 1.0, R.d - 0.004], [1.3, 1.35, R.d - 0.004], [0.6, 1.35, R.d - 0.004]], '#B4AA9B');
  poly(R, [[0.6, 1.33, R.d - 0.005], [1.3, 1.33, R.d - 0.005], [1.3, 1.35, R.d - 0.005], [0.6, 1.35, R.d - 0.005]], '#FFE8BD');
  box(R, 0.75, 0.85, 1.0, 1.2, R.d - 0.1, R.d - 0.02, '#EFE9DF');
  box(R, 0.95, 1.05, 1.0, 1.15, R.d - 0.1, R.d - 0.02, '#3A3936');
  line(R, [1.2, 2.25, R.d - 0.3], [1.2, 2.25, R.d - 0.02], '#2B2A28', 3);
  box(R, 1.05, 1.35, 2.22, 2.25, R.d - 0.45, R.d - 0.15, '#2B2A28');
  poly(R, [[0.3, 0, R.d], [0.3, 0, 1.7], [0.3, 2.05, 1.7], [0.3, 2.05, R.d]], '#DCE7E8', 'opacity=".28"');
  line(R, [0.3, 0, 1.7], [0.3, 2.05, 1.7], '#2B2A28', 2);
  line(R, [0.3, 2.05, 1.7], [0.3, 2.05, R.d], '#2B2A28', 2);
  // mueble suspendido y espejo redondo
  shadowUnder(R, -1.5, -0.1, R.d - 0.5, R.d - 0.02, 0.12);
  box(R, -1.4, -0.1, 0.35, 0.82, R.d - 0.5, R.d - 0.02, '#A2876A', { drawers: 2 });
  box(R, -1.42, -0.08, 0.82, 0.86, R.d - 0.52, R.d - 0.02, '#ECE6DC');
  box(R, -0.95, -0.55, 0.86, 0.98, R.d - 0.4, R.d - 0.15, '#F7F4EE');
  const [mx, my] = R.p(-0.75, 1.55, R.d - 0.01); const ms = (R.f / (R.d + R.z0)) * 0.36;
  R.layers.push(`<circle cx="${mx}" cy="${my}" r="${f2(ms + 6)}" fill="#FFE6B5" opacity=".35"/><circle cx="${mx}" cy="${my}" r="${f2(ms)}" fill="#BFC7C8"/><path d="M${f2(mx - ms * 0.6)} ${f2(my + ms * 0.2)} L${f2(mx + ms * 0.2)} ${f2(my - ms * 0.6)}" stroke="#fff" stroke-opacity=".35" stroke-width="${f2(ms * 0.2)}"/>`);
  plant(R, -1.2, 0.9, 0.55, '#ECE6DC');
  render(R, 'bano-despues', { tintOp: 0.12 });
}

// Local comercial
{
  const R = room({ hw: 2.8, d: 6, camX: -0.3, cy: 560, camY: 1.5, h: 3.1 });
  shell(R, { ceil: '#2B2A28', left: '#E6E1D9', right: '#E1DBD1', back: '#B5653C', floor: '#B9B2A7' });
  floorLines(R, { across: 1.5, color: '#3C3833', op: 0.08 });
  for (let x = -2.8; x < 2.8; x += 0.12) line(R, [x, 0, R.d - 0.003], [x, R.h, R.d - 0.003], '#5E2E17', 1.4, 'stroke-opacity=".28"');
  // carril de focos
  line(R, [-0.6, R.h - 0.02, R.near + 0.2], [-0.6, R.h - 0.02, R.d], '#121110', 4);
  line(R, [1.2, R.h - 0.02, R.near + 0.2], [1.2, R.h - 0.02, R.d], '#121110', 4);
  for (const z of [0.6, 1.8, 3, 4.2, 5.2]) for (const x of [-0.6, 1.2]) {
    const [px, py] = R.p(x, R.h - 0.08, z); const s = R.f / (z + R.z0);
    R.layers.push(`<rect x="${f2(px - 0.05 * s)}" y="${py}" width="${f2(0.1 * s)}" height="${f2(0.14 * s)}" fill="#121110"/><ellipse cx="${px}" cy="${f2(py + 0.15 * s)}" rx="${f2(0.05 * s)}" ry="${f2(0.015 * s)}" fill="#FFE7B0"/>`);
  }
  // estanterías a la derecha
  for (const y of [0.4, 0.9, 1.4, 1.9]) box(R, 2.45, 2.8, y, y + 0.04, 1.2, 4.8, '#2B2A28');
  for (let z = 1.4; z < 4.6; z += 0.5) for (const y of [0.44, 0.94, 1.44]) box(R, 2.55, 2.75, y, y + 0.22 + ((z * 7) % 3) * 0.04, z, z + 0.25, ['#EFE9DF', '#B9653C', '#D8CBB6', '#3A3936'][Math.round(z * 3 + y * 4) % 4]);
  // mostrador
  shadowUnder(R, -1.4, 0.8, 3.6, 4.3, 0.2);
  box(R, -1.4, 0.8, 0, 1.0, 3.6, 4.3, '#E9E3D9', { side: '#CFC7BA' });
  box(R, -1.44, 0.84, 1.0, 1.04, 3.56, 4.34, '#2B2A28');
  plant(R, -2.4, 5.4, 1.3, '#2B2A28');
  plant(R, -2.4, 1.0, 0.9, '#D8CBB6');
  render(R, 'local-comercial', { tintOp: 0.1 });
}

// Dormitorio
{
  const R = room({ hw: 2.4, d: 4.2, camX: 0.3, cy: 580 });
  shell(R, { ceil: '#EEEAE3', left: '#E3DCD0', right: '#D9D1C3', back: '#8C9483', floor: '#C9B08F' });
  floorLines(R, { along: 0.18, color: '#5A4129', op: 0.14 });
  // cabecero de lamas
  for (let x = -1.2; x < 1.2; x += 0.1) box(R, x, x + 0.07, 0, 1.4, R.d - 0.06, R.d - 0.02, '#A2876A', { side: '#8B7259' });
  leftGlazing(R, 1.0, 2.8, 0.6, 2.3, { panes: 2, beamOp: 0.45, spread: 2 });
  shadowUnder(R, -0.9, 0.9, 2.2, R.d - 0.1, 0.18);
  box(R, -0.9, 0.9, 0, 0.32, 2.2, R.d - 0.08, '#6B5A48');
  box(R, -0.88, 0.88, 0.32, 0.55, 2.2, R.d - 0.1, '#F2EEE7', { side: '#E3DDD2' });
  box(R, -0.9, 0.9, 0.5, 0.58, 2.2, 3.0, '#C8BFAF');
  box(R, -0.75, -0.1, 0.55, 0.72, R.d - 0.45, R.d - 0.15, '#F7F4EE');
  box(R, 0.1, 0.75, 0.55, 0.72, R.d - 0.45, R.d - 0.15, '#F7F4EE');
  box(R, -1.45, -1.0, 0, 0.5, R.d - 0.5, R.d - 0.06, '#3A3936');
  box(R, 1.0, 1.45, 0, 0.5, R.d - 0.5, R.d - 0.06, '#3A3936');
  pendant(R, -1.22, R.d - 0.3, 1.1, { shape: 'globe', r: 0.1 });
  pendant(R, 1.22, R.d - 0.3, 1.1, { shape: 'globe', r: 0.1 });
  render(R, 'dormitorio', { tintOp: 0.14 });
}

// Comedor con arco de paso
{
  const R = room({ hw: 2.8, d: 4.8, camX: -0.2, cy: 560 });
  shell(R, { ceil: '#EEEAE3', left: '#E2D7C7', right: '#DCCFBD', back: '#E6DCCD', floor: '#A9927A' });
  floorLines(R, { along: 0.5, across: 0.5, color: '#4A3826', op: 0.12 });
  // arco en el fondo
  const [ax0, ay0] = R.p(-0.7, 0, R.d), [ax1] = R.p(0.7, 0, R.d), [, ayt] = R.p(0, 2.1, R.d);
  const rr = (ax1 - ax0) / 2;
  R.layers.push(`<path d="M${ax0} ${ay0} V${f2(ayt + rr)} A${f2(rr)} ${f2(rr)} 0 0 1 ${ax1} ${f2(ayt + rr)} V${ay0}Z" fill="#C8B79F"/><path d="M${f2(ax0 + rr * 0.25)} ${ay0} V${f2(ayt + rr)} A${f2(rr * 0.75)} ${f2(rr * 0.75)} 0 0 1 ${f2(ax1 - rr * 0.25)} ${f2(ayt + rr)} V${ay0}Z" fill="#F3E6CC"/>`);
  leftGlazing(R, 0.4, 3.6, 0.02, 2.4, { panes: 3, beamOp: 0.5, spread: 2.4 });
  rug(R, -1.4, 1.4, 1.4, 3.4, '#C9B79E');
  box(R, -0.95, 0.95, 0.72, 0.76, 1.9, 2.9, '#6E5641', { top: '#7E6450' });
  for (const [x, z] of [[-1.2, 2.2], [-1.2, 2.7], [1.0, 2.2], [1.0, 2.7]]) box(R, x, x + 0.22, 0, 0.82, z - 0.1, z + 0.12, '#2B2A28');
  pendant(R, -0.5, 2.4, 1.6, { r: 0.2 });
  pendant(R, 0.5, 2.4, 1.6, { r: 0.2 });
  box(R, 1.8, 2.8, 0, 0.75, 3.5, 4.6, '#B9653C', { side: '#9B5332', doors: 2 });
  plant(R, 2.3, 1.2, 1.1, '#E3DCD0');
  render(R, 'comedor', { tintOp: 0.15 });
}
