/* Ilustraciones propias de fachadas para los inmuebles de ejemplo (SVG, sin fotos). */
(function () {
  var ALM = "#A23B22", TINTA = "#16181D", PLAT = "#6E7F4E";

  function rnd(seed) {
    var s = 0;
    for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function toldo(x, y, w, color) {
    var stripes = "", n = 5, sw = w / n;
    for (var i = 0; i < n; i += 2) stripes += '<rect x="' + (x + i * sw) + '" y="' + y + '" width="' + sw + '" height="9" fill="' + color + '"/>';
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="9" fill="#F4EFE7"/>' + stripes +
      '<path d="M' + x + ' ' + (y + 9) + ' h' + w + ' l-3 4 h-' + (w - 6) + 'z" fill="' + color + '" opacity=".85"/>';
  }

  function arbol(x, base, r) {
    return '<g class="art-tree"><rect x="' + (x - 3) + '" y="' + (base - 70) + '" width="6" height="70" fill="#5B4A3A"/>' +
      '<circle cx="' + x + '" cy="' + (base - 92) + '" r="' + r + '" fill="' + PLAT + '"/>' +
      '<circle cx="' + (x - r * .7) + '" cy="' + (base - 78) + '" r="' + r * .72 + '" fill="#7E9160"/>' +
      '<circle cx="' + (x + r * .75) + '" cy="' + (base - 80) + '" r="' + r * .68 + '" fill="#5F7043"/></g>';
  }

  function ventanas(x0, y0, w, h, cols, floors, r, opts) {
    var out = "", fh = h / floors, cw = w / cols;
    for (var f = 0; f < floors; f++) {
      for (var c = 0; c < cols; c++) {
        var wx = x0 + c * cw + cw * .22, wy = y0 + f * fh + fh * .2, ww = cw * .56, wh = fh * .58;
        var lit = r() > .72;
        out += '<rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" rx="1.5" fill="' + (lit ? "#F2D49B" : "#3A3F4A") + '" class="' + (lit ? "art-lit" : "") + '"/>';
        out += '<rect x="' + (wx - 3) + '" y="' + (wy + wh - 2) + '" width="' + (ww + 6) + '" height="3" fill="' + TINTA + '" opacity=".75"/>';
        out += '<path d="M' + (wx - 3) + ' ' + (wy + wh - 9) + ' h' + (ww + 6) + '" stroke="' + TINTA + '" stroke-width="1.2" opacity=".55"/>';
        if (opts.toldos && r() > .55) out += toldo(wx - 4, wy - 4, ww + 8, r() > .5 ? ALM : PLAT);
      }
    }
    return out;
  }

  function bloque(a, r, kind) {
    var W = 230, X = 400 / 2 - W / 2 + 20, base = 262, floors = a.floors || 5, fh = 30;
    var H = floors * fh, top = base - H;
    var s = "";
    s += '<rect x="' + X + '" y="' + top + '" width="' + W + '" height="' + H + '" fill="' + a.hue + '"/>';
    s += '<rect x="' + X + '" y="' + top + '" width="' + W + '" height="6" fill="' + TINTA + '" opacity=".18"/>';
    s += '<rect x="' + (X + W) + '" y="' + (top + 8) + '" width="34" height="' + (H - 8) + '" fill="' + a.hue + '" opacity=".6"/>';
    if (kind === "atico") {
      s += '<rect x="' + (X + 30) + '" y="' + (top - 26) + '" width="' + (W - 70) + '" height="26" fill="#F4EFE7"/>';
      s += '<rect x="' + (X + 40) + '" y="' + (top - 20) + '" width="44" height="18" fill="#3A3F4A"/><rect x="' + (X + 96) + '" y="' + (top - 20) + '" width="44" height="18" fill="#F2D49B" class="art-lit"/>';
      s += '<path d="M' + (X + 10) + ' ' + (top - 30) + ' h' + (W - 30) + '" stroke="' + PLAT + '" stroke-width="4"/>';
      s += '<path d="M' + X + ' ' + top + ' h' + W + '" stroke="' + TINTA + '" stroke-width="2"/>';
      for (var p = 0; p < 9; p++) s += '<rect x="' + (X + 8 + p * 24) + '" y="' + (top - 9) + '" width="2" height="9" fill="' + TINTA + '"/>';
      s += '<circle cx="' + (X + W - 22) + '" cy="' + (top - 14) + '" r="10" fill="#7E9160"/>';
    }
    var groundH = fh + 4;
    s += ventanas(X + 4, top + 8, W - 8, H - groundH - 8, 4, floors - 1, r, { toldos: true });
    var gy = base - groundH;
    if (kind === "local") {
      s += '<rect x="' + X + '" y="' + gy + '" width="' + W + '" height="' + groundH + '" fill="#2A2D33"/>';
      s += '<rect x="' + (X + 8) + '" y="' + (gy + 4) + '" width="' + (W - 16) + '" height="8" fill="' + ALM + '"/>';
      s += '<rect x="' + (X + 10) + '" y="' + (gy + 15) + '" width="' + (W / 2 - 22) + '" height="' + (groundH - 15) + '" fill="#F2D49B" opacity=".85" class="art-lit"/>';
      s += '<rect x="' + (X + W / 2 + 12) + '" y="' + (gy + 15) + '" width="' + (W / 2 - 22) + '" height="' + (groundH - 15) + '" fill="#F2D49B" opacity=".85" class="art-lit"/>';
    } else {
      s += '<rect x="' + X + '" y="' + gy + '" width="' + W + '" height="' + groundH + '" fill="' + TINTA + '" opacity=".12"/>';
      s += '<path d="M' + (X + W / 2 - 16) + ' ' + base + ' v-22 a16 16 0 0 1 32 0 v22z" fill="#3B2B22"/>';
    }
    return s;
  }

  function casa(a, r) {
    var X = 70, W = 270, base = 262, H = 120, top = base - H, s = "";
    s += '<rect x="' + X + '" y="' + top + '" width="' + W + '" height="' + H + '" fill="' + a.hue + '"/>';
    s += '<rect x="' + (X - 6) + '" y="' + (top - 10) + '" width="' + (W + 12) + '" height="10" fill="#F4EFE7"/>';
    s += '<rect x="' + X + '" y="' + (base - 14) + '" width="' + W + '" height="14" fill="' + ALM + '" opacity=".75"/>';
    s += '<path d="M' + (X + W / 2 - 22) + ' ' + base + ' v-46 a22 22 0 0 1 44 0 v46z" fill="#3B2B22"/>';
    s += '<path d="M' + (X + W / 2 - 22) + ' ' + (base - 46) + ' a22 22 0 0 1 44 0" fill="none" stroke="#C98B5E" stroke-width="4"/>';
    [[X + 26, top + 20], [X + W - 72, top + 20], [X + 26, top + 70], [X + W - 72, top + 70]].forEach(function (p, i) {
      s += '<rect x="' + p[0] + '" y="' + p[1] + '" width="46" height="34" fill="' + (r() > .6 ? "#F2D49B" : "#3A3F4A") + '"/>';
      for (var k = 0; k < 5; k++) s += '<rect x="' + (p[0] + 4 + k * 9) + '" y="' + p[1] + '" width="2" height="34" fill="' + TINTA + '"/>';
      if (i < 2) s += toldo(p[0] - 4, p[1] - 8, 54, i ? PLAT : ALM);
    });
    s += '<path d="M' + (X + W - 40) + ' ' + (top - 10) + ' q 14 -22 30 -8" stroke="' + PLAT + '" stroke-width="6" fill="none" stroke-linecap="round"/>';
    return s;
  }

  window.MB = window.MB || {};
  window.MB.art = function (p, opts) {
    opts = opts || {};
    var a = p.arte, r = rnd(p.ref), id = "g" + p.ref.replace(/\W/g, "") + (opts.uid || "");
    var body = a.kind === "casa" ? casa(a, r) : bloque(a, r, a.kind);
    var tree = a.tree ? arbol(54, 262, 30) : "";
    return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustración de ejemplo: ' + p.tipo.toLowerCase() + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E7D3"/><stop offset="1" stop-color="#EFE3D1"/></linearGradient></defs>' +
      '<rect width="400" height="300" fill="url(#' + id + ')"/>' +
      '<circle cx="332" cy="62" r="22" fill="#E9B98A" opacity=".55"/>' +
      body + tree +
      '<rect y="262" width="400" height="38" fill="#D9CDBB"/><rect y="262" width="400" height="3" fill="' + TINTA + '" opacity=".25"/>' +
      '</svg>';
  };
})();
