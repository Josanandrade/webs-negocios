/* Ilustraciones SVG de los inmuebles de ejemplo (no son fotos reales). */
(function () {
  var INK = "#1B1714";
  var ALMAGRA = "#9A3B26";
  var SHUTTER = "#2F4A3F";

  function rng(seed) {
    var s = seed * 9301 + 49297;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  function sky(id, warm) {
    return (
      '<defs><linearGradient id="sk' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + (warm ? "#F3DCC0" : "#D7E4EA") + '"/>' +
      '<stop offset="1" stop-color="' + (warm ? "#F8EEE1" : "#F2EEE6") + '"/></linearGradient>' +
      '<pattern id="tl' + id + '" width="20" height="20" patternUnits="userSpaceOnUse">' +
      '<rect width="20" height="20" fill="#F4EDE1"/><path d="M0 10h20M10 0v20" stroke="#D9CBB3" stroke-width="1"/>' +
      '<circle cx="10" cy="10" r="3" fill="none" stroke="#2D5C9A" stroke-width="1.2" opacity=".55"/></pattern></defs>' +
      '<rect width="400" height="300" fill="url(#sk' + id + ')"/>'
    );
  }

  function windowBay(x, y, w, h, balcony, r) {
    var s = "";
    s += '<rect x="' + (x - 4) + '" y="' + (y - 5) + '" width="' + (w + 8) + '" height="' + (h + 8) + '" fill="#FFFFFF" opacity=".55"/>';
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#3A2E28"/>';
    var open = r() > 0.5;
    if (open) {
      s += '<rect x="' + x + '" y="' + y + '" width="' + w / 2 + '" height="' + h + '" fill="' + SHUTTER + '"/>';
      s += '<rect x="' + (x + w / 2 + 2) + '" y="' + (y + 4) + '" width="' + (w / 2 - 4) + '" height="' + (h - 4) + '" fill="#F2C97D" opacity=".75"/>';
    } else {
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + SHUTTER + '"/>';
      for (var i = 6; i < h; i += 6) s += '<path d="M' + x + " " + (y + i) + "h" + w + '" stroke="#24382F" stroke-width="1.4"/>';
    }
    if (balcony) {
      var by = y + h - 14;
      s += '<rect x="' + (x - 8) + '" y="' + (y + h) + '" width="' + (w + 16) + '" height="4" fill="' + INK + '"/>';
      s += '<path d="M' + (x - 6) + " " + by + "h" + (w + 12) + '" stroke="' + INK + '" stroke-width="2"/>';
      for (var b = x - 6; b <= x + w + 6; b += 5) s += '<path d="M' + b + " " + by + "v14" + '" stroke="' + INK + '" stroke-width="1.2"/>';
      if (r() > 0.45) {
        s += '<circle cx="' + (x - 2) + '" cy="' + (by - 4) + '" r="6" fill="#4F7A4A"/><circle cx="' + (x + 3) + '" cy="' + (by - 7) + '" r="3" fill="#D8483A"/>';
      }
    } else {
      // reja
      s += '<g stroke="' + INK + '" stroke-width="1.3" fill="none">';
      for (var g = x + 4; g < x + w; g += 6) s += '<path d="M' + g + " " + (y - 2) + "v" + (h + 4) + '"/>';
      s += '<path d="M' + (x - 2) + " " + (y - 2) + "h" + (w + 4) + "M" + (x - 2) + " " + (y + h + 2) + "h" + (w + 4) + '"/></g>';
    }
    return s;
  }

  function facade(o, id) {
    var r = rng(o.seed || 1);
    var floors = o.floors || 3;
    var top = 300 - 34 - floors * 62;
    var s = sky(id, true);
    // neighbours
    s += '<rect x="-10" y="' + (top + 30) + '" width="70" height="300" fill="#E4D2B7"/>';
    s += '<rect x="340" y="' + (top + 18) + '" width="80" height="300" fill="#C9A98A"/>';
    // building
    s += '<rect x="60" y="' + top + '" width="280" height="' + (300 - top) + '" fill="' + o.wall + '"/>';
    s += '<rect x="56" y="' + (top - 10) + '" width="288" height="12" fill="#FBF7EF"/>';
    s += '<rect x="60" y="' + (top + 2) + '" width="280" height="4" fill="' + ALMAGRA + '" opacity=".55"/>';
    for (var f = 0; f < floors; f++) {
      var y = top + 22 + f * 62;
      for (var c = 0; c < 3; c++) s += windowBay(92 + c * 88, y, 40, 40, f < floors - 0 && r() > 0.3, r);
    }
    // ground floor
    var gy = 300 - 34;
    s += '<rect x="60" y="' + (gy - 4) + '" width="280" height="6" fill="#FBF7EF"/>';
    s += '<path d="M178 300v-' + 30 + 'a22 22 0 0 1 44 0v' + 30 + 'z" fill="' + ALMAGRA + '"/>';
    s += '<path d="M200 300v-' + 50 + '" stroke="#5E2416" stroke-width="2"/>';
    s += '<rect x="0" y="296" width="400" height="4" fill="#A88D6F"/>';
    // orange tree
    if (r() > 0.35) s += tree(24 + r() * 10, 300);
    return s;
  }

  function tree(x, base) {
    return (
      '<rect x="' + (x - 3) + '" y="' + (base - 70) + '" width="6" height="70" fill="#6B4A33"/>' +
      '<circle cx="' + x + '" cy="' + (base - 86) + '" r="30" fill="#3E6B45"/>' +
      '<circle cx="' + (x - 14) + '" cy="' + (base - 78) + '" r="18" fill="#4F7F52"/>' +
      '<circle cx="' + (x + 8) + '" cy="' + (base - 96) + '" r="3.6" fill="#EE8A2C"/>' +
      '<circle cx="' + (x - 12) + '" cy="' + (base - 84) + '" r="3.6" fill="#EE8A2C"/>' +
      '<circle cx="' + (x + 16) + '" cy="' + (base - 76) + '" r="3.6" fill="#EE8A2C"/>'
    );
  }

  function giralda(x, base, h) {
    var w = h * 0.16;
    return (
      '<g fill="#D7B48A" opacity=".9">' +
      '<rect x="' + (x - w / 2) + '" y="' + (base - h) + '" width="' + w + '" height="' + h + '"/>' +
      '<rect x="' + (x - w * 0.4) + '" y="' + (base - h - h * 0.14) + '" width="' + w * 0.8 + '" height="' + h * 0.14 + '"/>' +
      '<rect x="' + (x - w * 0.28) + '" y="' + (base - h - h * 0.24) + '" width="' + w * 0.56 + '" height="' + h * 0.1 + '"/>' +
      '<path d="M' + x + " " + (base - h - h * 0.36) + "l" + w * 0.18 + " " + h * 0.12 + "h-" + w * 0.36 + 'z"/></g>'
    );
  }

  function atico(o, id) {
    var r = rng(o.seed || 1);
    var s = sky(id, true);
    s += giralda(300, 190, 150);
    s += '<rect x="0" y="190" width="400" height="110" fill="' + o.wall + '"/>';
    s += '<rect x="0" y="182" width="400" height="10" fill="#FBF7EF"/>';
    // terrace rail
    s += '<g stroke="' + INK + '" stroke-width="1.4">';
    for (var x = 8; x < 400; x += 8) s += '<path d="M' + x + ' 160v22"/>';
    s += '<path d="M0 160h400" stroke-width="2.4"/></g>';
    // pergola
    s += '<g stroke="#6B4A33" stroke-width="5"><path d="M40 70v112M180 70v112"/><path d="M30 72h165" stroke-width="6"/></g>';
    s += '<g stroke="#6B4A33" stroke-width="2.4">';
    for (var p = 44; p < 190; p += 14) s += '<path d="M' + p + ' 66v10"/>';
    s += "</g>";
    s += '<path d="M40 76c20 18 40 -6 60 10s40 -8 70 8" stroke="#4F7F52" stroke-width="7" fill="none" stroke-linecap="round"/>';
    // table & chairs
    s += '<ellipse cx="110" cy="176" rx="34" ry="5" fill="#B9A182"/><rect x="108" y="150" width="4" height="26" fill="' + INK + '"/>';
    s += '<rect x="80" y="146" width="60" height="5" rx="2" fill="#FBF7EF"/>';
    s += '<circle cx="230" cy="168" r="14" fill="#C96B3C"/><rect x="222" y="150" width="16" height="22" rx="3" fill="#B3542E"/><circle cx="230" cy="140" r="16" fill="#4F7F52"/>';
    s += windowBay(70, 222, 40, 50, false, r) + windowBay(180, 222, 40, 50, false, r) + windowBay(290, 222, 40, 50, false, r);
    return s;
  }

  function patio(o, id) {
    var r = rng(o.seed || 1);
    var s = sky(id, false);
    s += '<rect x="0" y="0" width="400" height="300" fill="' + o.wall + '"/>';
    // gallery arches
    s += '<g fill="#EADBC4">';
    for (var a = 0; a < 4; a++) {
      var x = 20 + a * 92;
      s += '<path d="M' + x + ' 240V128a38 38 0 0 1 76 0V240z"/>';
    }
    s += "</g>";
    s += '<g fill="#5A4636" opacity=".18">';
    for (var b = 0; b < 4; b++) {
      var bx = 30 + b * 92;
      s += '<path d="M' + bx + ' 240V134a28 28 0 0 1 56 0V240z"/>';
    }
    s += "</g>";
    // columns
    for (var c = 0; c < 5; c++) {
      var cx = 16 + c * 92;
      s += '<rect x="' + (cx - 5) + '" y="96" width="10" height="148" fill="#FBF7EF"/>';
      s += '<rect x="' + (cx - 9) + '" y="92" width="18" height="8" fill="#E0CFB3"/>';
    }
    s += '<rect x="0" y="80" width="400" height="14" fill="' + ALMAGRA + '" opacity=".8"/>';
    s += '<rect x="0" y="0" width="400" height="80" fill="#F6EEE1"/>';
    for (var w = 0; w < 4; w++) s += windowBay(46 + w * 92, 22, 30, 38, true, r);
    // tiled floor
    s += '<path d="M0 244h400v56H0z" fill="url(#tl' + id + ')"/>';
    // fountain + pots
    s += '<ellipse cx="200" cy="262" rx="44" ry="10" fill="#2D5C9A" opacity=".85"/><ellipse cx="200" cy="258" rx="44" ry="10" fill="#FBF7EF"/><ellipse cx="200" cy="258" rx="36" ry="7" fill="#9CC3D5"/>';
    s += '<rect x="196" y="236" width="8" height="22" fill="#FBF7EF"/><path d="M200 232c-6 6-10 4-14 10M200 232c6 6 10 4 14 10" stroke="#9CC3D5" stroke-width="2" fill="none"/>';
    s += pot(60, 270, r) + pot(340, 270, r) + pot(120, 286, r);
    return s;
  }

  function pot(x, y, r) {
    return (
      '<path d="M' + (x - 12) + " " + (y - 18) + "h24l-4 18h-16z" + '" fill="#B3542E"/>' +
      '<circle cx="' + x + '" cy="' + (y - 30) + '" r="' + (12 + r() * 6) + '" fill="#4F7F52"/>' +
      '<circle cx="' + (x + 5) + '" cy="' + (y - 36) + '" r="3" fill="#D8483A"/>'
    );
  }

  function local(o, id) {
    var r = rng(o.seed || 1);
    var s = sky(id, true);
    s += '<rect x="30" y="40" width="340" height="260" fill="' + o.wall + '"/>';
    s += '<rect x="26" y="30" width="348" height="12" fill="#FBF7EF"/>';
    s += windowBay(70, 62, 46, 50, true, r) + windowBay(178, 62, 46, 50, true, r) + windowBay(286, 62, 46, 50, true, r);
    s += '<rect x="30" y="150" width="340" height="12" fill="' + INK + '"/>';
    s += '<text x="200" y="159.5" text-anchor="middle" font-family="monospace" font-size="8" letter-spacing="3" fill="#F6EEE1">SE VENDE · LOCAL</text>';
    s += '<rect x="48" y="176" width="120" height="110" fill="#CFE0E6"/><rect x="232" y="176" width="120" height="110" fill="#CFE0E6"/>';
    s += '<path d="M48 176l120 110M232 176l60 55" stroke="#FFFFFF" stroke-width="10" opacity=".45"/>';
    s += '<rect x="178" y="176" width="44" height="124" fill="' + ALMAGRA + '"/>';
    s += '<g stroke="' + INK + '" stroke-width="3" fill="none"><rect x="48" y="176" width="120" height="110"/><rect x="232" y="176" width="120" height="110"/></g>';
    s += '<rect x="0" y="296" width="400" height="4" fill="#A88D6F"/>';
    return s;
  }

  var n = 0;
  function art(o, label) {
    n += 1;
    var id = "a" + n;
    var body = o.kind === "atico" ? atico(o, id) : o.kind === "patio" ? patio(o, id) : o.kind === "local" ? local(o, id) : facade(o, id);
    return (
      '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' +
      (label || "Ilustración de inmueble de ejemplo") + '">' + body + "</svg>"
    );
  }

  window.ABADES_ART = art;
})();
