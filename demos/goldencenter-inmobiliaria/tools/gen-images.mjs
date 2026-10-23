// Genera las imágenes ilustradas de la demo de Goldencenter (SVG propios, sin fotos de terceros).
// Uso: node demos/goldencenter-inmobiliaria/tools/gen-images.mjs
// Salida: demo-host/assets/img/*.svg
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '../../../demo-host/assets/img');
mkdirSync(out, { recursive: true });

const W = 1200, H = 800;
let uid = 0;
const id = (p) => `${p}${++uid}`;
const svg = (body, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>\n`;
const r = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const lin = (gid, stops, x2 = 0, y2 = 1) => `<linearGradient id="${gid}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;

// Paleta "lacre y pan de oro"
const C = {
  paper: '#F4EFE6', stone: '#E4DCCD', ink: '#1A1714', lacre: '#9B2C1F', oro: '#C8A24B',
  albero: '#D9A441', ocre: '#C98B3C', cal: '#FBF8F2', verdin: '#3F5A4F', teja: '#B8573A',
};

const SKIES = {
  manana: ['#BFD3E2', '#E9E6DC', '#F6EEDF'],
  dorada: ['#E9B98A', '#F3D6B1', '#F8EAD7'],
  tarde: ['#9EB4CF', '#E8C9B2', '#F6E2CF'],
  noche: ['#1E2A3A', '#5A4A5C', '#C9866A'],
};

function sky(kind, sun = { x: 960, y: 160 }) {
  const g = id('sky'), s = id('sun');
  const c = SKIES[kind];
  const defs = lin(g, [[0, c[0]], [0.65, c[1]], [1, c[2]]]) +
    `<radialGradient id="${s}"><stop offset="0" stop-color="#FFF4DC" stop-opacity=".95"/><stop offset="1" stop-color="#FFF4DC" stop-opacity="0"/></radialGradient>`;
  const body = r(0, 0, W, H, `url(#${g})`) + `<circle cx="${sun.x}" cy="${sun.y}" r="220" fill="url(#${s})"/><circle cx="${sun.x}" cy="${sun.y}" r="42" fill="#FFF3D6" opacity=".9"/>`;
  return { defs, body };
}

const glassDefs = lin('glass', [[0, '#5D7488'], [1, '#2C3A47']]) + lin('glassWarm', [[0, '#F2C98A'], [1, '#C8823E']]);

function win(x, y, w, h, o = {}) {
  const { frame = C.ink, glass = 'url(#glass)', reja = false, shutter = null, arch = false, balcony = false } = o;
  let s = '';
  if (arch) s += `<path d="M${x - 6} ${y + h + 6} V${y + w / 2} A${w / 2 + 6} ${w / 2 + 6} 0 0 1 ${x + w + 6} ${y + w / 2} V${y + h + 6}Z" fill="${frame}"/><path d="M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h}Z" fill="${glass}"/>`;
  else s += r(x - 6, y - 6, w + 12, h + 12, frame, 'rx="2"') + r(x, y, w, h, glass);
  s += `<path d="M${x + 4} ${y + h - 4} L${x + w * 0.6} ${y + 6}" stroke="#fff" stroke-opacity=".16" stroke-width="${w * 0.22}"/>`;
  s += r(x + w / 2 - 2, y + (arch ? w / 3 : 0), 4, h - (arch ? w / 3 : 0), frame);
  if (shutter) s += r(x - 8 - w * 0.4, y - 6, w * 0.4, h + 12, shutter) + r(x + w + 8, y - 6, w * 0.4, h + 12, shutter);
  if (reja) for (let i = 1; i < 6; i++) s += r(x + (w / 6) * i - 1.5, y - 6, 3, h + 12, '#211C18');
  if (balcony) {
    const bx = x - 22, bw = w + 44, by = y + h - 40;
    s += r(bx, by + 40, bw, 10, '#3A322B') + r(bx, by - 2, bw, 4, '#211C18');
    for (let i = 0; i <= 12; i++) s += r(bx + (bw / 12) * i - 1.5, by, 3, 40, '#211C18');
    s += `<ellipse cx="${bx + 18}" cy="${by - 6}" rx="18" ry="12" fill="${C.verdin}"/><circle cx="${bx + 12}" cy="${by - 12}" r="5" fill="${C.lacre}"/><circle cx="${bx + 26}" cy="${by - 9}" r="4" fill="#D65A4A"/>`;
  } else s += r(x - 12, y + h + 6, w + 24, 8, C.cal);
  return s;
}

function cornice(x, y, w, color = C.cal) { return r(x - 10, y, w + 20, 14, color) + r(x - 4, y + 14, w + 8, 6, '#00000018'); }

function tree(x, base, s = 1, color = C.verdin) {
  return `<path d="M${x} ${base} V${base - 90 * s}" stroke="#5B4636" stroke-width="${10 * s}"/>` +
    `<circle cx="${x}" cy="${base - 120 * s}" r="${54 * s}" fill="${color}"/><circle cx="${x - 36 * s}" cy="${base - 96 * s}" r="${38 * s}" fill="${color}" opacity=".9"/><circle cx="${x + 38 * s}" cy="${base - 100 * s}" r="${40 * s}" fill="${color}" opacity=".85"/>` +
    [[-20, -130], [18, -110], [-40, -96], [30, -140]].map(([dx, dy]) => `<circle cx="${x + dx * s}" cy="${base + dy * s}" r="${5 * s}" fill="${C.albero}"/>`).join('');
}

function giralda(x, base, s = 1, color = '#00000022') {
  const w = 60 * s;
  return `<g fill="${color}">${r(x - w / 2, base - 360 * s, w, 360 * s)}${r(x - w * 0.38, base - 430 * s, w * 0.76, 70 * s)}${r(x - w * 0.28, base - 480 * s, w * 0.56, 50 * s)}<path d="M${x - w * 0.2} ${base - 480 * s} Q${x} ${base - 540 * s} ${x + w * 0.2} ${base - 480 * s}Z"/>${r(x - 2 * s, base - 570 * s, 4 * s, 40 * s)}</g>`;
}

function ground(color = '#CDBFA6') { return r(0, 640, W, 160, color) + r(0, 640, W, 6, '#00000014'); }

// ---------- Escenas ----------
function casco(o = {}) {
  const { wall = C.albero, band = C.cal, door = C.lacre, time = 'manana' } = o;
  const sk = sky(time);
  let b = sk.body + giralda(1040, 640, 0.9);
  b += r(80, 120, 760, 520, wall) + r(80, 120, 30, 520, band) + r(810, 120, 30, 520, band) + cornice(80, 110, 760);
  b += r(80, 300, 760, 10, band) + r(80, 470, 760, 10, band);
  for (const x of [170, 400, 630]) {
    b += win(x, 170, 90, 120, { balcony: true });
    b += win(x, 340, 90, 115, { balcony: true });
  }
  b += r(390, 510, 140, 130, '#00000020') + `<path d="M396 640 V560 A64 64 0 0 1 524 560 V640Z" fill="${door}"/>` + r(458, 560, 4, 80, '#00000033');
  b += win(170, 510, 90, 100, { reja: true }) + win(630, 510, 90, 100, { reja: true });
  b += r(860, 260, 300, 380, C.cal) + cornice(860, 250, 300) + win(930, 320, 70, 100, { shutter: C.verdin }) + win(1040, 320, 70, 100, { shutter: C.verdin }) + win(930, 480, 70, 100, { reja: true }) + win(1040, 480, 70, 100, { reja: true });
  b += ground('#B9A88C') + r(0, 690, W, 110, '#A99677');
  for (let i = 0; i < 24; i++) b += r(i * 52, 720 + (i % 2) * 18, 46, 10, '#00000012', 'rx="3"');
  b += tree(1150, 700, 0.9);
  return svg(b, sk.defs + glassDefs);
}

function atico(o = {}) {
  const sk = sky(o.time || 'dorada', { x: 300, y: 220 });
  let b = sk.body;
  b += `<g fill="#00000016">${r(0, 420, 220, 260)}${r(240, 380, 160, 300)}${r(820, 400, 200, 280)}${r(1040, 440, 160, 240)}</g>`;
  b += giralda(640, 560, 1.05, '#7A5A4A44');
  b += r(0, 560, W, 240, '#CBB89A') + r(0, 560, W, 14, C.cal);
  for (let i = 0; i < 26; i++) b += r(i * 48, 600, 44, 200, i % 2 ? '#C3AE8E' : '#BFA888');
  b += r(0, 520, W, 8, '#211C18');
  for (let i = 0; i <= 40; i++) b += r(i * 30, 520, 3, 60, '#211C18');
  // pérgola
  b += r(700, 300, 14, 280, '#6B4E3A') + r(1100, 300, 14, 280, '#6B4E3A') + r(680, 290, 520, 16, '#6B4E3A');
  for (let i = 0; i < 9; i++) b += r(700 + i * 52, 278, 10, 40, '#6B4E3A');
  b += `<path d="M680 306 Q760 360 820 330 Q900 380 980 340 Q1060 370 1200 330" stroke="${C.verdin}" stroke-width="22" fill="none" stroke-linecap="round"/>`;
  b += r(760, 600, 260, 20, C.cal, 'rx="10"') + r(780, 620, 10, 60, '#6B4E3A') + r(990, 620, 10, 60, '#6B4E3A');
  b += `<circle cx="890" cy="560" r="34" fill="${C.lacre}"/><rect x="872" y="590" width="36" height="12" fill="#6B4E3A"/>`;
  b += `<path d="M120 600 h90 l-12 90 h-66z" fill="${C.teja}"/><circle cx="165" cy="560" r="56" fill="${C.verdin}"/><circle cx="140" cy="540" r="8" fill="${C.albero}"/>`;
  return svg(b, sk.defs + glassDefs);
}

function bloque(o = {}) {
  const { brick = '#B5694A', time = 'tarde' } = o;
  const sk = sky(time, { x: 220, y: 170 });
  let b = sk.body + r(0, 300, 260, 340, '#00000014') + r(980, 260, 220, 380, '#00000014');
  b += r(280, 90, 640, 550, brick);
  for (let y = 100; y < 640; y += 14) b += r(280, y, 640, 2, '#00000010');
  for (let row = 0; row < 5; row++) for (let col = 0; col < 4; col++) {
    const x = 330 + col * 150, y = 120 + row * 100;
    b += r(x - 16, y + 62, 122, 12, C.cal) + win(x, y, 90, 62, { shutter: null });
    b += r(x - 16, y + 74, 122, 4, '#211C18');
  }
  b += r(520, 560, 160, 80, '#2C2622') + r(530, 570, 140, 70, 'url(#glassWarm)');
  b += ground('#BDB4A6') + r(0, 690, W, 110, '#A49C90');
  b += tree(160, 690, 1.1) + tree(1070, 690, 1);
  return svg(b, sk.defs + glassDefs);
}

function rocio(o = {}) {
  const sk = sky('manana', { x: 980, y: 150 });
  let b = sk.body + `<path d="M0 520 Q300 470 600 500 T1200 480 V640 H0Z" fill="#9DAA86" opacity=".7"/>`;
  b += r(150, 300, 840, 340, C.cal) + `<path d="M120 310 L570 170 L1020 310Z" fill="${C.teja}"/>` + r(120, 300, 900, 16, '#8E3F28');
  // porche
  b += r(150, 400, 840, 18, '#6B4E3A');
  for (let i = 0; i < 8; i++) b += r(170 + i * 116, 418, 14, 222, '#6B4E3A');
  b += r(150, 396, 840, 8, '#00000022');
  b += win(240, 460, 90, 120, { shutter: C.verdin }) + win(760, 460, 90, 120, { shutter: C.verdin });
  b += `<path d="M500 640 V500 A70 70 0 0 1 640 500 V640Z" fill="${C.verdin}"/>`;
  b += r(0, 640, W, 160, '#E6CFA0') + `<path d="M0 700 Q600 660 1200 720 V800 H0Z" fill="#D9BC86"/>`;
  b += `<g stroke="#6B4E3A" stroke-width="6">${[60, 140, 1080, 1160].map((x) => `<line x1="${x}" y1="640" x2="${x}" y2="560"/>`).join('')}<line x1="40" y1="590" x2="180" y2="590"/><line x1="1060" y1="590" x2="1200" y2="590"/></g>`;
  b += tree(1110, 560, 0.8, '#6F8257');
  return svg(b, sk.defs + glassDefs);
}

function cortijo() {
  const sk = sky('dorada', { x: 220, y: 200 });
  let b = sk.body + `<path d="M0 500 Q400 430 800 470 T1200 450 V640 H0Z" fill="#B8A574"/>`;
  b += r(260, 260, 680, 380, C.cal) + `<path d="M230 270 L600 150 L970 270Z" fill="${C.teja}"/>` + r(230, 262, 740, 14, '#8E3F28');
  b += r(860, 180, 120, 460, C.cal) + `<path d="M846 190 L920 130 L994 190Z" fill="${C.teja}"/>` + win(895, 220, 50, 70, { arch: true });
  b += r(260, 260, 680, 30, C.albero) + r(860, 180, 120, 22, C.albero);
  b += win(330, 330, 80, 110, { reja: true }) + win(760, 330, 80, 110, { reja: true });
  b += `<path d="M520 640 V470 A80 80 0 0 1 680 470 V640Z" fill="#5B3A2A"/>` + r(598, 470, 4, 170, '#00000033');
  b += r(0, 640, W, 160, '#C9B080') + `<path d="M380 800 L560 640 H640 L820 800Z" fill="#DCC594"/>`;
  b += tree(130, 640, 1.1, '#6F8257') + tree(1100, 650, 1, '#6F8257');
  return svg(b, sk.defs + glassDefs);
}

function local() {
  const sk = sky('manana');
  let b = sk.body + r(60, 80, 1080, 560, C.cal) + cornice(60, 70, 1080);
  for (const x of [180, 520, 860]) b += win(x, 130, 120, 140, { balcony: true });
  b += r(60, 330, 1080, 20, C.albero);
  b += r(110, 380, 980, 260, '#211C18') + r(130, 400, 620, 240, 'url(#glassWarm)') + r(780, 400, 290, 240, '#2E2722');
  b += r(130, 400, 620, 240, '#ffffff10');
  b += r(110, 352, 980, 28, C.lacre) + `<text x="600" y="373" font-family="Georgia,serif" font-size="20" fill="${C.paper}" text-anchor="middle" letter-spacing="8">SE VENDE · LOCAL</text>`;
  b += `<g fill="#00000025">${r(200, 560, 120, 80)}${r(380, 520, 80, 120)}${r(520, 580, 180, 60)}</g>`;
  b += ground('#B9A88C');
  return svg(b, sk.defs + glassDefs);
}

function nave() {
  const sk = sky('tarde', { x: 900, y: 180 });
  let b = sk.body + `<path d="M120 640 V330 L600 220 L1080 330 V640Z" fill="#C7C1B5"/>`;
  for (let x = 140; x < 1080; x += 26) b += r(x, 300, 4, 340, '#00000012');
  b += `<path d="M100 334 L600 210 L1100 334" stroke="${C.lacre}" stroke-width="16" fill="none"/>`;
  b += r(420, 400, 360, 240, '#7E7A72');
  for (let y = 410; y < 640; y += 18) b += r(420, y, 360, 4, '#00000020');
  b += r(180, 380, 160, 50, 'url(#glass)') + r(860, 380, 160, 50, 'url(#glass)');
  b += r(0, 640, W, 160, '#9E9A92') + r(0, 700, W, 8, '#E7D27A');
  return svg(b, sk.defs + glassDefs);
}

function salon(o = {}) {
  const { wall = '#EDE4D3', sofa = C.verdin, rug = C.lacre } = o;
  let b = r(0, 0, W, H, wall) + r(0, 600, W, 200, '#B98F62');
  for (let x = 0; x < W; x += 80) b += r(x, 600, 2, 200, '#00000014');
  b += r(700, 90, 300, 400, '#6B4E3A') + r(716, 106, 268, 368, 'url(#glass)') + r(848, 106, 4, 368, '#6B4E3A');
  b += `<path d="M716 106 L984 106 L984 474 L716 474Z" fill="#F6E0B0" opacity=".25"/>`;
  b += `<path d="M700 600 L560 800 H1180 L1000 600Z" fill="#F6E0B0" opacity=".2"/>`;
  b += `<ellipse cx="420" cy="700" rx="330" ry="60" fill="${rug}" opacity=".85"/>`;
  b += r(140, 470, 520, 140, sofa, 'rx="28"') + r(120, 430, 60, 180, sofa, 'rx="26"') + r(620, 430, 60, 180, sofa, 'rx="26"') + r(170, 400, 460, 90, sofa, 'rx="24"');
  b += r(200, 420, 120, 70, C.oro, 'rx="16"') + r(480, 420, 120, 70, C.paper, 'rx="16"');
  b += r(320, 640, 200, 16, '#3A2E25', 'rx="8"') + r(340, 656, 8, 50, '#3A2E25') + r(492, 656, 8, 50, '#3A2E25');
  b += r(180, 150, 200, 150, C.paper) + r(194, 164, 172, 122, C.albero) + `<circle cx="280" cy="225" r="40" fill="${C.lacre}"/>`;
  b += `<path d="M1080 600 h70 l-10 -90 h-50z" fill="${C.teja}"/><circle cx="1115" cy="470" r="70" fill="${C.verdin}"/>`;
  return svg(b, glassDefs);
}

function cocina() {
  let b = r(0, 0, W, H, '#F1EBDF') + r(0, 600, W, 200, '#CDBFA6');
  for (let x = 0; x < W; x += 60) for (let y = 300; y < 460; y += 60) b += r(x + 4, y + 4, 52, 52, (x / 60 + y / 60) % 2 ? '#E3D8C2' : '#F7F2E8');
  b += r(0, 120, 760, 160, '#3F5A4F') + r(0, 460, 760, 160, '#3F5A4F') + r(0, 450, 780, 18, '#E9E2D4');
  for (let x = 40; x < 760; x += 180) b += r(x, 140, 150, 120, '#ffffff10') + r(x, 480, 150, 120, '#ffffff10') + r(x + 66, 240, 18, 6, C.oro) + r(x + 66, 500, 18, 6, C.oro);
  b += r(860, 90, 260, 340, '#6B4E3A') + r(876, 106, 228, 308, 'url(#glass)');
  b += r(880, 470, 300, 30, '#E9E2D4') + r(900, 500, 20, 100, '#211C18') + r(1140, 500, 20, 100, '#211C18');
  b += `<circle cx="300" cy="420" r="18" fill="${C.lacre}"/><circle cx="340" cy="424" r="14" fill="${C.albero}"/>`;
  return svg(b, glassDefs);
}

function oficina() {
  let b = r(0, 0, W, H, '#E8E3D9') + r(0, 620, W, 180, '#8C8478');
  b += r(80, 80, 1040, 400, '#2E2A26') + r(96, 96, 1008, 368, 'url(#glass)');
  for (let x = 96; x < 1104; x += 252) b += r(x, 96, 6, 368, '#2E2A26');
  b += giralda(300, 464, 0.6, '#ffffff22');
  b += r(260, 520, 680, 24, '#5B4636', 'rx="4"') + r(290, 544, 12, 90, '#211C18') + r(900, 544, 12, 90, '#211C18');
  b += r(420, 440, 200, 80, '#211C18', 'rx="6"') + r(430, 450, 180, 62, '#3E5466');
  b += r(700, 470, 150, 50, C.paper) + r(706, 476, 138, 4, C.lacre);
  b += r(980, 500, 90, 140, C.verdin, 'rx="18"');
  return svg(b, glassDefs);
}

function estudio() {
  let b = r(0, 0, W, H, '#F0E7D7') + r(0, 610, W, 190, '#A9825A');
  b += win(760, 120, 220, 330, { arch: true, frame: '#5B4636' });
  b += r(120, 470, 460, 150, C.cal, 'rx="14"') + r(120, 440, 460, 50, '#D6C9B3', 'rx="14"') + r(150, 420, 120, 60, C.oro, 'rx="12"');
  b += r(640, 520, 180, 14, '#3A2E25') + r(660, 534, 8, 76, '#3A2E25') + r(792, 534, 8, 76, '#3A2E25');
  b += `<circle cx="700" cy="500" r="18" fill="${C.lacre}"/>`;
  b += r(180, 140, 320, 200, C.paper) + r(196, 156, 288, 168, '#B7C7C9') + `<path d="M196 324 L300 220 L380 290 L430 250 L484 324Z" fill="${C.verdin}"/>`;
  return svg(b, glassDefs);
}

function patio() {
  const sk = sky('manana', { x: 600, y: 60 });
  let b = sk.body + r(0, 120, W, 520, C.cal);
  for (const x of [80, 400, 720, 1040]) b += `<path d="M${x} 640 V340 A80 80 0 0 1 ${x + 160} 340 V640" fill="none" stroke="${C.albero}" stroke-width="22"/>`;
  b += r(0, 110, W, 24, C.albero);
  for (let x = 0; x < W; x += 40) b += r(x, 560, 38, 80, (x / 40) % 2 ? '#2F5E86' : '#E6C35A');
  b += r(0, 640, W, 160, '#C9B79B');
  for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) b += r(i * 100 + (j % 2) * 50, 650 + j * 38, 48, 34, (i + j) % 2 ? '#B9A487' : '#D8C8AE');
  b += `<ellipse cx="600" cy="700" rx="120" ry="30" fill="#7E9BA8"/><rect x="590" y="600" width="20" height="100" fill="${C.cal}"/><circle cx="600" cy="596" r="24" fill="${C.cal}"/>`;
  b += `<path d="M90 640 h70 l-10 -70 h-50z" fill="${C.teja}"/><circle cx="125" cy="540" r="50" fill="${C.verdin}"/><circle cx="110" cy="520" r="8" fill="${C.lacre}"/><path d="M1040 640 h70 l-10 -70 h-50z" fill="${C.teja}"/><circle cx="1075" cy="540" r="50" fill="${C.verdin}"/>`;
  return svg(b, sk.defs + glassDefs);
}

const files = {
  'casco-albero': casco(),
  'casco-almagra': casco({ wall: '#B9573F', door: C.verdin, time: 'dorada' }),
  'casco-cal': casco({ wall: '#EFE6D3', band: C.albero, door: C.lacre, time: 'tarde' }),
  'atico-giralda': atico(),
  'bloque-nervion': bloque(),
  'bloque-lasalle': bloque({ brick: '#C9A27A', time: 'manana' }),
  'casa-rocio': rocio(),
  'cortijo-carmona': cortijo(),
  'local-puerta-carmona': local(),
  'nave-torreblanca': nave(),
  'salon-verde': salon(),
  'salon-oro': salon({ wall: '#EFE8DC', sofa: '#C29A52', rug: '#3F5A4F' }),
  'cocina': cocina(),
  'oficina-arenal': oficina(),
  'estudio-feria': estudio(),
  'patio': patio(),
};
for (const [name, content] of Object.entries(files)) writeFileSync(join(out, `${name}.svg`), content);
console.log(`Generadas ${Object.keys(files).length} imágenes en ${out}`);
