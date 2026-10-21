// Genera las "fotografías" ilustradas de la demo de Peñaflor Inmobiliaria.
// Son SVG propios (sin fotos de terceros): luz de mediodía andaluza, cal,
// albero y sombras duras. Uso: node demos/penaflor-inmobiliaria/tools/gen-images.mjs
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
const svg = (body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}` +
  `<linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F5562"/><stop offset="1" stop-color="#173039"/></linearGradient>` +
  `</defs>${body}</svg>\n`;
const lin = (gid, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${gid}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
const r = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const poly = (pts, fill, extra = '') => `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${fill}" ${extra}/>`;
const shade = (pts, a = 0.16) => poly(pts, '#0B2026', `opacity="${a}"`);

const SKIES = {
  dia: ['#7FB7DE', '#CFE6F2', '#F4F1E8'],
  clara: ['#A9CFE8', '#E2EFF4', '#F7F4EC'],
  tarde: ['#9DBBD8', '#F1D2B4', '#F8E9D8'],
};

function sky(kind = 'dia', sun = { x: 220, y: 120 }) {
  const g = id('sky'), s = id('sun');
  const c = SKIES[kind];
  const defs = lin(g, [[0, c[0]], [0.65, c[1]], [1, c[2]]]) +
    `<radialGradient id="${s}"><stop offset="0" stop-color="#FFFDF4" stop-opacity=".9"/><stop offset="1" stop-color="#FFFDF4" stop-opacity="0"/></radialGradient>`;
  const body = r(0, 0, W, H, `url(#${g})`) + `<circle cx="${sun.x}" cy="${sun.y}" r="260" fill="url(#${s})"/>` +
    `<path d="M760 150 q40 -26 90 -8 q30 -24 70 -4 q40 4 30 26 H750 q-10 -10 10 -14Z" fill="#fff" opacity=".7"/>` +
    `<path d="M380 96 q30 -18 66 -4 q26 -14 52 2 q24 6 12 18 H372 q-6 -10 8 -16Z" fill="#fff" opacity=".55"/>`;
  return { defs, body };
}

// Horizonte de la orilla de enfrente: Sevilla vista desde Camas (siluetas genéricas).
function skyline(y = 560, tone = '#9DB3BC', a = 0.7) {
  let s = `<g fill="${tone}" opacity="${a}">`;
  const blocks = [[0, 40, 120], [110, 28, 80], [180, 52, 70], [240, 34, 90], [320, 60, 60], [370, 30, 110], [470, 46, 90], [600, 38, 120], [710, 54, 70], [770, 30, 100], [860, 44, 80], [930, 26, 140], [1060, 40, 140]];
  for (const [x, h, w] of blocks) s += r(x, y - h, w, h + 20, tone);
  // torre alta (silueta genérica de rascacielos) y campanario
  s += `<path d="M640 ${y} L652 ${y - 190} Q660 ${y - 205} 668 ${y - 190} L680 ${y}Z"/>`;
  s += r(520, y - 120, 16, 120, tone) + `<path d="M516 ${y - 120} h24 l-12 -26z"/>`;
  return s + '</g>';
}

function river(y = 590, h = 70) {
  const g = id('riv');
  return {
    defs: lin(g, [[0, '#6F9FB2'], [1, '#A9C9D3']]),
    body: r(0, y, W, h, `url(#${g})`) +
      Array.from({ length: 9 }, (_, i) => `<path d="M${60 + i * 130} ${y + 18 + (i % 3) * 16} h${40 + (i % 2) * 30}" stroke="#E6F1F4" stroke-width="3" stroke-linecap="round" opacity=".7"/>`).join(''),
  };
}

function ground(y = 640, c = '#D8C49A', path = '#C8B285') {
  return r(0, y, W, H - y, c) + `<path d="M0 ${y + 70} H1200 V800 H0Z" fill="${path}" opacity=".55"/>`;
}

function win(x, y, w, h, o = {}) {
  const { frame = '#F3EEE2', reja = false, shutter = null, sill = '#E3D6B8', persiana = 0.35 } = o;
  let s = r(x - 8, y - 8, w + 16, h + 16, frame) + r(x, y, w, h, 'url(#glass)');
  if (persiana) s += r(x, y, w, h * persiana, '#E7DCC4') + Array.from({ length: 5 }, (_, i) => r(x, y + (h * persiana / 5) * i, w, 1.5, '#CDBF9F')).join('');
  s += `<path d="M${x + w * 0.15} ${y + h} L${x + w * 0.75} ${y + h * persiana}" stroke="#fff" stroke-opacity=".14" stroke-width="${w * 0.22}"/>`;
  s += shade([[x, y], [x + 10, y], [x + 10, y + h], [x, y + h]], 0.28);
  if (shutter) s += r(x - 8 - w * 0.45, y - 8, w * 0.45, h + 16, shutter) + r(x + w + 8, y - 8, w * 0.45, h + 16, shutter);
  if (reja) { for (let i = 1; i < 5; i++) s += r(x + (w / 5) * i - 1.5, y - 14, 3, h + 24, '#23282A'); s += r(x - 12, y - 16, w + 24, 4, '#23282A') + r(x - 12, y + h + 10, w + 24, 4, '#23282A'); }
  s += r(x - 14, y + h + 8, w + 28, 9, sill) + shade([[x - 14, y + h + 17], [x + w + 14, y + h + 17], [x + w + 30, y + h + 34], [x + 2, y + h + 34]], 0.12);
  return s;
}

function balcony(x, y, w) {
  let s = r(x - 10, y, w + 20, 10, '#E9E3D6') + shade([[x - 10, y + 10], [x + w + 10, y + 10], [x + w + 30, y + 40], [x + 10, y + 40]], 0.14);
  for (let i = 0; i <= w; i += 12) s += r(x + i, y - 46, 2.5, 46, '#2A3133');
  return s + r(x - 6, y - 50, w + 12, 4, '#2A3133');
}

function door(x, y, w, h, c = '#6B4A2E') {
  return r(x - 10, y - 10, w + 20, h + 10, '#D9A441') + r(x, y, w, h, c) + r(x + w / 2 - 1, y, 2, h, '#4C3220') +
    r(x + 12, y + 16, w / 2 - 24, h - 40, '#7A573A') + r(x + w / 2 + 12, y + 16, w / 2 - 24, h - 40, '#7A573A') +
    `<circle cx="${x + w / 2 - 10}" cy="${y + h / 2}" r="4" fill="#E2C27A"/>` + shade([[x, y], [x + 14, y], [x + 14, y + h], [x, y + h]], 0.3);
}

function olive(x, base, s = 1) {
  return `<g transform="translate(${x} ${base}) scale(${s})">` +
    `<path d="M-6 0 C-4 -40 -16 -60 -4 -90 M4 0 C8 -50 22 -70 10 -100" stroke="#6E5E48" stroke-width="12" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="-40" cy="-120" rx="70" ry="42" fill="#8C9A6E"/><ellipse cx="34" cy="-140" rx="78" ry="48" fill="#97A57A"/><ellipse cx="-4" cy="-170" rx="64" ry="40" fill="#A6B286"/>` +
    `<ellipse cx="30" cy="-120" rx="50" ry="26" fill="#7D8B60" opacity=".7"/>` +
    `<ellipse cx="40" cy="4" rx="110" ry="14" fill="#0B2026" opacity=".14"/></g>`;
}

function cypress(x, base, h = 260) {
  return `<path d="M${x} ${base} C${x - 34} ${base - h * 0.4} ${x - 18} ${base - h * 0.8} ${x} ${base - h} C${x + 18} ${base - h * 0.8} ${x + 34} ${base - h * 0.4} ${x} ${base}Z" fill="#3F5A3E"/>` +
    `<path d="M${x} ${base} C${x + 34} ${base - h * 0.4} ${x + 18} ${base - h * 0.8} ${x} ${base - h}Z" fill="#2F4A31" opacity=".6"/>`;
}

function palm(x, base, h = 280) {
  let s = `<path d="M${x} ${base} C${x + 10} ${base - h * 0.5} ${x - 8} ${base - h * 0.8} ${x + 8} ${base - h}" stroke="#8A7457" stroke-width="13" fill="none" stroke-linecap="round"/>`;
  const tx = x + 8, ty = base - h;
  for (const [dx, dy] of [[-150, 34], [-110, -40], [-50, -76], [10, -84], [70, -64], [130, -26], [156, 40], [-40, 56], [50, 54]])
    s += `<path d="M${tx} ${ty} Q${tx + dx * 0.5} ${ty + dy - 34} ${tx + dx} ${ty + dy}" stroke="#4D7258" stroke-width="11" fill="none" stroke-linecap="round"/>`;
  return s;
}

function bush(x, y, w = 140, c = '#7E9A62') {
  return `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${w / 4}" fill="${c}"/><ellipse cx="${x - w / 4}" cy="${y - 10}" rx="${w / 3}" ry="${w / 5}" fill="${c}" opacity=".85"/><ellipse cx="${x + w / 5}" cy="${y - 16}" rx="${w / 3.4}" ry="${w / 5}" fill="#94AE76"/>`;
}

function bougainvillea(x, y, w = 160) {
  let s = '';
  for (let i = 0; i < 26; i++) {
    const dx = (i * 37) % w, dy = (i * 23) % 70;
    s += `<circle cx="${x + dx}" cy="${y + dy}" r="${10 + (i % 4) * 3}" fill="${i % 3 ? '#C2407A' : '#D9628F'}"/>`;
  }
  return s + `<path d="M${x} ${y + 90} C${x + 20} ${y + 40} ${x + 60} ${y + 20} ${x + w} ${y}" stroke="#4E6B44" stroke-width="5" fill="none"/>`;
}

function pool(x, y, w, h) {
  const g = id('pool');
  return {
    defs: lin(g, [[0, '#4FB3C8'], [1, '#8FD6E0']]),
    body: r(x - 14, y - 14, w + 28, h + 28, '#EFE9DC') + r(x, y, w, h, `url(#${g})`) +
      Array.from({ length: 6 }, (_, i) => `<path d="M${x + 30 + i * (w / 6)} ${y + 20 + (i % 3) * (h / 4)} q20 -8 40 0 t40 0" stroke="#E8FAFC" stroke-width="3" fill="none" opacity=".75"/>`).join('') +
      shade([[x, y], [x + w, y], [x + w, y + 18], [x, y + 18]], 0.18),
  };
}

function car(x, y, c = '#C9D2D4') {
  return `<g transform="translate(${x} ${y})"><path d="M0 40 q4 -26 30 -30 l40 -24 h70 l40 24 q30 4 34 30 v16 h-214z" fill="${c}"/>` +
    `<path d="M76 -6 h62 l30 18 h-110z" fill="#36525B"/><circle cx="46" cy="56" r="18" fill="#22292B"/><circle cx="170" cy="56" r="18" fill="#22292B"/>` +
    `<ellipse cx="110" cy="74" rx="120" ry="8" fill="#0B2026" opacity=".16"/></g>`;
}

// ───────────────────────────── exteriores ─────────────────────────────

function fCasaPueblo() {
  const sk = sky('dia', { x: 160, y: 110 });
  let b = sk.body + ground(660, '#D9CBA8', '#CDBB94');
  // fachada encalada con zócalo de albero
  b += r(120, 180, 960, 480, '#FBF8F1') + r(120, 600, 960, 60, '#D9A441') + r(120, 180, 960, 22, '#D9A441');
  b += r(100, 150, 1000, 34, '#B85F3C') + Array.from({ length: 25 }, (_, i) => `<path d="M${100 + i * 40} 184 q20 16 40 0" fill="#A44F31"/>`).join('');
  b += shade([[120, 202], [1080, 202], [1080, 250], [120, 228]], 0.12); // sombra del alero
  b += win(220, 300, 140, 190, { reja: true, persiana: 0.3 }) + win(840, 300, 140, 190, { reja: true, persiana: 0.45 });
  b += door(520, 380, 160, 280);
  b += r(470, 340, 260, 26, '#D9A441');
  b += bougainvillea(900, 200, 220) + `<path d="M120 660 L1080 660 L1200 760 L0 760Z" fill="#0B2026" opacity=".06"/>`;
  b += r(230, 520, 40, 40, '#B85F3C') + `<ellipse cx="250" cy="512" rx="34" ry="20" fill="#6E9A5A"/>`;
  b += r(940, 520, 40, 40, '#B85F3C') + `<ellipse cx="960" cy="512" rx="34" ry="20" fill="#6E9A5A"/>`;
  return svg(b, sk.defs);
}

function fPisoRio() {
  const sk = sky('clara', { x: 980, y: 130 });
  const rv = river(470, 80);
  let b = sk.body + skyline(470, '#9FB4BD', 0.75) + rv.body + r(0, 550, W, 250, '#C9D3BE');
  // paseo y barandilla en primer plano
  b += r(0, 640, W, 160, '#E4D7B8') + r(0, 628, W, 12, '#2A3133');
  for (let i = 0; i < W; i += 34) b += r(i, 560, 4, 70, '#2A3133');
  b += r(0, 556, W, 6, '#2A3133');
  // bloque de pisos a la izquierda
  b += r(40, 120, 380, 520, '#F6F1E6') + shade([[300, 120], [420, 120], [420, 640], [300, 640]], 0.14);
  for (let f = 0; f < 4; f++) { b += win(80, 160 + f * 120, 70, 70, { persiana: 0.2 }) + win(200, 160 + f * 120, 70, 70, { persiana: 0.5 }); b += balcony(70, 250 + f * 120, 210); }
  b += palm(700, 640, 300) + palm(860, 640, 250);
  b += `<path d="M0 760 L1200 700 V800 H0Z" fill="#0B2026" opacity=".08"/>`;
  return svg(b, sk.defs + rv.defs);
}

function fAtico() {
  const sk = sky('tarde', { x: 1000, y: 200 });
  let b = sk.body + skyline(520, '#B8B0B6', 0.55);
  // terraza en primer plano
  b += r(0, 560, W, 240, '#E7DCC6') + Array.from({ length: 10 }, (_, i) => `<path d="M${i * 140 - 100} 800 L${i * 140 + 60} 560" stroke="#D8CBB0" stroke-width="3"/>`).join('');
  b += r(0, 520, W, 46, '#F7F2E8') + r(0, 516, W, 6, '#D9A441');
  // pérgola
  b += r(120, 200, 14, 360, '#4B3B2B') + r(760, 200, 14, 360, '#4B3B2B') + r(100, 190, 700, 16, '#4B3B2B');
  for (let i = 0; i < 12; i++) b += r(110 + i * 58, 176, 10, 30, '#5C4935');
  for (let i = 0; i < 12; i++) b += shade([[140 + i * 58, 600], [160 + i * 58, 600], [230 + i * 58, 800], [205 + i * 58, 800]], 0.12);
  // sofá exterior y mesa
  b += r(200, 600, 360, 70, '#F1ECE1', 'rx="14"') + r(200, 560, 360, 50, '#E4DCCB', 'rx="14"') + r(240, 580, 80, 40, '#2F7D84', 'rx="10"') + r(440, 580, 80, 40, '#D9A441', 'rx="10"');
  b += `<ellipse cx="640" cy="690" rx="90" ry="20" fill="#4B3B2B"/>` + r(632, 690, 16, 60, '#4B3B2B');
  b += r(900, 470, 90, 90, '#B85F3C') + olive(945, 470, 0.7);
  b += r(1040, 500, 70, 60, '#B85F3C') + bush(1075, 494, 100);
  return svg(b, sk.defs);
}

function fAdosado() {
  const sk = sky('dia', { x: 1040, y: 120 });
  let b = sk.body + ground(620, '#C9D1B4', '#BCC4A4');
  const cols = ['#FBF8F1', '#F5EEDF', '#FBF8F1'];
  for (let i = 0; i < 3; i++) {
    const x = 90 + i * 350;
    b += r(x, 230, 330, 400, cols[i]) + poly([[x - 10, 236], [x + 165, 140], [x + 340, 236]], '#B85F3C');
    b += shade([[x - 10, 236], [x + 340, 236], [x + 330, 270], [x, 270]], 0.12);
    b += win(x + 40, 300, 100, 110, { persiana: 0.3 }) + win(x + 190, 300, 100, 110, { persiana: 0.4 });
    b += door(x + 40, 470, 90, 160, '#2F4A4E') + win(x + 190, 480, 100, 90, { persiana: 0.2 });
    b += r(x, 600, 330, 30, '#E7DCC6') + bush(x + 260, 620, 120);
  }
  b += shade([[90, 630], [1140, 630], [1200, 700], [150, 700]], 0.1);
  b += car(780, 680);
  return svg(b, sk.defs);
}

function fChalet() {
  const sk = sky('dia', { x: 200, y: 110 });
  const pl = pool(260, 620, 700, 110);
  let b = sk.body + ground(600, '#A9BC8C', '#9AAF7E');
  b += cypress(80, 600, 300) + cypress(1130, 600, 280);
  // volúmenes blancos
  b += r(180, 240, 520, 360, '#FBFAF6') + r(640, 330, 420, 270, '#F3EFE6') + r(170, 228, 540, 16, '#2A3133') + r(630, 318, 440, 14, '#2A3133');
  b += shade([[640, 330], [700, 330], [700, 600], [640, 600]], 0.18);
  b += r(230, 290, 420, 120, 'url(#glass)') + r(230, 440, 200, 160, 'url(#glass)') + r(700, 400, 300, 200, 'url(#glass)');
  for (let i = 1; i < 4; i++) b += r(230 + i * 105, 290, 4, 120, '#2A3133');
  for (let i = 1; i < 3; i++) b += r(700 + i * 100, 400, 4, 200, '#2A3133');
  b += r(460, 440, 220, 160, '#D9A441') + `<path d="M470 600 L680 450" stroke="#fff" stroke-opacity=".2" stroke-width="40"/>`;
  b += olive(1040, 610, 0.9) + pl.body;
  b += r(200, 760, 120, 18, '#F1ECE1', 'rx="6"') + r(360, 760, 120, 18, '#F1ECE1', 'rx="6"');
  return svg(b, sk.defs + pl.defs);
}

function fBajoJardin() {
  const sk = sky('clara', { x: 220, y: 130 });
  let b = sk.body + ground(640, '#A7BD88', '#97AE79');
  b += r(140, 120, 920, 520, '#F2ECDF') + shade([[860, 120], [1060, 120], [1060, 640], [860, 640]], 0.12);
  for (let f = 0; f < 2; f++) for (let c = 0; c < 4; c++) b += win(200 + c * 220, 150 + f * 150, 90, 90, { persiana: 0.25 + 0.1 * c });
  b += balcony(190, 250, 760);
  b += r(200, 460, 280, 180, 'url(#glass)') + r(560, 460, 160, 180, 'url(#glass)') + r(196, 456, 288, 6, '#2A3133');
  // valla y jardín privado
  b += r(0, 600, W, 70, '#E8E0CC') + Array.from({ length: 40 }, (_, i) => r(i * 30, 560, 6, 50, '#2A3133')).join('') + r(0, 556, W, 6, '#2A3133');
  b += bush(120, 600, 200) + bush(900, 604, 260) + bush(1120, 600, 180) + bougainvillea(760, 420, 120);
  b += r(560, 680, 140, 12, '#6B4A2E') + r(570, 692, 10, 40, '#6B4A2E') + r(680, 692, 10, 40, '#6B4A2E');
  return svg(b, sk.defs);
}

function fDuplex() {
  const sk = sky('tarde', { x: 160, y: 180 });
  let b = sk.body + ground(650, '#D2C3A0');
  b += r(260, 120, 680, 530, '#F7F1E4') + r(240, 104, 720, 20, '#2A3133');
  b += r(940, 260, 160, 390, '#E9DFCB') + shade([[940, 260], [1100, 260], [1100, 300], [940, 290]], 0.14);
  b += r(320, 170, 560, 180, 'url(#glass)') + balcony(320, 360, 560);
  for (let i = 1; i < 4; i++) b += r(320 + i * 140, 170, 4, 180, '#2A3133');
  b += win(330, 420, 120, 140, { persiana: 0.2 }) + door(560, 420, 120, 230, '#2F4A4E') + win(760, 420, 120, 140, { persiana: 0.5 });
  b += shade([[260, 650], [940, 650], [1040, 760], [360, 760]], 0.1);
  b += palm(160, 660, 320) + bush(1050, 650, 160);
  return svg(b, sk.defs);
}

function fPisoCentro() {
  const sk = sky('dia', { x: 1060, y: 120 });
  let b = sk.body + ground(680, '#CFC6B4', '#BFB6A3');
  b += r(80, 60, 700, 620, '#EFE6D3') + r(780, 160, 360, 520, '#F7F2E7');
  b += shade([[700, 60], [780, 60], [780, 680], [700, 680]], 0.15);
  for (let f = 0; f < 4; f++) for (let c = 0; c < 3; c++) b += win(130 + c * 200, 100 + f * 130, 90, 90, { persiana: (f + c) % 3 * 0.2 + 0.1 }) + (c === 1 ? balcony(320, 196 + f * 130, 110) : '');
  for (let f = 0; f < 3; f++) b += win(840, 200 + f * 130, 100, 80, { persiana: 0.3 }) + win(1000, 200 + f * 130, 100, 80, { persiana: 0.6 });
  b += r(80, 600, 700, 80, '#2A3133') + r(100, 612, 200, 60, 'url(#glass)') + r(560, 612, 200, 60, 'url(#glass)') + door(370, 600, 120, 80, '#6B4A2E');
  b += cypress(820, 690, 150) + bush(1040, 680, 180);
  return svg(b, sk.defs);
}

function fLocal() {
  const sk = sky('clara', { x: 180, y: 120 });
  let b = sk.body + ground(660, '#D8D0C0', '#C6BDAA');
  b += r(60, 80, 1080, 580, '#F4EEE1') + shade([[60, 80], [1140, 80], [1140, 120], [60, 110]], 0.12);
  for (let c = 0; c < 4; c++) b += win(130 + c * 260, 130, 120, 120, { persiana: 0.4 }) + balcony(120, 290, 140) + balcony(900, 290, 140);
  // escaparate
  b += r(100, 360, 1000, 300, '#2A3133') + r(130, 390, 600, 270, 'url(#glass)') + r(770, 390, 300, 270, '#3E5A60');
  b += `<path d="M140 640 L560 400" stroke="#fff" stroke-opacity=".14" stroke-width="70"/>`;
  b += r(130, 330, 940, 40, '#2F7D84') + Array.from({ length: 10 }, (_, i) => `<path d="M${130 + i * 94} 370 q47 26 94 0" fill="#2F7D84"/>`).join('');
  b += r(400, 480, 220, 60, '#F4EEE1', 'rx="6"') + `<text x="510" y="520" text-anchor="middle" font-family="sans-serif" font-size="26" font-weight="700" fill="#2A3133">SE ALQUILA</text>`;
  b += shade([[100, 660], [1100, 660], [1200, 760], [200, 760]], 0.1);
  return svg(b, sk.defs);
}

function fParcela() {
  const sk = sky('tarde', { x: 980, y: 170 });
  let b = sk.body + `<path d="M0 500 C200 470 420 480 620 460 C820 440 1000 470 1200 455 V800 H0Z" fill="#B7BE93"/>`;
  b += ground(600, '#C9B98A', '#BBA97A');
  for (let i = 0; i < 7; i++) b += olive(80 + i * 170, 520 + (i % 2) * 20, 0.45);
  b += r(420, 330, 460, 270, '#FBF8F1') + poly([[400, 336], [650, 250], [900, 336]], '#B85F3C') + r(420, 336, 460, 20, '#D9A441');
  b += shade([[750, 356], [880, 356], [880, 600], [750, 600]], 0.13);
  b += win(470, 400, 90, 110, { reja: true }) + door(610, 420, 110, 180) + win(760, 400, 90, 110, { reja: true });
  b += r(0, 700, W, 100, '#D9C79A') + olive(200, 760, 1) + olive(1050, 760, 0.9);
  return svg(b, sk.defs);
}

// ───────────────────────────── interiores ─────────────────────────────

function room({ wall = '#F4EFE5', floor = '#D7BE97', winX = 760, winW = 300, light = true, view = 'cielo' } = {}) {
  const fg = id('fl');
  let defs = lin(fg, [[0, floor], [1, '#C4A77C']]);
  let b = r(0, 0, W, 560, wall) + poly([[0, 560], [W, 560], [W, H], [0, H]], `url(#${fg})`);
  for (let i = -6; i < 14; i++) b += `<path d="M${600 + i * 30} 560 L${600 + i * 150} 800" stroke="#B89C70" stroke-width="2" opacity=".5"/>`;
  b += r(0, 548, W, 12, '#E6DECF');
  // ventana con vista
  b += r(winX - 14, 110, winW + 28, 400, '#FFFFFF');
  const vg = id('vw');
  defs += lin(vg, [[0, '#8EC3E6'], [1, '#E2F0F6']]);
  b += r(winX, 124, winW, 372, `url(#${vg})`);
  if (view === 'rio') {
    for (let i = 0; i < 9; i++) b += r(winX + i * (winW / 9), 380 - ((i * 7) % 4) * 12, winW / 9 - 4, 40 + ((i * 7) % 4) * 12, '#A9B9C0');
    b += `<path d="M${winX + winW * 0.62} 400 l6 -110 q4 -8 8 0 l6 110z" fill="#A9B9C0"/>` + r(winX, 400, winW, 50, '#7FAABB') + r(winX, 450, winW, 46, '#B8C8A8');
  }
  else b += `<ellipse cx="${winX + winW * 0.3}" cy="470" rx="${winW * 0.4}" ry="60" fill="#9CB27E"/><ellipse cx="${winX + winW * 0.8}" cy="480" rx="${winW * 0.35}" ry="50" fill="#8AA26E"/>`;
  b += r(winX + winW / 2 - 4, 124, 8, 372, '#FFFFFF');
  if (light) b += poly([[winX - 40, 560], [winX + winW + 40, 560], [winX + winW - 260, 800], [winX - 360, 800]], '#FFF7DF', 'opacity=".45"');
  return { defs, body: b };
}

function plant(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">` + r(-34, -10, 68, 70, '#C9B79A', 'rx="8"') +
    [[-60, -120], [-20, -160], [30, -150], [70, -100], [-80, -60], [80, -50]].map(([dx, dy]) => `<path d="M0 -10 Q${dx * 0.3} ${dy * 0.6} ${dx} ${dy}" stroke="#4E7A55" stroke-width="16" fill="none" stroke-linecap="round"/>`).join('') + '</g>';
}

function salon(variant = 'a') {
  const rm = room({ wall: variant === 'a' ? '#F4EFE5' : '#EAF0EC', winX: variant === 'a' ? 720 : 120, view: variant === 'a' ? 'rio' : 'jardin' });
  let b = rm.body;
  const sx = variant === 'a' ? 110 : 560;
  b += r(sx, 470, 520, 120, '#2F7D84', 'rx="20"') + r(sx, 420, 520, 80, '#2A6A70', 'rx="20"') + r(sx - 20, 440, 50, 150, '#2A6A70', 'rx="16"') + r(sx + 490, 440, 50, 150, '#2A6A70', 'rx="16"');
  b += r(sx + 60, 440, 90, 60, '#D9A441', 'rx="12"') + r(sx + 360, 440, 90, 60, '#F2EBDD', 'rx="12"');
  b += `<ellipse cx="${sx + 260}" cy="700" rx="230" ry="44" fill="#E9DFCC"/>` + `<ellipse cx="${sx + 260}" cy="660" rx="120" ry="22" fill="#6B4A2E"/>` + r(sx + 250, 660, 20, 50, '#6B4A2E');
  b += r(sx + 100, 180, 320, 180, '#E7DCC6') + r(sx + 116, 196, 288, 148, variant === 'a' ? '#D9A441' : '#B85F3C', 'opacity=".8"') + `<circle cx="${sx + 220}" cy="260" r="40" fill="#F4EFE5" opacity=".8"/>`;
  b += plant(variant === 'a' ? 680 : 1080, 520, 1.1);
  return svg(b, rm.defs);
}

function cocina(variant = 'a') {
  const rm = room({ wall: variant === 'a' ? '#F7F4EE' : '#F1EBE0', winX: variant === 'a' ? 820 : 160, winW: 240 });
  let b = rm.body;
  const top = variant === 'a' ? '#2A3133' : '#F4F1EA';
  const front = variant === 'a' ? '#E8E1D3' : '#2F7D84';
  const bx = variant === 'a' ? 60 : 460;
  b += r(bx, 380, 680, 170, front) + r(bx, 368, 680, 18, top) + r(bx, 120, 680, 140, front);
  for (let i = 1; i < 5; i++) b += r(bx + i * 136, 120, 2, 140, '#0B2026', 'opacity=".2"') + r(bx + i * 136, 390, 2, 160, '#0B2026', 'opacity=".2"');
  b += r(bx, 260, 680, 108, variant === 'a' ? '#DCE7E8' : '#E9DCC4');
  for (let i = 0; i < 18; i++) b += r(bx + i * 38, 260, 1.5, 108, '#fff', 'opacity=".6"');
  // isla
  b += r(bx + 120, 590, 460, 150, front) + r(bx + 110, 576, 480, 20, top) + shade([[bx + 120, 740], [bx + 580, 740], [bx + 640, 790], [bx + 160, 790]], 0.15);
  for (let i = 0; i < 3; i++) b += r(bx + 170 + i * 150, 520, 6, 56, '#2A3133') + `<path d="M${bx + 150 + i * 150} 520 h46 l-10 -26 h-26z" fill="#D9A441"/>`;
  b += plant(bx + 600, 368, 0.5);
  return svg(b, rm.defs);
}

function dormitorio(variant = 'a') {
  const rm = room({ wall: variant === 'a' ? '#EFE9DE' : '#E8EEF0', winX: variant === 'a' ? 860 : 80, winW: 240 });
  let b = rm.body;
  const bx = variant === 'a' ? 160 : 520;
  b += r(bx + 40, 300, 520, 160, '#B89870', 'rx="12"');
  b += r(bx, 470, 600, 150, '#FBFAF6', 'rx="18"') + r(bx, 520, 600, 120, variant === 'a' ? '#2F7D84' : '#D9A441', 'rx="18"');
  b += r(bx + 60, 420, 200, 70, '#FFFFFF', 'rx="24"') + r(bx + 340, 420, 200, 70, '#FFFFFF', 'rx="24"');
  b += r(bx - 120, 520, 100, 100, '#6B4A2E', 'rx="6"') + `<path d="M${bx - 90} 520 h40 l-8 -60 h-24z" fill="#F2E3BF"/>`;
  b += shade([[bx, 640], [bx + 600, 640], [bx + 680, 720], [bx + 60, 720]], 0.12);
  return svg(b, rm.defs);
}

function bano() {
  const rm = room({ wall: '#F5F3EE', floor: '#C9C2B4', winX: 880, winW: 200, light: true });
  let b = rm.body;
  for (let i = 0; i < 24; i++) for (let j = 0; j < 7; j++) b += r(i * 34, 200 + j * 50, 32, 48, j % 2 ? '#DCEBEC' : '#E7F1F1');
  b += r(60, 380, 560, 180, '#FFFFFF', 'rx="40"') + r(80, 360, 520, 30, '#F1EEE7', 'rx="14"');
  b += r(700, 400, 160, 30, '#6B4A2E') + r(720, 430, 120, 120, '#8A6A4A') + `<ellipse cx="780" cy="398" rx="60" ry="12" fill="#FFFFFF"/>`;
  b += r(700, 160, 160, 210, '#E9E4DA', 'rx="80"') + r(712, 172, 136, 186, '#BFD3D6', 'rx="70"');
  b += plant(1120, 560, 0.7);
  return svg(b, rm.defs);
}

function terrazaRio() {
  const sk = sky('tarde', { x: 900, y: 180 });
  const rv = river(470, 70);
  let b = sk.body + skyline(470, '#AFA6B0', 0.7) + rv.body + r(0, 540, W, 40, '#AFC0A0');
  b += r(0, 580, W, 220, '#E3D4B7') + r(0, 560, W, 26, '#F7F2E8');
  for (let i = 0; i < W; i += 60) b += r(i, 470, 3, 92, '#2A3133');
  b += r(0, 466, W, 5, '#2A3133');
  b += r(180, 640, 120, 14, '#4B3B2B') + r(190, 654, 8, 60, '#4B3B2B') + r(282, 654, 8, 60, '#4B3B2B');
  b += r(360, 600, 90, 110, '#F1ECE1', 'rx="14"') + r(500, 600, 90, 110, '#F1ECE1', 'rx="14"');
  b += r(900, 520, 100, 60, '#B85F3C') + bougainvillea(880, 430, 160);
  return svg(b, sk.defs + rv.defs);
}

function patio() {
  let b = r(0, 0, W, H, '#FBF8F1');
  b += r(0, 0, W, 120, '#9CC8E3') + r(0, 110, W, 20, '#D9A441');
  b += r(0, 560, W, 240, '#C8644A');
  for (let i = 0; i < 20; i++) for (let j = 0; j < 5; j++) b += r(i * 60 + (j % 2) * 30, 560 + j * 48, 58, 46, (i + j) % 2 ? '#B85F3C' : '#C8714F');
  for (let i = 0; i < 4; i++) b += `<path d="M${80 + i * 290} 560 V260 a110 110 0 0 1 220 0 V560" fill="#F1E8D6" stroke="#D9A441" stroke-width="14"/>`;
  b += shade([[0, 130], [W, 130], [W, 300], [0, 220]], 0.1);
  b += `<circle cx="600" cy="660" r="80" fill="#EFE9DC"/><circle cx="600" cy="660" r="60" fill="#6FB4C6"/>` + r(592, 560, 16, 100, '#EFE9DC');
  for (let i = 0; i < 6; i++) b += r(60 + i * 200, 400, 60, 50, '#2F7D84') + `<ellipse cx="${90 + i * 200}" cy="394" rx="40" ry="22" fill="#5F8F55"/>`;
  b += bougainvillea(900, 130, 260);
  return svg(b);
}

function piscina() {
  const sk = sky('dia', { x: 1000, y: 110 });
  const pl = pool(80, 520, 1040, 200);
  let b = sk.body + r(0, 420, W, 380, '#EFE9DC') + cypress(120, 430, 260) + cypress(220, 430, 230) + olive(900, 440, 1);
  b += r(0, 400, W, 30, '#FBFAF6') + pl.body;
  for (let i = 0; i < 3; i++) b += r(200 + i * 220, 740, 160, 22, '#F1ECE1', 'rx="8"');
  b += r(1036, 250, 8, 190, '#6B4A2E') + `<path d="M900 270 Q1040 150 1180 270 Z" fill="#D9A441"/><path d="M1040 170 Q1080 200 1110 270 H1040Z" fill="#C08F33"/>`;
  return svg(b, sk.defs + pl.defs);
}

// Panorámica de la orilla para la sección de zona.
function panorama() {
  const sk = sky('tarde', { x: 860, y: 150 });
  const rv = river(470, 120);
  let b = sk.body + skyline(470, '#A9A2AE', 0.8) + rv.body;
  b += `<path d="M0 590 C220 560 380 600 600 575 C820 550 1000 590 1200 570 V800 H0Z" fill="#9FB28A"/>`;
  b += `<path d="M0 650 C260 620 420 660 700 640 C900 625 1060 650 1200 640 V800 H0Z" fill="#8CA078"/>`;
  for (let i = 0; i < 9; i++) b += r(80 + i * 130, 600 - (i % 3) * 14, 90, 60 + (i % 3) * 14, '#FBF8F1') + r(80 + i * 130, 596 - (i % 3) * 14, 90, 8, '#B85F3C');
  b += palm(120, 700, 220) + olive(1080, 720, 0.8);
  return svg(b, sk.defs + rv.defs);
}

const files = {
  'f-casa-pueblo.svg': fCasaPueblo(),
  'f-piso-rio.svg': fPisoRio(),
  'f-atico.svg': fAtico(),
  'f-adosado.svg': fAdosado(),
  'f-chalet.svg': fChalet(),
  'f-bajo-jardin.svg': fBajoJardin(),
  'f-duplex.svg': fDuplex(),
  'f-piso-centro.svg': fPisoCentro(),
  'f-local.svg': fLocal(),
  'f-parcela.svg': fParcela(),
  'salon-a.svg': salon('a'),
  'salon-b.svg': salon('b'),
  'cocina-a.svg': cocina('a'),
  'cocina-b.svg': cocina('b'),
  'dormitorio-a.svg': dormitorio('a'),
  'dormitorio-b.svg': dormitorio('b'),
  'bano.svg': bano(),
  'terraza-rio.svg': terrazaRio(),
  'patio.svg': patio(),
  'piscina.svg': piscina(),
  'panorama.svg': panorama(),
};

for (const [name, content] of Object.entries(files)) writeFileSync(join(out, name), content);
console.log(`${Object.keys(files).length} imágenes en ${out}`);
