// Genera las imágenes ilustradas de la demo de Inmobiliaria Alves (SVG propios,
// sin fotografías de terceros: la red de trabajo bloquea bancos de imágenes y,
// además, así no se usa ninguna foto que no sea del cliente).
// Uso: node demos/inmobiliaria-alves/tools/gen-images.mjs
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
const svg = (body, defs = '', w = W, h = H) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>\n`;
const lin = (gid, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${gid}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
const r = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;

// Paleta Alves: cal, albero, naranjo, hoja, azulejo y tinta.
const P = {
  cal: '#F6F2EA', cal2: '#ECE5D8', albero: '#D9B779', almagra: '#B4552F',
  naranja: '#EE7A2B', hoja: '#2F5B3E', hoja2: '#4C7A55', azulejo: '#2D5F7A',
  tinta: '#14181C', madera: '#8A5A3B', piedra: '#CFC6B6'
};

const SKIES = {
  manana: ['#A9C6DA', '#DCE6EA', '#F7F0E4'],
  tarde: ['#9DB7D2', '#F1D2B4', '#FBE8D2'],
  dorada: ['#E9A976', '#F6CFA6', '#FCEBD8'],
  limpia: ['#7FA8CC', '#C7DBEA', '#EEF1EF'],
};

function sky(kind, sun = { x: 960, y: 160 }) {
  const g = id('sk'), s = id('sn');
  const c = SKIES[kind];
  const defs = lin(g, [[0, c[0]], [0.65, c[1]], [1, c[2]]]) +
    `<radialGradient id="${s}"><stop offset="0" stop-color="#FFF7E6" stop-opacity=".9"/><stop offset="1" stop-color="#FFF7E6" stop-opacity="0"/></radialGradient>`;
  return { defs, body: r(0, 0, W, H, `url(#${g})`) + `<circle cx="${sun.x}" cy="${sun.y}" r="220" fill="url(#${s})"/><circle cx="${sun.x}" cy="${sun.y}" r="42" fill="#FFF5DF" opacity=".9"/>` };
}

const glassDefs = () => lin('glass', [[0, '#7E9DB0'], [0.5, '#B9CCD6'], [1, '#56707F']], 1, 1);

function win(x, y, w, h, o = {}) {
  const { frame = P.tinta, reja = false, persiana = null, arch = false } = o;
  let s = '';
  if (arch) s += `<path d="M${x - 6} ${y + w / 2} A${w / 2 + 6} ${w / 2 + 6} 0 0 1 ${x + w + 6} ${y + w / 2} V${y + h + 6} H${x - 6}Z" fill="${frame}"/><path d="M${x} ${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} H${x}Z" fill="url(#glass)"/>`;
  else s += r(x - 6, y - 6, w + 12, h + 12, frame, 'rx="2"') + r(x, y, w, h, 'url(#glass)');
  if (persiana) s += r(x, y, w, h * 0.38, persiana) + Array.from({ length: 6 }, (_, i) => r(x, y + i * h * 0.063, w, 1.5, '#000', 'opacity=".12"')).join('');
  s += `<path d="M${x} ${y + h} L${x + w * 0.6} ${y}" stroke="#fff" stroke-opacity=".2" stroke-width="${w * 0.22}"/>`;
  s += r(x + w / 2 - 2, y + (arch ? w / 2 : 0), 4, h - (arch ? w / 2 : 0), frame);
  if (reja) for (let i = 1; i < 5; i++) s += r(x + (w / 5) * i - 1.5, y - 6, 3, h + 12, '#22262A');
  s += r(x - 12, y + h + 6, w + 24, 9, P.cal2);
  return s;
}

function naranjo(x, base, k = 1) {
  const t = `<path d="M${x} ${base} C${x + 4 * k} ${base - 60 * k} ${x - 6 * k} ${base - 90 * k} ${x} ${base - 120 * k}" stroke="${P.madera}" stroke-width="${12 * k}" fill="none" stroke-linecap="round"/>`;
  let c = `<ellipse cx="${x}" cy="${base - 170 * k}" rx="${92 * k}" ry="${78 * k}" fill="${P.hoja}"/><ellipse cx="${x - 30 * k}" cy="${base - 190 * k}" rx="${52 * k}" ry="${44 * k}" fill="${P.hoja2}" opacity=".85"/>`;
  const fr = [[-50, -160], [30, -200], [60, -150], [-10, -130], [-60, -205], [20, -170], [70, -185], [-35, -140]];
  for (const [dx, dy] of fr) c += `<circle cx="${x + dx * k}" cy="${base + dy * k}" r="${7 * k}" fill="${P.naranja}"/>`;
  return t + c + `<ellipse cx="${x}" cy="${base + 4}" rx="${36 * k}" ry="${7 * k}" fill="#000" opacity=".12"/>`;
}

function acera(color = '#D8CDBB') {
  return r(0, 640, W, 160, color) + r(0, 640, W, 10, '#BFB29D') + `<path d="M0 720 H1200 V800 H0Z" fill="#B7AC99" opacity=".55"/>`;
}

function azulejoBand(x, y, w, h = 26) {
  const pid = id('az');
  const defs = `<pattern id="${pid}" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#F3EEE2"/><path d="M13 2 L24 13 L13 24 L2 13Z" fill="${P.azulejo}"/><circle cx="13" cy="13" r="4" fill="#E2A23A"/></pattern>`;
  return { defs, body: r(x, y, w, h, `url(#${pid})`) };
}

// --- Fachadas ---------------------------------------------------------------
function facadeCasa(name, { skyK = 'tarde', wall = P.cal, trim = P.albero, door = P.hoja, floors = 2 } = {}) {
  const s = sky(skyK);
  const az = azulejoBand(260, 560, 680);
  let b = s.body;
  b += `<path d="M0 520 C200 500 360 515 520 505 C700 495 900 512 1200 498 V650 H0Z" fill="#B9C0AE" opacity=".5"/>`;
  const top = floors === 3 ? 150 : 230;
  b += r(240, top, 720, 420, wall) + r(240, top, 720, 22, trim) + r(228, top - 14, 744, 16, P.cal2);
  b += r(240, top, 24, 420, trim, 'opacity=".55"') + r(936, top, 24, 420, trim, 'opacity=".55"');
  const rows = floors === 3 ? [190, 320] : [280];
  for (const y of rows) for (const x of [320, 540, 760]) b += win(x, y, 110, 120, { persiana: '#E7DCC6', reja: y === 280 || y === 320 });
  b += az.body;
  b += r(538, 440, 124, 200, P.tinta) + r(548, 450, 104, 190, door) + `<circle cx="638" cy="545" r="5" fill="${P.albero}"/>`;
  b += `<path d="M528 440 A72 40 0 0 1 672 440Z" fill="${trim}"/>`;
  b += win(330, 470, 100, 110, { reja: true }) + win(770, 470, 100, 110, { reja: true });
  b += `<path d="M300 ${top - 14} q20 -30 40 0 M860 ${top - 14} q20 -30 40 0" stroke="${P.hoja2}" stroke-width="10" fill="none"/>`;
  b += acera() + naranjo(140, 650, 1.05) + naranjo(1080, 650, 0.95);
  write(name, svg(b, s.defs + az.defs + glassDefs()));
}

function facadeBloque(name, { skyK = 'limpia', wall = '#EFE7DA', accent = P.almagra, balcony = true } = {}) {
  const s = sky(skyK, { x: 220, y: 150 });
  let b = s.body;
  b += r(700, 220, 380, 430, '#D7CDBD', 'opacity=".7"');
  b += r(200, 90, 600, 560, wall) + r(200, 90, 600, 18, accent);
  for (let f = 0; f < 4; f++) {
    const y = 140 + f * 120;
    for (const x of [250, 420, 590]) {
      b += win(x, y, 110, 82, { persiana: '#E5D9C2' });
      if (balcony) b += r(x - 14, y + 92, 138, 6, P.tinta) + Array.from({ length: 8 }, (_, i) => r(x - 10 + i * 18, y + 66, 2.5, 28, P.tinta)).join('');
    }
  }
  b += r(430, 560, 140, 90, P.tinta) + r(440, 570, 120, 80, 'url(#glass)');
  b += r(200, 540, 600, 8, accent, 'opacity=".8"');
  for (let f = 0; f < 3; f++) for (const x of [740, 860, 980]) b += r(x, 260 + f * 110, 70, 60, '#9DB0BC', 'opacity=".7"');
  b += acera('#D3C9B8') + naranjo(110, 650, 0.9) + naranjo(900, 655, 1);
  write(name, svg(b, s.defs + glassDefs()));
}

function facadeAtico(name) {
  const s = sky('dorada', { x: 1000, y: 220 });
  let b = s.body + r(160, 300, 880, 350, '#EDE4D3');
  for (let f = 0; f < 2; f++) for (const x of [220, 420, 620, 820]) b += win(x, 340 + f * 140, 120, 90, { persiana: '#E4D7BF' });
  b += r(260, 190, 680, 110, '#F7F2E8') + r(260, 190, 680, 12, P.almagra);
  b += win(320, 215, 250, 80, {}) + win(620, 215, 250, 80, {});
  b += r(160, 292, 880, 10, P.tinta) + Array.from({ length: 30 }, (_, i) => r(165 + i * 29.5, 250, 2.5, 46, P.tinta, 'opacity=".85"')).join('');
  b += `<path d="M300 300 q-20 -50 10 -80 q20 30 -10 80Z M900 300 q-20 -60 15 -90 q18 40 -15 90Z" fill="${P.hoja2}"/>`;
  b += r(650, 145, 260, 14, '#E8E1D4') + `<path d="M660 145 L780 100 L900 145Z" fill="${P.naranja}" opacity=".9"/>`;
  b += acera() + naranjo(80, 650, 0.95) + naranjo(1120, 650, 0.85);
  write(name, svg(b, s.defs + glassDefs()));
}

function facadeChalet(name, { skyK = 'manana' } = {}) {
  const s = sky(skyK, { x: 240, y: 140 });
  const pool = id('pl');
  let b = s.body + `<path d="M0 480 C300 455 600 470 1200 450 V800 H0Z" fill="#9FB28E"/>`;
  b += r(300, 260, 620, 260, P.cal) + r(300, 250, 620, 16, P.tinta) + r(520, 170, 400, 92, '#F1EBDF') + r(520, 160, 400, 14, P.tinta);
  b += win(560, 190, 320, 56, {}) + win(340, 330, 150, 150, {}) + r(560, 310, 300, 200, P.tinta) + r(570, 320, 280, 190, 'url(#glass)');
  b += r(706, 320, 4, 190, P.tinta);
  b += r(920, 340, 160, 180, P.madera, 'opacity=".85"');
  b += `<path d="M150 600 H1060 L1120 700 H90Z" fill="url(#${pool})"/><path d="M150 600 H1060 L1120 700 H90Z" fill="none" stroke="#F3EFE6" stroke-width="12"/>`;
  b += `<path d="M260 640 q30 -8 60 0 t60 0 M640 660 q30 -8 60 0 t60 0" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none"/>`;
  b += r(0, 700, W, 100, '#E3D8C4') + naranjo(160, 520, 1.1) + naranjo(1080, 520, 0.9);
  const defs = s.defs + glassDefs() + lin(pool, [[0, '#6FB3C8'], [1, '#2D7D95']]);
  write(name, svg(b, defs));
}

function facadeLocal(name) {
  const s = sky('limpia', { x: 900, y: 140 });
  let b = s.body + r(120, 120, 960, 530, '#F0E9DC') + r(120, 120, 960, 16, P.azulejo);
  for (const x of [200, 480, 760]) b += win(x, 180, 240, 140, { persiana: '#E1D4BC' });
  b += r(160, 380, 880, 270, P.tinta) + r(180, 400, 560, 250, 'url(#glass)') + r(760, 400, 260, 250, '#2A3036');
  b += r(180, 400, 560, 30, '#000', 'opacity=".25"') + r(452, 400, 6, 250, P.tinta);
  b += `<path d="M150 370 H1050 L1010 400 H190Z" fill="${P.naranja}"/>`;
  b += acera() + naranjo(70, 650, 0.8);
  write(name, svg(b, s.defs + glassDefs()));
}

// --- Interiores ------------------------------------------------------------
function room(name, kind, { wall = '#F2ECE2', floor = '#C9A57E', light = 'manana' } = {}) {
  const fl = id('fl'), sh = id('sh');
  let defs = glassDefs() + lin(fl, [[0, floor], [1, '#9C7A57']]) + lin(sh, [[0, '#FFF6E2', 0.55], [1, '#FFF6E2', 0]], 1, 1);
  let b = r(0, 0, W, H, wall) + `<path d="M0 560 H1200 V800 H0Z" fill="url(#${fl})"/>`;
  for (let i = 0; i < 14; i++) b += `<path d="M${i * 100 - 200} 800 L${i * 90 + 30} 560" stroke="#000" stroke-opacity=".06" stroke-width="2"/>`;
  b += r(0, 552, W, 10, '#E6DDCD');
  const sky0 = SKIES[light];
  const windowBlock = (x, y, w, h) => {
    let s = r(x - 10, y - 10, w + 20, h + 20, '#E8E1D4') + r(x, y, w, h, sky0[1]) + r(x, y + h * 0.62, w, h * 0.38, '#B8C3A8');
    s += naranjo(x + w * 0.7, y + h + 30, 0.55);
    s += r(x + w / 2 - 3, y, 6, h, '#E8E1D4') + r(x, y + h / 2 - 3, w, 6, '#E8E1D4');
    s += `<path d="M${x} ${y + h} L${x + w * 0.45} 800 H${x + w * 1.6} L${x + w} ${y + h}Z" fill="url(#${sh})"/>`;
    return s;
  };
  if (kind === 'salon') {
    b += windowBlock(720, 150, 320, 330);
    b += r(120, 430, 470, 120, '#6E7F74', 'rx="18"') + r(130, 380, 450, 80, '#7D8F83', 'rx="18"') + r(150, 400, 120, 70, P.naranja, 'rx="14" opacity=".9"');
    b += r(200, 600, 340, 26, P.tinta, 'rx="6"') + r(220, 626, 10, 60, P.tinta) + r(510, 626, 10, 60, P.tinta);
    b += `<circle cx="300" cy="590" r="16" fill="${P.albero}"/>`;
    b += r(160, 150, 200, 150, P.azulejo, 'opacity=".8"') + r(380, 180, 120, 120, P.albero, 'opacity=".9"');
    b += `<path d="M640 560 q-20 -120 30 -200 q30 90 -30 200Z" fill="${P.hoja2}"/>` + r(615, 520, 50, 40, P.almagra, 'rx="6"');
  } else if (kind === 'cocina') {
    b += windowBlock(470, 130, 260, 220);
    b += r(80, 400, 1040, 160, '#F7F4EE') + r(80, 390, 1040, 14, P.tinta);
    for (let i = 0; i < 6; i++) b += r(96 + i * 172, 420, 160, 120, '#EDE7DC', 'rx="4"') + r(160 + i * 172, 470, 34, 5, P.tinta);
    b += r(80, 110, 360, 160, '#F7F4EE') + r(760, 110, 360, 160, '#F7F4EE');
    const az = azulejoBand(80, 290, 1040, 100);
    defs += az.defs; b += az.body;
    b += r(330, 610, 540, 30, P.madera) + r(360, 640, 480, 110, '#E4DBCB');
    b += `<circle cx="470" cy="600" r="14" fill="${P.naranja}"/><circle cx="500" cy="602" r="12" fill="${P.naranja}"/><circle cx="486" cy="590" r="12" fill="#E6A33A"/>`;
  } else if (kind === 'dormitorio') {
    b += windowBlock(830, 150, 240, 300);
    b += r(160, 360, 560, 80, P.madera, 'rx="10"') + r(140, 440, 600, 150, '#F7F4EE', 'rx="14"') + r(140, 500, 600, 90, P.azulejo, 'rx="10" opacity=".85"');
    b += r(190, 400, 160, 60, '#EFE8DB', 'rx="18"') + r(380, 400, 160, 60, '#EFE8DB', 'rx="18"');
    b += r(30, 450, 90, 110, '#E2D7C4') + `<path d="M75 450 l-30 -60 h60Z" fill="${P.albero}"/>`;
    b += r(200, 140, 420, 170, '#E9DFCF') + `<path d="M230 290 q90 -120 180 -40 q80 -90 180 40Z" fill="${P.hoja2}" opacity=".5"/>`;
  } else if (kind === 'bano') {
    const az = azulejoBand(0, 300, W, 260);
    defs += az.defs; b += az.body;
    b += windowBlock(860, 110, 180, 150);
    b += r(120, 420, 540, 140, '#FBFAF6', 'rx="40"') + r(140, 430, 500, 40, '#E9F0F2', 'rx="20"');
    b += r(760, 380, 240, 40, '#F7F4EE') + r(780, 420, 200, 140, P.madera) + r(830, 160, 140, 190, '#C7D3D8', 'rx="70"');
    b += r(170, 140, 6, 260, '#B9B3A6') + `<circle cx="173" cy="140" r="22" fill="#B9B3A6"/>`;
  } else if (kind === 'terraza') {
    b = r(0, 0, W, H, SKIES.dorada[1]) + `<path d="M0 380 C200 350 360 370 600 350 C820 335 1000 360 1200 345 V560 H0Z" fill="#C8B9A0"/>`;
    b += `<path d="M260 360 V250 h30 V360Z M600 350 V150 l18 -40 18 40 V350Z" fill="#B49F84"/>`;
    b += r(0, 520, W, 280, '#C79B78') + r(0, 470, W, 10, P.tinta) + Array.from({ length: 40 }, (_, i) => r(i * 31, 480, 3, 60, P.tinta)).join('');
    b += r(380, 600, 360, 20, P.cal, 'rx="10"') + r(400, 620, 8, 80, P.tinta) + r(712, 620, 8, 80, P.tinta);
    b += r(120, 560, 180, 120, '#ECE3D4', 'rx="20"') + r(820, 560, 180, 120, '#ECE3D4', 'rx="20"');
    b += `<path d="M1100 720 q-60 -140 10 -260 q50 140 -10 260Z" fill="${P.hoja}"/>` + r(1060, 690, 90, 70, P.almagra, 'rx="8"');
    b += `<circle cx="560" cy="585" r="12" fill="${P.naranja}"/>`;
  } else if (kind === 'patio') {
    b = r(0, 0, W, H, '#F4EEE3') + r(0, 0, W, 120, SKIES.limpia[1]);
    b += `<path d="M120 120 V600 H220 V230 A110 110 0 0 1 440 230 V600 H540 V230 A110 110 0 0 1 760 230 V600 H860 V230 A110 110 0 0 1 1080 230 V600 H1200 V120Z" fill="#EFE6D6"/>`;
    const az = azulejoBand(0, 560, W, 60);
    defs += az.defs; b += az.body;
    b += r(0, 620, W, 180, '#D4C3A6');
    for (let i = 0; i < 12; i++) b += r(i * 100, 620, 2, 180, '#000', 'opacity=".07"');
    b += `<circle cx="600" cy="660" r="70" fill="#E8E0D0"/><circle cx="600" cy="650" r="50" fill="#7FB0C2"/>`;
    b += naranjo(330, 640, 0.8) + naranjo(970, 640, 0.8);
    b += r(470, 600, 20, 40, P.almagra) + r(700, 600, 20, 40, P.almagra);
  }
  write(name, svg(b, defs));
}

// --- Hero ------------------------------------------------------------------
function hero() {
  const s = sky('dorada', { x: 880, y: 210 });
  const az = azulejoBand(0, 600, W, 26);
  let b = s.body;
  b += `<path d="M0 470 C200 440 380 460 560 445 C760 430 980 455 1200 440 V640 H0Z" fill="#D1BFA2" opacity=".7"/>`;
  b += `<path d="M770 445 V250 l14 -36 14 36 V445Z M760 250 h48 v-8 h-48Z" fill="#C6A983"/>`; // silueta de torre genérica
  b += r(0, 300, 520, 340, P.cal) + r(0, 290, 520, 14, P.albero);
  b += win(80, 360, 110, 140, { reja: true, persiana: '#E7DCC6' }) + win(300, 360, 110, 140, { reja: true, persiana: '#E7DCC6' });
  b += r(980, 330, 260, 310, '#EFE2CB') + r(980, 320, 260, 14, P.almagra) + win(1040, 390, 100, 130, { arch: true });
  b += az.body + r(0, 626, W, 174, '#DCCFB9') + r(0, 626, W, 8, '#BFB29D');
  b += naranjo(640, 640, 1.35) + naranjo(900, 650, 0.9);
  write('hero-calle.svg', svg(b, s.defs + az.defs + glassDefs()));
}

function write(name, content) {
  writeFileSync(join(out, name), content);
}

hero();
facadeCasa('f-casa-triana.svg', { skyK: 'tarde', trim: P.albero, door: P.hoja });
facadeCasa('f-casa-macarena.svg', { skyK: 'manana', wall: '#F3E6CF', trim: P.almagra, door: P.azulejo, floors: 3 });
facadeBloque('f-piso-nervion.svg', { skyK: 'limpia', accent: P.azulejo });
facadeBloque('f-piso-remedios.svg', { skyK: 'tarde', wall: '#F1E3CF', accent: P.almagra });
facadeBloque('f-piso-este.svg', { skyK: 'manana', wall: '#EAE6DE', accent: P.hoja, balcony: false });
facadeAtico('f-atico-centro.svg');
facadeChalet('f-chalet-aljarafe.svg', { skyK: 'manana' });
facadeLocal('f-local-centro.svg');
room('salon-a.svg', 'salon');
room('salon-b.svg', 'salon', { wall: '#EEE6D8', floor: '#B8936D', light: 'tarde' });
room('cocina-a.svg', 'cocina');
room('dormitorio-a.svg', 'dormitorio');
room('dormitorio-b.svg', 'dormitorio', { wall: '#EDE3D6', light: 'tarde' });
room('bano-a.svg', 'bano');
room('terraza-a.svg', 'terraza');
room('patio-a.svg', 'patio');
console.log('Imágenes generadas en', out);
