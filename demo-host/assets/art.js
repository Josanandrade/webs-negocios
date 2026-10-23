/* Ilustraciones SVG de fachadas sevillanas para los inmuebles de ejemplo.
   No representan inmuebles reales: sustituyen a las fotografías que la
   inmobiliaria subiría desde su panel. */
(function () {
  function rng(seed) {
    let s = seed * 9301 + 49297;
    return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  }

  const INK = '#2A2119';
  const GLASS = '#3B3129';

  function windowEl(x, y, w, h, o) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${GLASS}"/>`;
    // persiana a medio bajar
    const blind = h * o.blind;
    if (blind > 2) s += `<rect x="${x}" y="${y}" width="${w}" height="${blind}" fill="${o.shutter}" opacity=".92"/>` +
      Array.from({ length: Math.floor(blind / 4) }, (_, i) => `<line x1="${x}" x2="${x + w}" y1="${y + 3 + i * 4}" y2="${y + 3 + i * 4}" stroke="${INK}" stroke-opacity=".18"/>`).join('');
    s += `<rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" rx="3" fill="none" stroke="${o.trim}" stroke-width="3" opacity=".75"/>`;
    if (o.reja) {
      for (let i = 1; i < 5; i++) s += `<line x1="${x + (w / 5) * i}" x2="${x + (w / 5) * i}" y1="${y}" y2="${y + h}" stroke="${INK}" stroke-width="1.6"/>`;
      s += `<path d="M${x} ${y + h * .35} q ${w / 4} -8 ${w / 2} 0 t ${w / 2} 0" fill="none" stroke="${INK}" stroke-width="1.4"/>`;
    }
    if (o.balcon) {
      const by = y + h + 2;
      s += `<rect x="${x - 10}" y="${by}" width="${w + 20}" height="4" fill="${o.trim}"/>`;
      s += `<path d="M${x - 8} ${by} v-16 h${w + 16} v16" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
      for (let i = 1; i < 7; i++) s += `<line x1="${x - 8 + ((w + 16) / 7) * i}" x2="${x - 8 + ((w + 16) / 7) * i}" y1="${by - 16}" y2="${by}" stroke="${INK}" stroke-width="1.2"/>`;
      if (o.geranio) s += `<g fill="#C8423A"><circle cx="${x + 4}" cy="${by - 18}" r="3"/><circle cx="${x + 10}" cy="${by - 20}" r="3"/><circle cx="${x + w - 6}" cy="${by - 18}" r="3"/></g><g fill="#4C7A43"><circle cx="${x + 7}" cy="${by - 14}" r="4"/><circle cx="${x + w - 8}" cy="${by - 14}" r="4"/></g>`;
    }
    return s;
  }

  function naranjo(x, y, r) {
    let s = `<rect x="${x - 3}" y="${y}" width="6" height="${r * 1.4}" fill="#6B4B2E"/>`;
    s += `<circle cx="${x}" cy="${y - r * .2}" r="${r}" fill="#3F6B3A"/><circle cx="${x - r * .45}" cy="${y + r * .1}" r="${r * .7}" fill="#4C7A43"/>`;
    const pts = [[-.4, -.3], [.3, -.5], [.5, .1], [-.1, .2], [.1, -.1], [-.6, .3]];
    s += pts.map(([a, b]) => `<circle cx="${x + a * r}" cy="${y + b * r}" r="${r * .1}" fill="#E8902F"/>`).join('');
    return s;
  }

  function facade(art, opts = {}) {
    const R = rng(art.seed || 1);
    const W = 480, H = 360;
    const ground = 318;
    const floors = art.floors || 3;
    const fh = art.kind === 'casa' ? 70 : 50;
    const bw = art.kind === 'casa' ? 340 : 280 + Math.round(R() * 40);
    const bx = (W - bw) / 2;
    const bh = floors * fh + 28;
    const by = ground - bh;
    const shutter = ['#3E7F72', '#2E5F57', '#8C5A2B', '#5D7F4A'][Math.floor(R() * 4)];
    const id = 'g' + (art.seed || 1) + (opts.uid || '');
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${opts.label || 'Ilustración de inmueble de ejemplo'}">`;
    s += `<defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8EAD2"/><stop offset="1" stop-color="#EED7B2"/></linearGradient>` +
      `<linearGradient id="${id}w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${art.wall}"/><stop offset=".7" stop-color="${art.wall}"/><stop offset="1" stop-color="${INK}" stop-opacity=".08"/></linearGradient></defs>`;
    s += `<rect width="${W}" height="${H}" fill="url(#${id}s)"/>`;
    s += `<circle cx="${80 + R() * 320}" cy="${46 + R() * 30}" r="${18 + R() * 10}" fill="#F6C979" opacity=".55"/>`;
    // edificios vecinos
    s += `<rect x="${bx - 120}" y="${by + 40}" width="130" height="${bh}" fill="#E4D2B4"/><rect x="${bx + bw - 10}" y="${by + 22}" width="140" height="${bh}" fill="#E8D8BD"/>`;
    // cuerpo
    s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#${id}w)"/>`;
    s += `<rect x="${bx - 6}" y="${by - 8}" width="${bw + 12}" height="12" fill="${art.trim}"/>`;
    s += `<rect x="${bx}" y="${ground - 26}" width="${bw}" height="26" fill="${art.trim}" opacity=".32"/>`;
    // banda de azulejo
    const ay = by + fh - 6;
    for (let i = 0; i < bw / 14; i++) {
      s += `<rect x="${bx + i * 14}" y="${ay}" width="14" height="8" fill="${i % 2 ? '#2F6FA0' : '#F2E2B8'}" opacity=".55"/>`;
    }
    if (art.kind === 'casa') {
      // tejado
      s += `<path d="M${bx - 14} ${by - 8} L${bx + 20} ${by - 34} H${bx + bw - 20} L${bx + bw + 14} ${by - 8} Z" fill="#B5603D"/>`;
      for (let i = 0; i < 14; i++) s += `<line x1="${bx + 20 + i * (bw - 40) / 14}" x2="${bx + 10 + i * (bw - 20) / 14}" y1="${by - 34}" y2="${by - 8}" stroke="#8C4429" stroke-width="2"/>`;
    }
    if (art.kind === 'atico') {
      const ax = bx + 40, aw = bw - 80;
      s += `<rect x="${ax}" y="${by - 46}" width="${aw}" height="40" fill="${art.wall}"/><rect x="${ax - 4}" y="${by - 50}" width="${aw + 8}" height="6" fill="${art.trim}"/>`;
      s += `<rect x="${ax + 14}" y="${by - 38}" width="${aw * .45}" height="30" fill="${GLASS}"/>`;
      s += `<path d="M${bx} ${by - 8} v-14 h${bw} v14" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
      s += `<g fill="#4C7A43"><circle cx="${bx + 18}" cy="${by - 22}" r="9"/><circle cx="${bx + bw - 20}" cy="${by - 24}" r="11"/><circle cx="${ax + aw - 26}" cy="${by - 16}" r="7"/></g>`;
      for (let i = 0; i < 6; i++) s += `<line x1="${ax + aw * .55 + i * 14}" x2="${ax + aw * .55 + i * 14}" y1="${by - 46}" y2="${by - 66}" stroke="${art.trim}" stroke-width="3"/>`;
      s += `<rect x="${ax + aw * .55 - 6}" y="${by - 70}" width="${aw * .45}" height="5" fill="${art.trim}"/>`;
    }
    // ventanas
    const cols = art.kind === 'casa' ? 3 : (bw > 300 ? 4 : 3);
    const ww = art.kind === 'casa' ? 38 : 30;
    const wh = art.kind === 'casa' ? 44 : 32;
    for (let f = 0; f < floors; f++) {
      const y = by + 18 + f * fh + (art.kind === 'casa' ? 6 : 0);
      const ground1 = f === floors - 1;
      for (let c = 0; c < cols; c++) {
        const x = bx + (bw / cols) * c + (bw / cols - ww) / 2;
        if (ground1 && c === Math.floor(cols / 2)) continue;
        if (ground1 && art.kind === 'local') continue;
        s += windowEl(x, y, ww, wh, {
          trim: art.trim, shutter, blind: R() * .7,
          reja: ground1, balcon: !ground1 && R() > .35, geranio: R() > .5
        });
      }
    }
    // puerta / portal
    const dx = W / 2, dw = art.kind === 'casa' ? 64 : 46, dh = art.kind === 'casa' ? 70 : 54;
    if (art.kind === 'local') {
      const lx = bx + 18, lw = bw - 36;
      s += `<rect x="${lx}" y="${ground - 66}" width="${lw}" height="62" fill="${GLASS}"/>`;
      s += `<rect x="${lx + 10}" y="${ground - 58}" width="${lw * .6}" height="46" fill="#D9C7A6" opacity=".18"/>`;
      for (let i = 0; i < 10; i++) s += `<path d="M${lx - 8 + i * (lw + 16) / 10} ${ground - 92} h${(lw + 16) / 10} l-4 22 h-${(lw + 16) / 10 - 8} Z" fill="${i % 2 ? art.trim : '#F4EFE6'}"/>`;
      s += `<rect x="${lx + lw - 50}" y="${ground - 58}" width="36" height="54" fill="#1E1812"/>`;
    } else {
      s += `<path d="M${dx - dw / 2} ${ground} v-${dh - dw / 2} a${dw / 2} ${dw / 2} 0 0 1 ${dw} 0 v${dh - dw / 2} Z" fill="#5A3B22"/>`;
      s += `<path d="M${dx - dw / 2 - 6} ${ground} v-${dh - dw / 2} a${dw / 2 + 6} ${dw / 2 + 6} 0 0 1 ${dw + 12} 0 v${dh - dw / 2}" fill="none" stroke="${art.trim}" stroke-width="5"/>`;
      s += `<line x1="${dx}" x2="${dx}" y1="${ground - dh + 4}" y2="${ground}" stroke="${INK}" stroke-opacity=".35" stroke-width="2"/>`;
      if (art.kind === 'casa') {
        // cancela del patio
        for (let i = 1; i < 6; i++) s += `<line x1="${dx - dw / 2 + i * dw / 6}" x2="${dx - dw / 2 + i * dw / 6}" y1="${ground - dh + 14}" y2="${ground}" stroke="#D9A85B" stroke-width="1.5"/>`;
      }
    }
    // acera y naranjos
    s += `<rect y="${ground}" width="${W}" height="${H - ground}" fill="#D7C3A0"/><rect y="${ground}" width="${W}" height="4" fill="#BFA77F"/>`;
    s += naranjo(bx - 34, ground - 54, 30 + R() * 6);
    if (R() > .4) s += naranjo(bx + bw + 40, ground - 50, 26 + R() * 6);
    s += '</svg>';
    return s;
  }

  // La veleta: silueta abstracta de la Giraldilla con su estandarte.
  function vaneMark(color = 'currentColor') {
    return `<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 37V12"/><path d="M14 37h12"/><circle cx="20" cy="9" r="3"/><path d="M20 15c5-2 10-1 15 1-4 3-4 7 0 10-5 2-10 2-15 0"/><path d="M20 22l-9 4"/></g></svg>`;
  }

  window.GSIArt = { facade, vaneMark };
})();
