// Genera las "fotografías" ilustradas de la demo (SVG propios, sin fotos de terceros).
// Uso: node demos/julio-puig-real-state/tools/gen-images.mjs
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
const lin = (gid, stops, x2 = 0, y2 = 1) => `<linearGradient id="${gid}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
const r = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;

const SKIES = {
  dia: ['#A9CADB', '#DCE8EC', '#F4EEE3'],
  tarde: ['#C8D6DE', '#F1DCC4', '#F6E7D2'],
  dorada: ['#E9C9A0', '#F3DEC2', '#F8EDDE'],
  azul: ['#7FAECB', '#C5DCE6', '#EEF2EE'],
};

function sky(kind, sun = { x: 930, y: 170 }) {
  const g = id('sky'), s = id('sun');
  const c = SKIES[kind];
  const defs = lin(g, [[0, c[0]], [0.6, c[1]], [1, c[2]]]) +
    `<radialGradient id="${s}"><stop offset="0" stop-color="#FFF8EA" stop-opacity=".95"/><stop offset="1" stop-color="#FFF8EA" stop-opacity="0"/></radialGradient>`;
  const body = r(0, 0, W, H, `url(#${g})`) +
    `<circle cx="${sun.x}" cy="${sun.y}" r="210" fill="url(#${s})"/><circle cx="${sun.x}" cy="${sun.y}" r="46" fill="#FFF6E3" opacity=".9"/>` +
    `<path d="M0 560 C180 520 300 540 460 525 C640 508 760 540 940 520 C1060 508 1140 520 1200 515 V640 H0Z" fill="#C9CFC0" opacity=".55"/>` +
    `<path d="M0 590 C220 565 420 585 620 570 C820 556 1000 580 1200 566 V640 H0Z" fill="#AEB8A4" opacity=".55"/>`;
  return { defs, body };
}

function ground(color = '#D9CDB6', path = '#C9BB9F') {
  return r(0, 620, W, 180, color) + `<path d="M0 700 H1200 V800 H0Z" fill="${path}" opacity=".6"/>`;
}

function win(x, y, w, h, opts = {}) {
  const { frame = '#2E3A3A', glass = 'url(#glass)', reja = false, shutter = null, sill = '#E9E2D4' } = opts;
  let s = r(x - 6, y - 6, w + 12, h + 12, frame, 'rx="2"') + r(x, y, w, h, glass);
  s += `<path d="M${x} ${y + h} L${x + w * 0.55} ${y}" stroke="#fff" stroke-opacity=".18" stroke-width="${w * 0.25}"/>`;
  s += r(x + w / 2 - 2, y, 4, h, frame);
  if (shutter) s += r(x - 6 - w * 0.42, y - 6, w * 0.42, h + 12, shutter) + r(x + w + 6, y - 6, w * 0.42, h + 12, shutter);
  if (reja) for (let i = 1; i < 5; i++) s += r(x + (w / 5) * i - 1.5, y - 6, 3, h + 12, '#262626');
  s += r(x - 12, y + h + 6, w + 24, 8, sill);
  return s;
}

function palm(x, base, h = 230) {
  let s = `<path d="M${x} ${base} C${x + 8} ${base - h * 0.5} ${x - 6} ${base - h * 0.8} ${x + 10} ${base - h}" stroke="#7B6A52" stroke-width="12" fill="none" stroke-linecap="round"/>`;
  const tx = x + 10, ty = base - h;
  const leaves = [[-150, 30], [-110, -40], [-60, -70], [0, -80], [60, -66], [120, -30], [150, 36], [-30, 50], [40, 46]];
  for (const [dx, dy] of leaves) s += `<path d="M${tx} ${ty} Q${tx + dx * 0.5} ${ty + dy - 30} ${tx + dx} ${ty + dy}" stroke="#4E6B5C" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  return s;
}

function tree(x, base, s = 1, color = '#62806E') {
  return `<rect x="${x - 7 * s}" y="${base - 80 * s}" width="${14 * s}" height="${80 * s}" fill="#6E5C46"/>` +
    `<ellipse cx="${x}" cy="${base - 130 * s}" rx="${78 * s}" ry="${70 * s}" fill="${color}"/>` +
    `<ellipse cx="${x - 30 * s}" cy="${base - 110 * s}" rx="${46 * s}" ry="${40 * s}" fill="${color}" opacity=".85"/>` +
    `<ellipse cx="${x + 26 * s}" cy="${base - 160 * s}" rx="${40 * s}" ry="${34 * s}" fill="#fff" opacity=".12"/>`;
}

function olive(x, base, s = 1) {
  return `<path d="M${x} ${base} C${x - 6 * s} ${base - 40 * s} ${x + 10 * s} ${base - 60 * s} ${x} ${base - 90 * s}" stroke="#6B5B47" stroke-width="${12 * s}" fill="none"/>` +
    `<ellipse cx="${x}" cy="${base - 120 * s}" rx="${80 * s}" ry="${44 * s}" fill="#8A9A78"/>` +
    `<ellipse cx="${x - 40 * s}" cy="${base - 100 * s}" rx="${44 * s}" ry="${26 * s}" fill="#7C8C6B"/>` +
    `<ellipse cx="${x + 36 * s}" cy="${base - 140 * s}" rx="${40 * s}" ry="${22 * s}" fill="#A0AE8E"/>`;
}

function pot(x, base, c = '#B4593A') {
  return `<path d="M${x - 22} ${base - 40} H${x + 22} L${x + 16} ${base} H${x - 16}Z" fill="${c}"/>` +
    `<circle cx="${x}" cy="${base - 58}" r="26" fill="#5E7D63"/><circle cx="${x - 10}" cy="${base - 64}" r="5" fill="#D6455E"/><circle cx="${x + 9}" cy="${base - 52}" r="5" fill="#E7A0B0"/>`;
}

const glassDef = (c1 = '#3E5A66', c2 = '#9DB7BF') => lin('glass', [[0, c1], [1, c2]], 1, 1);
const shade = (gid) => lin(gid, [[0, '#000', 0], [1, '#000', 0.12]]);

// ---------- Fachadas ----------
function villa({ skyKind = 'dia', wall = '#F5F2EC', wood = '#9C7653' } = {}) {
  const sk = sky(skyKind, { x: 260, y: 160 });
  const p = id('pool');
  const defs = sk.defs + glassDef('#2F4750', '#A5C0C6') + lin(p, [[0, '#7FC6CF'], [1, '#3F9AAA']]);
  let b = sk.body + ground('#B9C4A2', '#A4B08C');
  b += palm(170, 640, 300) + tree(1070, 625, 0.9);
  // volumen inferior
  b += r(250, 360, 640, 262, wall) + r(250, 360, 640, 14, '#DCD5C7');
  b += r(890, 360, 26, 262, '#DED7C9');
  // volumen superior volado
  b += r(460, 220, 480, 150, wall) + r(460, 220, 480, 14, '#DCD5C7') + r(460, 370, 480, 10, '#CFC7B7', 'opacity=".7"');
  b += r(470, 250, 210, 100, 'url(#glass)') + r(700, 250, 220, 100, wood);
  for (let i = 0; i < 11; i++) b += r(708 + i * 20, 250, 6, 100, '#7E5E40');
  // ventanales planta baja
  b += r(290, 410, 330, 200, '#2B3A3E') + r(300, 420, 310, 190, 'url(#glass)');
  b += `<path d="M300 610 L420 420" stroke="#fff" stroke-opacity=".2" stroke-width="60"/>`;
  b += r(452, 420, 4, 190, '#2B3A3E');
  b += r(660, 430, 120, 180, '#3B3026') + r(760, 515, 6, 20, '#D9C6A0');
  b += r(800, 430, 70, 110, 'url(#glass)');
  // piscina
  b += `<path d="M330 660 H960 L1010 740 H270Z" fill="url(#${p})"/><path d="M330 660 H960 L970 676 H322Z" fill="#E9F4F2" opacity=".55"/>`;
  b += `<path d="M380 700 Q440 690 500 700 T620 700" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none"/>`;
  b += r(240, 640, 760, 20, '#E7E0D3');
  // tumbonas
  b += `<path d="M1010 660 l60 0 l18 -26" stroke="#F5F2EC" stroke-width="10" fill="none"/>`;
  return svg(b, defs);
}

function townhouses({ skyKind = 'tarde', walls = ['#F6F1E7', '#F2E9D8', '#F6F1E7'], trim = '#D9A441', garage = 1 } = {}) {
  const sk = sky(skyKind, { x: 980, y: 150 });
  const defs = sk.defs + glassDef();
  let b = sk.body + ground('#D8CCB5', '#C4B596');
  b += tree(90, 640, 1.1);
  const x0 = 170, uw = 290;
  walls.forEach((wall, i) => {
    const x = x0 + i * uw;
    b += r(x, 300, uw, 322, wall);
    b += `<path d="M${x - 10} 300 L${x + uw / 2} 220 L${x + uw + 10} 300Z" fill="#B4593A"/>`;
    for (let k = 0; k < 9; k++) b += `<path d="M${x - 6 + k * 34} 300 L${x + uw / 2} 224" stroke="#9B4A2F" stroke-width="2" opacity=".5"/>`;
    b += r(x - 12, 296, uw + 24, 12, '#8F4329');
    b += r(x, 600, uw, 22, trim);
    b += r(x + uw - 4, 300, 4, 322, '#E3DACB');
    b += win(x + 40, 340, 80, 100, { shutter: '#5F7F6E' }) + win(x + 170, 340, 80, 100, { shutter: '#5F7F6E' });
    b += r(x + 150, 450, 120, 6, '#2A2A2A');
    for (let k = 0; k < 9; k++) b += r(x + 152 + k * 14, 412, 3, 40, '#2A2A2A');
    if (i === garage) {
      b += r(x + 30, 480, 150, 122, '#CFC6B6');
      for (let k = 0; k < 7; k++) b += r(x + 30, 488 + k * 16, 150, 3, '#B6AC9A');
      b += r(x + 200, 480, 64, 122, '#5A4130');
    } else {
      b += r(x + 40, 480, 64, 122, '#5A4130') + `<circle cx="${x + 94}" cy="545" r="4" fill="#D9C6A0"/>`;
      b += win(x + 160, 490, 90, 80, { reja: true });
    }
    b += pot(x + 22, 620);
  });
  b += r(0, 622, W, 6, '#BCAD90');
  return svg(b, defs);
}

function apartment({ skyKind = 'azul', wall = '#EFE6D6', accent = '#C98C5A', floors = 5 } = {}) {
  const sk = sky(skyKind, { x: 220, y: 140 });
  const defs = sk.defs + glassDef('#33494F', '#AFC5C9');
  let b = sk.body + ground('#CFC8BB', '#B9B0A0');
  // edificio vecino
  b += r(40, 260, 230, 362, '#E3D9C8') + r(930, 300, 260, 322, '#E8E0D2');
  for (let f = 0; f < 5; f++) for (let c = 0; c < 2; c++) b += r(80 + c * 100, 290 + f * 62, 50, 36, '#9FB3B6', 'opacity=".8"');
  for (let f = 0; f < 4; f++) for (let c = 0; c < 3; c++) b += r(960 + c * 80, 330 + f * 68, 44, 38, '#9FB3B6', 'opacity=".8"');
  const top = 622 - floors * 92 - 70;
  b += r(300, top, 600, 622 - top, wall);
  b += r(290, top - 14, 620, 16, '#D6CAB6');
  for (let f = 0; f < floors; f++) {
    const y = top + 40 + f * 92;
    for (let c = 0; c < 3; c++) {
      const x = 340 + c * 190;
      b += win(x, y, 110, 58, { frame: '#3C3A36' });
      b += r(x - 16, y + 66, 142, 8, accent);
      b += `<path d="M${x - 14} ${y + 38} H${x + 124}" stroke="#2C2C2C" stroke-width="3"/>`;
      for (let k = 0; k < 10; k++) b += r(x - 12 + k * 14, y + 38, 2, 30, '#2C2C2C');
      if ((f + c) % 3 === 0) b += pot(x + 120, y + 66, '#9E5A3A');
    }
  }
  // planta baja
  b += r(300, 552, 600, 70, '#D9CDB8') + r(520, 560, 160, 62, '#3A3027') + r(330, 566, 150, 46, 'url(#glass)') + r(720, 566, 150, 46, 'url(#glass)');
  b += tree(230, 690, 1.15, '#5D7A66') + tree(1000, 700, 1.0);
  return svg(b, defs);
}

function village({ skyKind = 'dorada', wall = '#FBF8F2', trim = '#D9A441', door = '#6B4429' } = {}) {
  const sk = sky(skyKind, { x: 940, y: 140 });
  const defs = sk.defs + glassDef('#2B3B3F', '#8DA5A8');
  let b = sk.body + ground('#E2D5BD', '#CDBD9F');
  b += r(140, 280, 920, 342, wall);
  b += r(130, 268, 940, 18, '#E7DFD0');
  for (let k = 0; k < 24; k++) b += `<path d="M${136 + k * 39} 268 q19 -18 39 0" fill="#B85E3B" stroke="#934529" stroke-width="2"/>`;
  b += r(140, 560, 920, 62, trim);
  b += win(220, 330, 110, 140, { reja: true, frame: '#3B2E25' }) + win(870, 330, 110, 140, { reja: true, frame: '#3B2E25' });
  b += r(480, 330, 240, 18, '#E7DFD0');
  b += `<path d="M500 622 V420 Q600 330 700 420 V622Z" fill="${door}"/>`;
  b += `<path d="M516 622 V428 Q600 350 684 428 V622Z" fill="none" stroke="#4E301C" stroke-width="6"/>`;
  b += r(598, 400, 4, 222, '#4E301C') + `<circle cx="580" cy="520" r="7" fill="#D9C6A0"/><circle cx="620" cy="520" r="7" fill="#D9C6A0"/>`;
  b += win(390, 330, 60, 60, { reja: true, frame: '#3B2E25' }) + win(750, 330, 60, 60, { reja: true, frame: '#3B2E25' });
  b += `<path d="M770 470 h30 v8 h-30z" fill="#2B2B2B"/><path d="M785 478 v20" stroke="#2B2B2B" stroke-width="4"/><path d="M772 498 h26 l-4 30 h-18z" fill="#2B2B2B"/><rect x="778" y="504" width="14" height="18" fill="#F7D98C"/>`;
  b += pot(250, 560) + pot(300, 560, '#C97B4E') + pot(900, 560) + pot(950, 560, '#C97B4E');
  b += `<path d="M150 230 L150 280" stroke="#3B4B45" stroke-width="0"/>`;
  return svg(b, defs);
}

function country({ skyKind = 'tarde', wall = '#F4EEE2' } = {}) {
  const sk = sky(skyKind, { x: 300, y: 170 });
  const defs = sk.defs + glassDef();
  let b = sk.body;
  b += r(0, 600, W, 200, '#C7B78E');
  for (let k = 0; k < 8; k++) b += `<path d="M${-100 + k * 180} 800 L600 610" stroke="#B3A277" stroke-width="10" opacity=".6"/>`;
  b += olive(120, 640, 1.1) + olive(1080, 650, 1.2) + olive(980, 620, 0.7) + olive(250, 615, 0.6);
  b += r(330, 400, 560, 220, wall) + `<path d="M310 400 L610 300 L910 400Z" fill="#B4593A"/>` + r(305, 394, 610, 14, '#8F4329');
  b += r(330, 590, 560, 30, '#C9A46A');
  b += r(360, 470, 520, 10, '#6E5640');
  for (let k = 0; k < 6; k++) b += r(370 + k * 100, 470, 12, 150, '#6E5640');
  b += win(400, 500, 80, 80, { shutter: '#4E6B5C' }) + win(740, 500, 80, 80, { shutter: '#4E6B5C' });
  b += r(570, 500, 80, 120, '#5A4130');
  b += win(580, 330, 60, 50, {});
  return svg(b, defs);
}

function attic({ skyKind = 'dorada' } = {}) {
  const sk = sky(skyKind, { x: 900, y: 260 });
  const defs = sk.defs + glassDef() + lin('rail', [[0, '#DCEBEC', 0.55], [1, '#BFD6D8', 0.35]]);
  let b = sk.body;
  // skyline lejano con torre (guiño a Sevilla)
  b += `<path d="M0 520 h80 v-40 h60 v30 h90 v-60 h70 v70 h120 v-30 h80 v40 h110 v-50 h90 v60 h140 v-20 h120 v30 h240 V640 H0Z" fill="#B9B3AA" opacity=".7"/>`;
  b += `<path d="M520 520 V360 h14 v-30 h-6 l13 -40 l13 40 h-6 v30 h14 V520Z" fill="#AEA79C"/>`;
  // terraza
  b += r(0, 600, W, 200, '#D8CBB3');
  for (let k = 0; k < 14; k++) b += `<path d="M${k * 100} 800 L${600 + (k - 7) * 30} 600" stroke="#C6B798" stroke-width="3"/>`;
  b += r(0, 540, W, 70, 'url(#rail)') + r(0, 536, W, 8, '#8E8A82');
  // pérgola
  b += r(80, 260, 16, 360, '#7E6347') + r(560, 260, 16, 360, '#7E6347') + r(60, 250, 560, 16, '#7E6347');
  for (let k = 0; k < 10; k++) b += r(70 + k * 56, 236, 10, 30, '#6A5039');
  b += r(150, 560, 300, 70, '#EDE6D9', 'rx="10"') + r(150, 530, 300, 40, '#E3D9C8', 'rx="10"') + r(180, 520, 80, 30, '#C9A46A', 'rx="6"') + r(330, 520, 80, 30, '#4E6B5C', 'rx="6"');
  b += `<ellipse cx="760" cy="640" rx="90" ry="20" fill="#B5A685"/>` + r(700, 590, 120, 12, '#F2EDE3', 'rx="4"') + r(755, 600, 10, 40, '#7E6347');
  b += pot(980, 660, '#8E8A82') + pot(1060, 660, '#B4593A') + pot(1130, 660, '#8E8A82');
  return svg(b, defs);
}

// ---------- Interiores ----------
function room({ wall, floor, side, light = '#FFF7E8' }) {
  const g = id('fl'), l = id('lt');
  const defs = lin(g, [[0, floor[0]], [1, floor[1]]]) + `<radialGradient id="${l}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${light}" stop-opacity=".55"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient>`;
  const body = r(0, 0, W, H, wall) +
    `<path d="M0 0 L180 90 V560 L0 800Z" fill="${side}"/><path d="M1200 0 L1020 90 V560 L1200 800Z" fill="${side}" opacity=".85"/>` +
    `<path d="M180 560 H1020 L1200 800 H0Z" fill="url(#${g})"/>` + r(180, 552, 840, 10, '#00000014'.slice(0, 7), 'opacity=".08"') +
    r(0, 0, W, H, `url(#${l})`);
  return { defs, body };
}

function salon({ wall = '#EFE9DF', sofa = '#8E9C8A', rug = '#D8C7A8', accent = '#C9A46A' } = {}) {
  const rm = room({ wall, floor: ['#CDB495', '#B79A78'], side: '#E3DCCF' });
  let b = rm.body;
  b += r(640, 130, 300, 300, '#C9D7DA') + r(632, 122, 316, 8, '#FFFFFF') + r(788, 130, 4, 300, '#FFFFFF') + `<path d="M640 430 L820 130" stroke="#fff" stroke-opacity=".35" stroke-width="80"/>`;
  b += r(600, 116, 30, 330, '#F3EFE7') + r(950, 116, 30, 330, '#F3EFE7');
  b += r(260, 200, 220, 150, '#F6F2EA') + r(275, 215, 190, 120, accent, 'opacity=".55"') + `<path d="M275 335 L340 270 L390 310 L430 260 L465 300 V335Z" fill="#4E6B5C" opacity=".6"/>`;
  b += `<ellipse cx="600" cy="680" rx="420" ry="70" fill="${rug}"/>`;
  b += r(300, 470, 520, 120, sofa, 'rx="24"') + r(300, 420, 520, 80, sofa, 'rx="24"') + r(270, 450, 60, 140, sofa, 'rx="20"') + r(790, 450, 60, 140, sofa, 'rx="20"');
  b += r(340, 440, 140, 70, '#F1EBE0', 'rx="14"') + r(640, 440, 140, 70, accent, 'rx="14"');
  b += r(420, 640, 280, 22, '#6E5640', 'rx="6"') + r(440, 662, 10, 40, '#6E5640') + r(670, 662, 10, 40, '#6E5640');
  b += `<circle cx="520" cy="630" r="16" fill="#F3EFE7"/>`;
  b += r(1000, 300, 6, 300, '#2B2B2B') + `<path d="M960 300 h86 l-20 -60 h-46z" fill="#F3E7CF"/>`;
  b += pot(200, 640, '#E3DCCF');
  return svg(b, rm.defs);
}

function cocina({ wall = '#F2EEE6', cab = '#4E6B5C', top = '#EDE7DC', wood = '#B08C67' } = {}) {
  const rm = room({ wall, floor: ['#D9D2C6', '#C2B9AA'], side: '#E6E0D5' });
  let b = rm.body;
  b += r(220, 140, 760, 150, cab) + r(220, 290, 760, 140, '#E8E2D7');
  for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) b += r(230 + i * 94, 300 + j * 34, 88, 28, '#F7F4EE');
  b += r(220, 430, 760, 20, top) + r(220, 450, 760, 110, cab);
  for (let i = 0; i < 6; i++) b += r(232 + i * 126, 160, 116, 116, '#000', 'opacity=".06"') + r(232 + i * 126, 460, 116, 90, '#000', 'opacity=".06"');
  for (let i = 0; i < 6; i++) b += r(280 + i * 126, 500, 30, 4, '#D9C6A0');
  b += r(560, 320, 120, 90, '#2D2D2D', 'rx="4"');
  b += r(300, 590, 600, 30, top) + r(310, 620, 580, 120, wood);
  for (let i = 0; i < 3; i++) b += `<path d="M${420 + i * 180} 0 V180" stroke="#2B2B2B" stroke-width="3"/><path d="M${395 + i * 180} 210 q25 -40 50 0z" fill="#2B2B2B"/><ellipse cx="${420 + i * 180}" cy="214" rx="20" ry="6" fill="#FFE7B0"/>`;
  b += r(380, 560, 16, 30, '#F3EFE7') + `<circle cx="760" cy="580" r="14" fill="#C9A46A"/>`;
  b += r(330, 640, 20, 140, '#2B2B2B') + r(850, 640, 20, 140, '#2B2B2B');
  return svg(b, rm.defs);
}

function dormitorio({ wall = '#ECE6DC', bed = '#F6F2EA', throwC = '#4E6B5C', head = '#C9B79C' } = {}) {
  const rm = room({ wall, floor: ['#C9AF8E', '#B39674'], side: '#E1DACD' });
  let b = rm.body;
  b += r(800, 150, 160, 260, '#CBD8DA') + r(792, 142, 176, 8, '#fff') + `<path d="M800 410 L900 150" stroke="#fff" stroke-opacity=".3" stroke-width="60"/>`;
  b += r(330, 280, 420, 200, head, 'rx="16"');
  b += r(300, 450, 480, 170, bed, 'rx="18"') + r(300, 540, 480, 80, throwC, 'rx="12"');
  b += r(350, 410, 150, 70, '#FFFFFF', 'rx="16"') + r(580, 410, 150, 70, '#FFFFFF', 'rx="16"');
  b += r(200, 470, 90, 80, '#8C6E50', 'rx="6"') + r(800, 470, 90, 80, '#8C6E50', 'rx="6"');
  b += `<path d="M225 470 h40 l-8 -50 h-24z" fill="#F3E7CF"/><path d="M825 470 h40 l-8 -50 h-24z" fill="#F3E7CF"/>`;
  b += r(400, 170, 280, 80, '#F6F2EA') + `<path d="M410 240 Q480 180 540 220 T670 200" stroke="${throwC}" stroke-width="4" fill="none"/>`;
  return svg(b, rm.defs);
}

function bano({ tile = '#E9EEEC', vanity = '#9C7653' } = {}) {
  const rm = room({ wall: tile, floor: ['#CFCAC0', '#B8B2A6'], side: '#DDE3E1' });
  let b = rm.body;
  for (let i = 0; i < 14; i++) b += `<path d="M${180 + i * 60} 90 V560" stroke="#fff" stroke-width="2" opacity=".7"/>`;
  for (let j = 0; j < 8; j++) b += `<path d="M180 ${150 + j * 60} H1020" stroke="#fff" stroke-width="2" opacity=".7"/>`;
  b += `<ellipse cx="460" cy="260" rx="120" ry="140" fill="#D6E2E3" stroke="#B9A27E" stroke-width="10"/>`;
  b += r(300, 430, 320, 22, '#F4F1EB') + r(310, 452, 300, 120, vanity) + r(330, 470, 120, 80, '#000', 'opacity=".07"') + r(470, 470, 120, 80, '#000', 'opacity=".07"');
  b += `<path d="M460 430 v-40 h30" stroke="#8C8C8C" stroke-width="8" fill="none"/>`;
  b += r(700, 120, 260, 470, '#DCEBEC', 'opacity=".55"') + r(700, 120, 6, 470, '#9AA') + `<path d="M860 160 v40 h-40" stroke="#8C8C8C" stroke-width="8" fill="none"/><circle cx="820" cy="210" r="20" fill="#8C8C8C"/>`;
  b += pot(250, 600, '#F4F1EB');
  return svg(b, rm.defs);
}

function patio({ wall = '#FBF8F2', tile1 = '#B85E3B', tile2 = '#E9DCC4' } = {}) {
  const defs = lin('skyp', [[0, '#BFD5DF'], [1, '#F2E9DA']]);
  let b = r(0, 0, W, H, 'url(#skyp)');
  b += r(0, 120, W, 500, wall);
  for (let i = 0; i < 3; i++) {
    const x = 120 + i * 340;
    b += `<path d="M${x} 620 V320 Q${x + 140} 180 ${x + 280} 320 V620Z" fill="#E8DECD"/>`;
    b += `<path d="M${x + 20} 620 V330 Q${x + 140} 210 ${x + 260} 330 V620Z" fill="#CFC2AC"/>`;
  }
  b += r(0, 120, W, 16, '#E1D6C3') + r(0, 520, W, 100, '#D9A441', 'opacity=".25"');
  b += r(0, 620, W, 180, tile2);
  for (let i = 0; i < 13; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) b += `<path d="M${i * 100 - 50} ${640 + j * 45} l50 -20 l50 20 l-50 20z" fill="${tile1}" opacity=".8"/>`;
  b += `<ellipse cx="600" cy="690" rx="130" ry="30" fill="#5E8A92"/><ellipse cx="600" cy="680" rx="130" ry="26" fill="none" stroke="#F4EEE2" stroke-width="12"/>`;
  b += r(588, 600, 24, 80, '#F4EEE2') + `<ellipse cx="600" cy="600" rx="44" ry="12" fill="#F4EEE2"/>`;
  b += pot(160, 640) + pot(240, 640, '#C97B4E') + pot(960, 640) + pot(1040, 640, '#C97B4E');
  for (let k = 0; k < 6; k++) b += pot(170 + k * 175, 300, '#2F6F8F');
  return svg(b, defs);
}

function piscina({ deck = '#E6DCCB' } = {}) {
  const sk = sky('azul', { x: 1000, y: 120 });
  const defs = sk.defs + lin('pw', [[0, '#8ED0D6'], [1, '#3C9AAA']]);
  let b = sk.body + r(0, 480, W, 320, deck);
  b += `<path d="M120 560 H1080 L1180 780 H20Z" fill="url(#pw)"/>`;
  for (let k = 0; k < 6; k++) b += `<path d="M${180 + k * 150} ${620 + (k % 2) * 40} q40 -10 80 0" stroke="#fff" stroke-opacity=".55" stroke-width="4" fill="none"/>`;
  b += r(100, 540, 1000, 22, '#F2ECE1');
  b += palm(1080, 520, 260) + olive(140, 510, 0.9);
  b += `<path d="M300 470 l120 0 l30 -40" stroke="#F6F2EA" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M520 470 l120 0 l30 -40" stroke="#F6F2EA" stroke-width="16" fill="none" stroke-linecap="round"/>`;
  b += `<path d="M720 470 v-170" stroke="#7E6347" stroke-width="6"/><path d="M600 310 Q720 230 840 310Z" fill="#C9A46A"/>`;
  return svg(b, defs);
}

const files = {
  'f-adosados-coria.svg': townhouses({}),
  'f-piso-gelves.svg': apartment({ wall: '#EEE4D2', accent: '#C9A46A', floors: 4 }),
  'f-chalet-palomares.svg': villa({}),
  'f-piso-triana.svg': apartment({ skyKind: 'dorada', wall: '#F0D9A8', accent: '#B4593A', floors: 5 }),
  'f-casa-puebla.svg': village({}),
  'f-atico-coria.svg': attic({}),
  'f-pareado-almensilla.svg': townhouses({ skyKind: 'dia', walls: ['#F7F4EE', '#F1EADF'], trim: '#9FB0A0', garage: 0 }),
  'f-casa-villamanrique.svg': country({}),
  'f-piso-coria.svg': apartment({ skyKind: 'tarde', wall: '#F4EFE6', accent: '#7F9787', floors: 4 }),
  'f-adosado-gelves.svg': townhouses({ skyKind: 'azul', walls: ['#FBF8F2', '#F4ECDD', '#F8F3EA'], trim: '#B85E3B', garage: 2 }),
  'f-bajo-coria.svg': village({ skyKind: 'tarde', wall: '#F8F4EE', trim: '#4E6B5C', door: '#3E4F48' }),
  'f-loft-gelves.svg': apartment({ skyKind: 'dia', wall: '#E9E4DB', accent: '#3E4F48', floors: 3 }),
  'salon-a.svg': salon({}),
  'salon-b.svg': salon({ wall: '#F2EEE8', sofa: '#C9B79C', rug: '#B9C4B5', accent: '#4E6B5C' }),
  'salon-c.svg': salon({ wall: '#EAE3D6', sofa: '#3E4F48', rug: '#D9C9AE', accent: '#B85E3B' }),
  'cocina-a.svg': cocina({}),
  'cocina-b.svg': cocina({ cab: '#EDE7DC', top: '#3E3A36', wood: '#8C6E50' }),
  'cocina-c.svg': cocina({ cab: '#A88763', top: '#F3EFE7', wood: '#4E6B5C' }),
  'dormitorio-a.svg': dormitorio({}),
  'dormitorio-b.svg': dormitorio({ wall: '#F1EEE9', throwC: '#C9A46A', head: '#A9B8AE' }),
  'bano-a.svg': bano({}),
  'bano-b.svg': bano({ tile: '#F1EBE1', vanity: '#3E4F48' }),
  'patio-a.svg': patio({}),
  'piscina-a.svg': piscina({}),
  'terraza-a.svg': attic({ skyKind: 'tarde' }),
};

for (const [name, content] of Object.entries(files)) writeFileSync(join(out, name), content);
console.log(`Generadas ${Object.keys(files).length} imágenes en ${out}`);
