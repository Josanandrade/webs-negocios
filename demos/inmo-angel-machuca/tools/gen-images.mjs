// Genera las imágenes ilustradas de la demo (SVG propios, sin fotos de terceros).
// Uso: node demos/inmo-angel-machuca/tools/gen-images.mjs
// Salida: demo-host/assets/img/*.svg
// Estilo "render de arquitecto": volúmenes de cal, cielo celeste limpio, sombras largas
// de última hora y las dos torres solares de Sanlúcar la Mayor al fondo en el hero.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '../../../demo-host/assets/img');
mkdirSync(out, { recursive: true });

const W = 1200, H = 800;
let uid = 0;
const id = (p) => `${p}${++uid}`;
const svg = (body, defs = '', w = W, h = H) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>\n`;
const lin = (gid, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${gid}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;

// Paleta compartida con la web
const C = {
  cal: '#FBF8F2', cal2: '#F1ECE2', sombra: '#D6CCBC', sombra2: '#C4B8A5',
  tinta: '#1E1813', madera: '#7A5638', madera2: '#5C3F28', teja: '#B9643F', olivo: '#7F8B5E', olivo2: '#5F6C45',
  hoja: '#93A06C', cielo1: '#9EC3E3', cielo2: '#D3E4F1', cielo3: '#F6EEE2', sol: '#F26A2E', vidrio1: '#3E5466', vidrio2: '#8FB0C8',
  agua1: '#5FB3D3', agua2: '#A9DDEB', albero: '#D9BE8C', suelo: '#E8DCC6',
};

function sky(kind = 'dia', opts = {}) {
  const g = id('sky'), s = id('sun');
  const stops = {
    dia: [[0, C.cielo1], [0.62, C.cielo2], [1, C.cielo3]],
    tarde: [[0, '#8FB6DA'], [0.55, '#EBD9C8'], [1, '#F8D7B8']],
    dorada: [[0, '#A8C2DB'], [0.5, '#F4D9BC'], [1, '#F6B98A']],
  }[kind];
  const sx = opts.sunX ?? 960, sy = opts.sunY ?? 150;
  const defs = lin(g, stops) +
    `<radialGradient id="${s}"><stop offset="0" stop-color="#FFF4E0" stop-opacity=".95"/><stop offset=".4" stop-color="#FFE9C9" stop-opacity=".35"/><stop offset="1" stop-color="#FFE9C9" stop-opacity="0"/></radialGradient>`;
  let body = rect(0, 0, W, H, `url(#${g})`) + `<circle cx="${sx}" cy="${sy}" r="260" fill="url(#${s})"/>`;
  if (opts.clouds !== false) {
    body += `<g fill="#fff" opacity=".55"><ellipse cx="220" cy="140" rx="120" ry="16"/><ellipse cx="300" cy="128" rx="70" ry="14"/><ellipse cx="640" cy="90" rx="90" ry="10"/></g>`;
  }
  return { defs, body };
}

function hills(y = 540, tint = 1) {
  return `<path d="M0 ${y} C160 ${y - 30} 320 ${y - 18} 480 ${y - 34} C660 ${y - 52} 820 ${y - 20} 1000 ${y - 30} C1100 ${y - 36} 1160 ${y - 26} 1200 ${y - 28} V${y + 120} H0Z" fill="#BFC6A6" opacity="${0.6 * tint}"/>` +
    `<path d="M0 ${y + 24} C200 ${y + 4} 380 ${y + 22} 600 ${y + 8} C800 ${y - 4} 1000 ${y + 18} 1200 ${y + 6} V${y + 140} H0Z" fill="#A3AE86" opacity="${0.65 * tint}"/>` +
    // hileras de olivar
    Array.from({ length: 34 }, (_, i) => `<ellipse cx="${i * 36 + 10}" cy="${y + 34 + (i % 2) * 6}" rx="12" ry="7" fill="#6F7B50" opacity=".55"/>`).join('');
}

// Las dos torres solares (PS10 / PS20) que se ven desde Sanlúcar la Mayor
function solarTowers(x = 260, base = 520, s = 1) {
  const t = (tx, h) => `<rect x="${tx - 5 * s}" y="${base - h * s}" width="${10 * s}" height="${h * s}" fill="#9AA2A6"/>` +
    `<rect x="${tx - 9 * s}" y="${base - h * s - 14 * s}" width="${18 * s}" height="${18 * s}" rx="${3 * s}" fill="#FFF3D6"/>` +
    `<circle cx="${tx}" cy="${base - h * s - 5 * s}" r="${30 * s}" fill="#FFE7B0" opacity=".35"/>`;
  let mirrors = '';
  for (let i = 0; i < 26; i++) mirrors += `<rect x="${x - 120 * s + i * 10 * s}" y="${base - 4 * s}" width="${7 * s}" height="${3 * s}" fill="#C9D7E2" opacity=".8"/>`;
  return t(x, 115) + t(x + 70 * s, 160) + mirrors;
}

function ground(y = 620, color = C.suelo) {
  return rect(0, y, W, H - y, color) + `<path d="M0 ${y} H${W}" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`;
}

function win(x, y, w, h, o = {}) {
  const g = o.glass ?? 'url(#glass)';
  const frame = o.frame ?? C.tinta;
  let s = rect(x - 5, y - 5, w + 10, h + 10, frame, 'rx="2"') + rect(x, y, w, h, g);
  s += `<path d="M${x + w * 0.15} ${y + h} L${x + w * 0.7} ${y}" stroke="#fff" stroke-opacity=".16" stroke-width="${w * 0.22}"/>`;
  if (o.mullion !== false) s += rect(x + w / 2 - 1.5, y, 3, h, frame);
  if (o.reja) for (let i = 1; i < 5; i++) s += rect(x + (w / 5) * i - 1.5, y - 5, 3, h + 10, '#2A2420');
  if (o.sill !== false) s += rect(x - 10, y + h + 5, w + 20, 7, C.cal2);
  return s;
}

function glassDefs() {
  return lin('glass', [[0, C.vidrio2], [1, C.vidrio1]], 0, 0, 0.4, 1);
}

function olive(x, base, s = 1) {
  return `<path d="M${x} ${base} C${x - 6 * s} ${base - 40 * s} ${x + 10 * s} ${base - 60 * s} ${x} ${base - 90 * s}" stroke="${C.madera2}" stroke-width="${11 * s}" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="${x}" cy="${base - 118 * s}" rx="${78 * s}" ry="${42 * s}" fill="${C.olivo}"/>` +
    `<ellipse cx="${x - 38 * s}" cy="${base - 98 * s}" rx="${42 * s}" ry="${24 * s}" fill="${C.olivo2}"/>` +
    `<ellipse cx="${x + 34 * s}" cy="${base - 138 * s}" rx="${38 * s}" ry="${20 * s}" fill="${C.hoja}"/>`;
}

function cypress(x, base, s = 1) {
  return `<path d="M${x} ${base - 210 * s} C${x + 26 * s} ${base - 140 * s} ${x + 28 * s} ${base - 40 * s} ${x + 8 * s} ${base} H${x - 8 * s} C${x - 28 * s} ${base - 40 * s} ${x - 26 * s} ${base - 140 * s} ${x} ${base - 210 * s}Z" fill="#4E5E3B"/>`;
}

function pot(x, base, c = C.teja) {
  return `<path d="M${x - 20} ${base - 36} H${x + 20} L${x + 15} ${base} H${x - 15}Z" fill="${c}"/>` +
    `<circle cx="${x}" cy="${base - 52}" r="24" fill="${C.olivo2}"/><circle cx="${x - 9}" cy="${base - 58}" r="5" fill="#E2574C"/><circle cx="${x + 8}" cy="${base - 46}" r="5" fill="#F29BA0"/>`;
}

function shadowBand(x, y, w, h, a = 0.16) {
  return `<path d="M${x} ${y} h${w} l${h * 0.9} ${h} h-${w}z" fill="#3C2E20" opacity="${a}"/>`;
}


// ---------- EXTERIORES ----------

function hero() {
  const { defs, body } = sky('dorada', { sunX: 1010, sunY: 210 });
  const wall = id('w'), wallS = id('ws'), pool = id('p');
  let d = defs + glassDefs() +
    lin(wall, [[0, '#FFFCF6'], [1, '#F3EADB']]) + lin(wallS, [[0, '#E9DDCB'], [1, '#D8C9B2']]) +
    lin(pool, [[0, C.agua2], [1, C.agua1]], 0, 0, 1, 1);
  let b = body + hills(520) + solarTowers(250, 512, 0.9) + ground(612, '#EFE3CD');
  // volumen principal de la casa: dos cuerpos blancos con porche de madera
  b += rect(300, 330, 520, 282, `url(#${wall})`);
  b += rect(820, 400, 300, 212, `url(#${wallS})`);
  b += rect(290, 318, 540, 16, C.cal2) + rect(812, 390, 316, 14, '#E2D5C1');
  // arco andaluz de entrada
  b += `<path d="M420 612 V470 a62 62 0 0 1 124 0 V612Z" fill="${C.tinta}" opacity=".9"/>`;
  b += `<path d="M436 612 V474 a46 46 0 0 1 92 0 V612Z" fill="${C.madera}"/>`;
  b += rect(476, 520, 4, 40, '#E9C27A');
  b += win(600, 400, 170, 150);
  b += win(350, 380, 48, 90, { mullion: false, reja: true });
  b += win(870, 450, 200, 110);
  // pérgola
  b += rect(820, 380, 300, 10, C.madera2);
  for (let i = 0; i < 9; i++) b += rect(830 + i * 34, 390, 8, 12, C.madera2);
  b += rect(1100, 390, 10, 222, C.madera2);
  // sombras largas de atardecer
  b += `<path d="M300 612 L120 700 H560 L820 612Z" fill="#6B5541" opacity=".12"/>`;
  // piscina
  b += `<path d="M560 660 H1060 L1120 740 H500Z" fill="url(#${pool})"/>`;
  b += `<path d="M560 660 H1060 L1120 740 H500Z" fill="none" stroke="#fff" stroke-width="6"/>`;
  b += `<path d="M590 690 q30 -8 60 0 t60 0 t60 0 M760 712 q30 -8 60 0 t60 0" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none"/>`;
  b += olive(170, 640, 1.25) + cypress(1160, 612, 1) + pot(380, 612) + pot(580, 612, '#C98A5B');
  b += rect(0, 760, W, 40, '#E2D3B8');
  return svg(b, d);
}

function casaPueblo(kind = 'dia', color = C.cal) {
  const { defs, body } = sky(kind);
  let b = body + hills(560, 0.6) + ground(640);
  // fachada de casa de pueblo de dos plantas con zócalo
  b += rect(160, 250, 880, 390, color);
  b += rect(160, 580, 880, 60, C.albero);
  b += rect(150, 238, 900, 18, C.cal2);
  b += `<path d="M150 238 L600 190 L1050 238Z" fill="${C.teja}" opacity=".9"/>`;
  // puerta con cancela
  b += rect(540, 430, 120, 210, C.madera2) + rect(552, 442, 96, 198, C.madera);
  b += `<path d="M540 430 a60 40 0 0 1 120 0" fill="${C.cal2}"/>`;
  b += win(250, 310, 120, 140, { reja: true }) + win(830, 310, 120, 140, { reja: true });
  b += win(250, 490, 120, 70, { reja: true }) + win(830, 490, 120, 70, { reja: true });
  // balcón central
  b += rect(520, 300, 160, 100, 'url(#glass)') + rect(505, 395, 190, 8, C.tinta);
  for (let i = 0; i < 10; i++) b += rect(510 + i * 19, 360, 3, 36, C.tinta);
  b += pot(220, 640) + pot(980, 640, '#C98A5B');
  b += shadowBand(160, 640, 880, 50, 0.1);
  return svg(b, defs + glassDefs());
}

function chalet(kind = 'tarde') {
  const { defs, body } = sky(kind, { sunX: 220, sunY: 170 });
  const pool = id('p');
  let b = body + hills(520) + ground(600, '#ECE1CA');
  b += rect(220, 300, 420, 300, C.cal) + rect(640, 360, 380, 240, C.cal2);
  b += rect(210, 288, 440, 16, '#EDE5D7') + rect(630, 348, 400, 14, '#E1D5C2');
  b += rect(260, 380, 150, 220, C.madera) + win(450, 360, 150, 160);
  b += win(680, 420, 300, 120, { mullion: true });
  b += `<rect x="640" y="360" width="20" height="240" fill="#C9BBA3" opacity=".5"/>`;
  b += `<path d="M160 650 H900 L960 740 H120Z" fill="url(#${pool})" stroke="#fff" stroke-width="6"/>`;
  b += `<path d="M220 680 q30 -8 60 0 t60 0 t60 0 M520 708 q30 -8 60 0 t60 0" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>`;
  b += olive(1080, 640, 1.1) + cypress(120, 600, 0.9);
  // tumbonas
  b += `<path d="M1000 690 h110 l20 -24" stroke="${C.tinta}" stroke-width="6" fill="none"/>`;
  return svg(b, defs + glassDefs() + lin(pool, [[0, C.agua2], [1, C.agua1]], 0, 0, 1, 1));
}

function bloquePisos(kind = 'dia', tone = '#F4EDE1', accent = C.teja) {
  const { defs, body } = sky(kind);
  let b = body + ground(660, '#E6DCCB');
  b += rect(240, 150, 720, 510, tone);
  b += rect(230, 138, 740, 18, C.cal2);
  for (let f = 0; f < 4; f++) {
    for (let c = 0; c < 4; c++) {
      const x = 290 + c * 170, y = 190 + f * 112;
      b += win(x, y, 110, 70, { sill: false });
      b += rect(x - 14, y + 74, 138, 8, C.tinta);
      for (let i = 0; i < 7; i++) b += rect(x - 10 + i * 20, y + 52, 3, 24, C.tinta);
    }
  }
  b += rect(240, 600, 720, 60, accent) + rect(560, 590, 80, 70, C.tinta);
  b += olive(150, 660, 0.9) + olive(1060, 660, 0.8);
  return svg(b, defs + glassDefs());
}

function adosados(kind = 'dia') {
  const { defs, body } = sky(kind);
  let b = body + hills(540, 0.7) + ground(630);
  const cols = ['#FBF8F2', '#F4EBDD', '#FBF8F2'];
  for (let i = 0; i < 3; i++) {
    const x = 120 + i * 330;
    b += rect(x, 300, 320, 330, cols[i]);
    b += `<path d="M${x - 10} 300 L${x + 160} 230 L${x + 330} 300Z" fill="${C.teja}"/>`;
    b += win(x + 40, 350, 100, 100) + win(x + 190, 350, 90, 100);
    b += rect(x + 40, 490, 80, 140, C.madera) + win(x + 160, 500, 120, 80);
    b += rect(x, 600, 320, 30, C.albero);
    b += i < 2 ? rect(x + 318, 300, 6, 330, C.sombra) : '';
  }
  b += pot(160, 630) + pot(820, 630, '#C98A5B');
  return svg(b, defs + glassDefs());
}

function atico(kind = 'tarde') {
  const { defs, body } = sky(kind, { sunX: 300, sunY: 200 });
  let b = body;
  // terraza en primer plano mirando a tejados
  b += `<g fill="#E9DCC8">${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 140}" y="${470 + (i % 3) * 18}" width="130" height="200"/>`).join('')}</g>`;
  b += `<g fill="${C.teja}" opacity=".85">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 140} ${470 + (i % 3) * 18} l65 -30 l65 30z"/>`).join('')}</g>`;
  // torre campanario genérica
  b += rect(860, 300, 70, 220, '#F1E3C7') + `<path d="M850 300 L895 230 L940 300Z" fill="${C.teja}"/>` + `<path d="M880 340 a15 15 0 0 1 30 0 v40 h-30z" fill="${C.tinta}"/>`;
  b += rect(0, 600, W, 200, '#D7C6AB');
  b += rect(0, 590, W, 14, C.cal);
  for (let i = 0; i < 30; i++) b += rect(20 + i * 40, 520, 4, 70, C.tinta);
  b += rect(0, 516, W, 6, C.tinta);
  // mesa y sillas
  b += `<ellipse cx="420" cy="700" rx="110" ry="22" fill="#fff"/><rect x="414" y="700" width="12" height="80" fill="${C.tinta}"/>`;
  b += `<path d="M260 760 v-90 h60 v40 h-60" stroke="${C.madera}" stroke-width="8" fill="none"/><path d="M580 760 v-90 h-60 v40 h60" stroke="${C.madera}" stroke-width="8" fill="none"/>`;
  b += pot(980, 690) + pot(1060, 690, '#C98A5B');
  return svg(b, defs);
}

function terreno() {
  const { defs, body } = sky('dorada', { sunX: 900, sunY: 260 });
  let b = body;
  b += `<path d="M0 470 C200 440 420 460 640 440 C860 420 1040 450 1200 440 V800 H0Z" fill="#C6C79F"/>`;
  b += `<path d="M0 540 C260 520 500 545 760 525 C960 510 1100 530 1200 525 V800 H0Z" fill="#D9C79C"/>`;
  for (let r = 0; r < 5; r++) {
    for (let i = 0; i < 8 + r; i++) {
      const s = 0.45 + r * 0.22;
      const x = (i * (1300 / (8 + r))) - 40 + (r % 2) * 60;
      b += olive(x, 520 + r * 62, s);
    }
  }
  // camino de albero
  b += `<path d="M560 800 C600 700 640 620 700 540 L720 540 C680 620 660 700 680 800Z" fill="#EAD6A8"/>`;
  // estacas de linde
  for (let i = 0; i < 6; i++) b += rect(80 + i * 200, 700 - i * 8, 6, 50, C.madera2);
  return svg(b, defs);
}

function local() {
  const { defs, body } = sky('dia');
  let b = body + ground(660, '#DDD3C3');
  b += rect(140, 220, 920, 440, '#F7F2EA');
  b += rect(140, 220, 920, 70, C.tinta);
  b += `<text x="600" y="267" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="30" letter-spacing="8" fill="#F7F2EA" opacity=".85">DISPONIBLE</text>`;
  b += win(190, 330, 360, 280, { sill: false, mullion: true });
  b += win(650, 330, 360, 280, { sill: false, mullion: true });
  b += rect(560, 330, 80, 330, C.madera2);
  b += rect(140, 640, 920, 20, '#BFB29D');
  b += pot(110, 660) + pot(1090, 660, '#C98A5B');
  return svg(b, defs + glassDefs());
}

// ---------- INTERIORES ----------

function room(wallColor = '#F5EFE5', floor = '#D9C3A0') {
  const w = id('wl'), f = id('fl'), l = id('lt');
  const defs = lin(w, [[0, wallColor], [1, '#EBE2D3']]) + lin(f, [[0, floor], [1, '#B99C74']]) +
    `<radialGradient id="${l}" cx=".8" cy=".2" r=".9"><stop offset="0" stop-color="#FFF6E2" stop-opacity=".7"/><stop offset="1" stop-color="#FFF6E2" stop-opacity="0"/></radialGradient>`;
  const body = rect(0, 0, W, 560, `url(#${w})`) + rect(0, 560, W, 240, `url(#${f})`) +
    Array.from({ length: 12 }, (_, i) => `<path d="M${i * 110 - 200} 800 L${i * 110 + 40} 560" stroke="#A88B64" stroke-opacity=".35" stroke-width="2"/>`).join('') +
    rect(0, 552, W, 10, '#E6DBC9') + rect(0, 0, W, 800, `url(#${l})`);
  return { defs, body };
}

function bigWindow(x, y, w, h) {
  const g = id('vw');
  const d = lin(g, [[0, C.cielo1], [0.7, C.cielo2], [1, '#E8E2C9']]);
  let s = rect(x - 10, y - 10, w + 20, h + 20, C.tinta) + rect(x, y, w, h, `url(#${g})`);
  s += `<path d="M${x} ${y + h * 0.78} C${x + w * 0.3} ${y + h * 0.7} ${x + w * 0.6} ${y + h * 0.76} ${x + w} ${y + h * 0.7} V${y + h} H${x}Z" fill="#A3AE86"/>`;
  s += rect(x + w / 2 - 3, y, 6, h, C.tinta);
  // haz de luz en el suelo
  s += `<path d="M${x} ${y + h + 10} L${x - 160} 800 H${x + w - 120} L${x + w} ${y + h + 10}Z" fill="#FFF3D9" opacity=".35"/>`;
  return { s, d };
}

function salon(variant = 0) {
  const { defs, body } = room(variant ? '#F2ECE2' : '#F6F0E6', variant ? '#CDB48D' : '#DCC6A2');
  const win1 = bigWindow(variant ? 120 : 640, 120, 420, 400);
  let b = body + win1.s;
  const sx = variant ? 620 : 120;
  // sofá
  b += rect(sx, 470, 460, 110, variant ? '#5F6C45' : '#C9B79B', 'rx="18"') + rect(sx + 20, 420, 420, 80, variant ? '#6E7B52' : '#D8C8AE', 'rx="18"');
  b += rect(sx + 40, 440, 90, 60, variant ? C.sol : '#7A5638', 'rx="10" opacity=".9"');
  b += rect(sx + 20, 580, 12, 30, C.tinta) + rect(sx + 428, 580, 12, 30, C.tinta);
  // alfombra y mesa
  b += `<ellipse cx="${sx + 230}" cy="690" rx="300" ry="60" fill="#EFE5D3"/>`;
  b += `<ellipse cx="${sx + 230}" cy="650" rx="120" ry="24" fill="${C.madera}"/><rect x="${sx + 222}" y="650" width="16" height="50" fill="${C.madera2}"/>`;
  // lámpara + cuadro
  b += `<path d="M${variant ? 1110 : 60} 560 V300" stroke="${C.tinta}" stroke-width="4"/><path d="M${variant ? 1080 : 30} 300 h60 l-12 -50 h-36z" fill="#F4E3C1"/>`;
  b += rect(sx + 140, 220, 180, 130, '#fff') + rect(sx + 152, 232, 156, 106, variant ? '#E9C9A8' : '#B9C9D6');
  b += `<circle cx="${sx + 270}" cy="270" r="22" fill="${C.sol}" opacity=".8"/>`;
  b += pot(variant ? 560 : 1120, 600);
  return svg(b, defs + win1.d);
}

function cocina(variant = 0) {
  const { defs, body } = room('#F7F3EC', '#D2C2A8');
  const win1 = bigWindow(470, 110, 260, 220);
  let b = body + win1.s;
  const front = variant ? '#5F6C45' : '#F3EEE6', top = variant ? '#F3EEE6' : '#3A322B';
  // muebles altos
  b += rect(80, 90, 340, 200, front, 'rx="4"') + rect(780, 90, 340, 200, front, 'rx="4"');
  for (let i = 1; i < 3; i++) { b += rect(80 + i * 113, 90, 2, 200, '#00000022'); b += rect(780 + i * 113, 90, 2, 200, '#00000022'); }
  // encimera y bajos
  b += rect(60, 400, 1080, 26, top) + rect(60, 426, 1080, 170, front);
  for (let i = 1; i < 8; i++) b += rect(60 + i * 135, 426, 2, 170, '#00000022');
  for (let i = 0; i < 8; i++) b += rect(110 + i * 135, 440, 36, 4, '#8E8478');
  // azulejo
  for (let r = 0; r < 4; r++) for (let c = 0; c < 18; c++) b += rect(60 + c * 60, 300 + r * 25, 58, 23, r % 2 ? '#EDE6DA' : '#F4EFE6');
  // isla
  b += rect(320, 560, 560, 30, top) + rect(340, 590, 520, 150, variant ? '#E9E1D3' : C.madera);
  b += rect(400, 520, 18, 40, C.tinta) + `<circle cx="409" cy="512" r="12" fill="${C.sol}"/>`;
  b += `<path d="M600 0 V140" stroke="${C.tinta}" stroke-width="3"/><path d="M570 140 h60 l-10 30 h-40z" fill="${C.tinta}"/>`;
  return svg(b, defs + win1.d);
}

function dormitorio(variant = 0) {
  const { defs, body } = room(variant ? '#EEF1F0' : '#F5EFE6', '#D8C3A3');
  const win1 = bigWindow(variant ? 860 : 80, 140, 240, 330);
  let b = body + win1.s;
  const x = variant ? 200 : 420;
  b += rect(x, 280, 520, 180, C.madera, 'rx="10"');
  b += rect(x - 20, 440, 560, 170, '#FFFFFF', 'rx="14"');
  b += rect(x - 20, 520, 560, 90, variant ? '#9EC3E3' : '#E6CFB2', 'rx="10"');
  b += rect(x + 40, 400, 180, 70, '#F2ECE2', 'rx="20"') + rect(x + 300, 400, 180, 70, '#F2ECE2', 'rx="20"');
  b += rect(x - 120, 470, 80, 90, C.madera2) + `<path d="M${x - 80} 470 v-60" stroke="${C.tinta}" stroke-width="3"/><circle cx="${x - 80}" cy="400" r="22" fill="#F4E3C1"/>`;
  b += pot(variant ? 120 : 1100, 640);
  return svg(b, defs + win1.d);
}

function bano() {
  const { defs, body } = room('#F2EEE7', '#CFC5B6');
  let b = body;
  for (let r = 0; r < 12; r++) for (let c = 0; c < 20; c++) b += rect(c * 60, 80 + r * 40, 58, 38, r % 2 ? '#E9EEF0' : '#F1F4F5');
  b += rect(160, 120, 300, 260, '#CFE0EA', 'rx="150"') + rect(170, 130, 280, 240, '#E7F0F5', 'rx="140"');
  b += rect(120, 400, 380, 30, '#F7F4EE') + rect(140, 430, 340, 140, C.madera, 'rx="4"');
  b += `<ellipse cx="310" cy="400" rx="90" ry="14" fill="#fff"/><path d="M310 340 v40" stroke="${C.tinta}" stroke-width="6"/>`;
  // ducha de obra
  b += rect(640, 120, 6, 440, '#B9C7CF') + rect(640, 120, 460, 440, '#DCE8EE', 'opacity=".45"');
  b += `<path d="M960 140 v60 h-60" stroke="${C.tinta}" stroke-width="6" fill="none"/><circle cx="900" cy="210" r="22" fill="${C.tinta}"/>`;
  b += pot(560, 600, '#C98A5B');
  return svg(b, defs);
}

function patio() {
  const { defs, body } = sky('dia', { clouds: false });
  let b = body;
  b += rect(0, 0, 160, 800, C.cal) + rect(1040, 0, 160, 800, C.cal2);
  b += rect(0, 560, W, 240, '#E2D4BC');
  for (let r = 0; r < 6; r++) for (let c = 0; c < 14; c++) b += `<path d="M${c * 90 + (r % 2) * 45} ${570 + r * 40} l45 -18 l45 18 l-45 18z" fill="${(r + c) % 2 ? '#C9B08A' : '#EFE3CD'}"/>`;
  // arcos de patio
  for (let i = 0; i < 3; i++) {
    const x = 220 + i * 270;
    b += rect(x - 30, 160, 30, 400, '#F6F1E8');
    b += `<path d="M${x} 560 V320 a110 110 0 0 1 220 0 V560" fill="none" stroke="#F6F1E8" stroke-width="30"/>`;
  }
  b += rect(190, 140, 860, 40, '#F6F1E8');
  b += `<circle cx="600" cy="640" r="70" fill="#F1E8DA"/><circle cx="600" cy="640" r="50" fill="${C.agua1}"/>`;
  b += pot(220, 600) + pot(980, 600, '#C98A5B') + pot(420, 580) + pot(780, 580);
  // buganvilla
  b += `<g fill="#C8437A">${Array.from({ length: 40 }, (_, i) => `<circle cx="${30 + (i * 37) % 130}" cy="${60 + i * 9}" r="${8 + (i % 3) * 3}" opacity=".8"/>`).join('')}</g>`;
  return svg(b, defs);
}

function terraza() {
  const { defs, body } = sky('tarde', { sunX: 980, sunY: 260 });
  let b = body + hills(500) + solarTowers(330, 490, 0.6);
  b += rect(0, 590, W, 210, '#CFC1A9');
  for (let i = 0; i < 16; i++) b += `<path d="M${i * 90} 800 L${i * 90 + 140} 590" stroke="#B9A88C" stroke-width="2"/>`;
  b += rect(0, 540, W, 50, 'url(#glass)', 'opacity=".35"') + rect(0, 534, W, 8, C.tinta);
  b += `<path d="M200 720 h300 l-20 -80 h-260z" fill="#F4ECDF"/><rect x="230" y="700" width="240" height="20" fill="${C.madera}"/>`;
  b += rect(620, 680, 200, 14, C.madera) + rect(630, 694, 8, 60, C.tinta) + rect(800, 694, 8, 60, C.tinta);
  b += pot(1000, 700) + pot(1090, 700, '#C98A5B');
  return svg(b, defs + glassDefs());
}

// ---------- SALIDA ----------
const files = {
  'hero.svg': hero(),
  'casa-pueblo.svg': casaPueblo('dia'),
  'casa-pueblo-b.svg': casaPueblo('tarde', '#F7EEDC'),
  'chalet.svg': chalet('tarde'),
  'chalet-b.svg': chalet('dia'),
  'pisos.svg': bloquePisos('dia'),
  'pisos-b.svg': bloquePisos('tarde', '#F1E6D4', C.olivo2),
  'adosados.svg': adosados('dia'),
  'atico.svg': atico('tarde'),
  'terreno.svg': terreno(),
  'local.svg': local(),
  'salon.svg': salon(0),
  'salon-b.svg': salon(1),
  'cocina.svg': cocina(0),
  'cocina-b.svg': cocina(1),
  'dormitorio.svg': dormitorio(0),
  'dormitorio-b.svg': dormitorio(1),
  'bano.svg': bano(),
  'patio.svg': patio(),
  'terraza.svg': terraza(),
};
for (const [name, content] of Object.entries(files)) writeFileSync(join(out, name), content);
console.log(`Generadas ${Object.keys(files).length} imágenes en ${out}`);
