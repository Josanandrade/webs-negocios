/*
 * Ilustraciones SVG propias para los inmuebles de demostración.
 * Sustituyen a las fotos reales hasta que el cliente suba las suyas desde el panel.
 * HogarArt.svg(inmueble, vista) → cadena SVG. Vistas: fachada, salon, cocina, dormitorio, bano, exterior.
 */
(function () {
  var uid = 0;
  var INK = '#23304A';
  var WARM = '#F2B544';

  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, Math.min(255, (n >> 16) + amt));
    var g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    var b = Math.max(0, Math.min(255, (n & 255) + amt));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  function wrap(body, label, defs) {
    return '<svg viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + label +
      '" preserveAspectRatio="xMidYMid slice">' + (defs ? '<defs>' + defs + '</defs>' : '') + body + '</svg>';
  }

  function sky(id, warm) {
    return '<linearGradient id="sky' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' +
      (warm ? '#F9D9B8' : '#CFE3EA') + '"/><stop offset="1" stop-color="' + (warm ? '#FDF1E2' : '#F5EEDF') + '"/></linearGradient>';
  }

  function tree(x, y, s, c) {
    c = c || '#7FA584';
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-6" y="-10" width="12" height="70" rx="5" fill="#8A6A4F"/>' +
      '<circle cx="0" cy="-40" r="46" fill="' + c + '"/><circle cx="-30" cy="-12" r="30" fill="' + shade(c, -18) + '"/><circle cx="30" cy="-18" r="32" fill="' + shade(c, 12) + '"/></g>';
  }

  function palm(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="#5E8C66"><path d="M-4 0 Q4 -80 0 -150 L8 -150 Q12 -80 6 0Z" fill="#9C7A5A"/>' +
      '<path d="M4 -150 Q-50 -170 -90 -130 Q-40 -150 4 -140Z"/><path d="M4 -150 Q60 -175 96 -128 Q46 -150 4 -140Z"/><path d="M4 -152 Q-20 -200 -64 -205 Q-20 -180 2 -146Z"/><path d="M4 -152 Q40 -200 76 -200 Q30 -178 6 -146Z"/></g>';
  }

  function win(x, y, w, h, lit, frame) {
    frame = frame || '#FFFFFF';
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="' + frame + '"/>' +
      '<rect x="' + (x + 5) + '" y="' + (y + 5) + '" width="' + (w - 10) + '" height="' + (h - 10) + '" rx="2" fill="' + (lit ? '#FCE3A4' : '#BFD5DE') + '"/>' +
      '<rect x="' + (x + w / 2 - 1.5) + '" y="' + (y + 5) + '" width="3" height="' + (h - 10) + '" fill="' + frame + '"/>';
  }

  function ground(id, extra) {
    return '<rect x="0" y="470" width="800" height="90" fill="#E7D7BF"/><rect x="0" y="462" width="800" height="12" fill="#CDBBA0"/>' + (extra || '');
  }

  // ── Fachadas ───────────────────────────────────────────────────────────────
  var FACHADAS = {
    piso: function (p, id) {
      var wall = p.pared, acc = p.acento, s = '';
      s += '<rect x="170" y="70" width="460" height="400" fill="' + wall + '"/><rect x="170" y="60" width="460" height="16" fill="' + shade(wall, -30) + '"/>';
      for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 3; c++) {
          var x = 205 + c * 145, y = 100 + r * 88;
          s += win(x, y, 100, 62, (r + c) % 3 === 0);
          if (c !== 1) s += '<rect x="' + (x - 8) + '" y="' + (y + 60) + '" width="116" height="8" rx="2" fill="' + acc + '"/><rect x="' + (x - 6) + '" y="' + (y + 40) + '" width="112" height="22" fill="none" stroke="' + INK + '" stroke-opacity=".5" stroke-width="2"/>';
        }
      }
      s += '<rect x="360" y="410" width="80" height="60" fill="' + INK + '"/><rect x="368" y="418" width="64" height="52" fill="#9DB6C2"/>';
      return '<rect width="800" height="560" fill="url(#sky' + id + ')"/><circle cx="660" cy="90" r="42" fill="#FBE3B4"/>' + s + ground(id) + tree(110, 430, 1.1) + tree(700, 440, 0.9, '#94B89A');
    },
    atico: function (p, id) {
      var s = FACHADAS.piso(p, id);
      s += '<rect x="230" y="20" width="340" height="44" fill="' + shade(p.pared, 8) + '"/>' + win(260, 28, 70, 30, true) + win(350, 28, 70, 30, true);
      s += '<rect x="170" y="56" width="460" height="6" fill="' + INK + '"/><g stroke="' + INK + '" stroke-width="3">' +
        [190, 215, 240, 590, 610].map(function (x) { return '<line x1="' + x + '" y1="38" x2="' + x + '" y2="58"/>'; }).join('') + '</g>';
      s += '<path d="M470 12 L540 26 L470 30Z" fill="' + p.acento + '"/><line x1="505" y1="18" x2="505" y2="58" stroke="' + INK + '" stroke-width="3"/>';
      s += '<circle cx="600" cy="42" r="14" fill="#7FA584"/><rect x="592" y="46" width="16" height="12" fill="#B4462A"/>';
      return s;
    },
    duplex: function (p, id) {
      var wall = p.pared, s = '';
      s += '<rect x="150" y="150" width="500" height="320" fill="' + wall + '"/><rect x="150" y="140" width="500" height="14" fill="' + shade(wall, -30) + '"/>';
      s += '<rect x="400" y="60" width="250" height="90" fill="' + shade(wall, -10) + '"/><rect x="390" y="52" width="270" height="12" fill="' + INK + '"/>';
      s += win(430, 80, 80, 54, true) + win(540, 80, 80, 54, false);
      s += win(190, 190, 120, 80, false) + win(350, 190, 120, 80, true) + win(510, 190, 110, 80, false);
      s += '<rect x="340" y="268" width="140" height="8" fill="' + p.acento + '"/>';
      s += win(190, 320, 120, 80, true) + '<rect x="360" y="330" width="80" height="140" rx="4" fill="' + p.acento + '"/><circle cx="425" cy="402" r="4" fill="#FFF"/>' + win(500, 320, 120, 80, false);
      return '<rect width="800" height="560" fill="url(#sky' + id + ')"/>' + s + ground(id) + tree(90, 440, 1) + tree(720, 430, 1.1, '#94B89A');
    },
    adosado: function (p, id) {
      var s = '', w = p.pared;
      [[60, shade(w, -14), false], [530, shade(w, -8), false], [295, w, true]].forEach(function (h) {
        var x = h[0], col = h[1], main = h[2];
        s += '<rect x="' + x + '" y="200" width="210" height="270" fill="' + col + '"/>';
        s += '<path d="M' + (x - 14) + ' 206 L' + (x + 105) + ' 110 L' + (x + 224) + ' 206Z" fill="' + (main ? p.acento : shade(p.acento, -20)) + '"/>';
        s += win(x + 30, 230, 64, 60, main) + win(x + 116, 230, 64, 60, false);
        s += '<rect x="' + (x + 30) + '" y="350" width="62" height="120" rx="4" fill="' + INK + '"/>' + win(x + 116, 350, 64, 66, main);
        if (main) s += '<rect x="' + (x + 70) + '" y="146" width="70" height="44" fill="' + shade(w, -6) + '"/>' + win(x + 82, 152, 46, 34, true);
      });
      s += '<rect x="0" y="440" width="800" height="30" fill="#A9C6A8"/>';
      return '<rect width="800" height="560" fill="url(#sky' + id + ')"/><circle cx="120" cy="90" r="40" fill="#FBE3B4"/>' + s + ground(id);
    },
    casa: function (p, id) {
      var s = '', w = '#FFFFFF';
      s += '<rect x="140" y="170" width="520" height="300" fill="' + w + '"/>';
      s += '<path d="M120 178 L400 92 L680 178Z" fill="' + p.acento + '"/>';
      for (var i = 0; i < 12; i++) s += '<path d="M' + (150 + i * 44) + ' 172 q22 -14 44 0" fill="none" stroke="' + shade(p.acento, -30) + '" stroke-width="3"/>';
      s += '<rect x="140" y="440" width="520" height="30" fill="#F2B544" opacity=".55"/>';
      s += '<path d="M352 470 V350 a48 48 0 0 1 96 0 V470Z" fill="#6B3F2A"/><path d="M362 470 V354 a38 38 0 0 1 76 0 V470Z" fill="#8A5639"/>';
      [[190, 230], [510, 230], [190, 340], [530, 340]].forEach(function (pt) {
        s += '<rect x="' + pt[0] + '" y="' + pt[1] + '" width="80" height="90" fill="#BFD5DE"/>';
        for (var k = 1; k < 5; k++) s += '<line x1="' + (pt[0] + k * 16) + '" y1="' + pt[1] + '" x2="' + (pt[0] + k * 16) + '" y2="' + (pt[1] + 90) + '" stroke="' + INK + '" stroke-width="3"/>';
        s += '<rect x="' + (pt[0] - 6) + '" y="' + (pt[1] + 86) + '" width="92" height="8" fill="' + INK + '"/>';
        s += '<circle cx="' + (pt[0] + 20) + '" cy="' + (pt[1] + 82) + '" r="9" fill="#D65A36"/><circle cx="' + (pt[0] + 60) + '" cy="' + (pt[1] + 82) + '" r="9" fill="#E9708B"/>';
      });
      s += '<rect x="340" y="230" width="120" height="70" fill="#BFD5DE"/><rect x="334" y="296" width="132" height="8" fill="' + INK + '"/>';
      return '<rect width="800" height="560" fill="url(#sky' + id + ')"/><circle cx="640" cy="80" r="44" fill="#FBE3B4"/>' + s + ground(id) + tree(70, 450, 0.9);
    },
    chalet: function (p, id) {
      var s = '', w = p.pared;
      s += '<rect x="120" y="190" width="380" height="240" fill="' + w + '"/><rect x="420" y="120" width="260" height="310" fill="' + shade(w, -10) + '"/>';
      s += '<rect x="108" y="180" width="404" height="16" fill="' + p.acento + '"/><rect x="408" y="110" width="284" height="16" fill="' + p.acento + '"/>';
      s += win(150, 220, 150, 90, true) + win(330, 220, 70, 90, false) + win(450, 150, 200, 110, false);
      s += '<rect x="150" y="340" width="230" height="90" fill="#CBDFE6"/><line x1="265" y1="340" x2="265" y2="430" stroke="#FFF" stroke-width="5"/>';
      s += '<rect x="460" y="300" width="70" height="130" rx="4" fill="' + INK + '"/>' + win(560, 300, 90, 80, true);
      s += '<rect x="0" y="430" width="800" height="40" fill="#A9C6A8"/>';
      s += '<path d="M150 478 h420 l30 50 h-480z" fill="#5FB3C9"/><path d="M190 494 q30 -8 60 0 t60 0 t60 0 t60 0" fill="none" stroke="#DDF1F5" stroke-width="4"/>';
      return '<rect width="800" height="560" fill="url(#sky' + id + ')"/><circle cx="110" cy="90" r="40" fill="#FBE3B4"/>' + s.replace('<path d="M150 478', ground(id) + '<path d="M150 478') + palm(720, 470, 1.2);
    },
    local: function (p, id) {
      var s = '';
      s += '<rect x="80" y="120" width="640" height="350" fill="' + p.pared + '"/>';
      s += win(150, 150, 130, 80, false) + win(335, 150, 130, 80, false) + win(520, 150, 130, 80, false);
      s += '<rect x="120" y="270" width="560" height="200" fill="' + INK + '"/><rect x="140" y="300" width="380" height="170" fill="#BFD5DE"/><rect x="540" y="300" width="120" height="170" fill="#9DB6C2"/>';
      s += '<path d="M110 250 h580 l-20 36 h-540z" fill="' + p.acento + '"/>';
      for (var i = 0; i < 10; i++) s += '<path d="M' + (130 + i * 54) + ' 286 h54 l-27 18z" fill="' + (i % 2 ? '#FFF' : p.acento) + '"/>';
      s += '<rect x="240" y="330" width="180" height="40" rx="4" fill="#FFF" opacity=".7"/>';
      return '<rect width="800" height="560" fill="url(#sky' + id + ')"/>' + s + ground(id);
    }
  };

  // ── Interiores ─────────────────────────────────────────────────────────────
  function room(wall, floor) {
    return '<rect width="800" height="560" fill="' + wall + '"/><rect y="400" width="800" height="160" fill="' + floor + '"/>' +
      '<rect y="396" width="800" height="8" fill="' + shade(floor, -26) + '"/>';
  }
  function bigWindow(x, y, w, h) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#FFFFFF"/><rect x="' + (x + 10) + '" y="' + (y + 10) + '" width="' + (w - 20) + '" height="' + (h - 20) + '" fill="#CFE3EA"/>' +
      '<circle cx="' + (x + w * 0.7) + '" cy="' + (y + h * 0.35) + '" r="22" fill="#FBE3B4"/><rect x="' + (x + w / 2 - 3) + '" y="' + (y + 10) + '" width="6" height="' + (h - 20) + '" fill="#FFFFFF"/>';
  }
  function plant(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-22 0 h44 l-6 46 h-32z" fill="#D65A36"/>' +
      '<path d="M0 0 Q-40 -60 -10 -110 Q-6 -50 0 0Z" fill="#5E8C66"/><path d="M0 0 Q40 -50 20 -100 Q8 -40 0 0Z" fill="#7FA584"/><path d="M0 0 Q-50 -20 -56 -60 Q-20 -30 0 0Z" fill="#94B89A"/></g>';
  }

  var INTERIORES = {
    salon: function (p) {
      var a = p.acento;
      return room('#F4EADC', '#D9B98F') + bigWindow(470, 90, 240, 230) +
        '<rect x="90" y="120" width="140" height="100" fill="#FFFFFF"/><rect x="100" y="130" width="120" height="80" fill="' + shade(a, 60) + '"/><circle cx="140" cy="175" r="22" fill="' + WARM + '"/>' +
        '<ellipse cx="330" cy="500" rx="270" ry="40" fill="' + shade(a, 50) + '" opacity=".6"/>' +
        '<rect x="90" y="300" width="380" height="120" rx="22" fill="' + a + '"/><rect x="110" y="270" width="340" height="80" rx="20" fill="' + shade(a, 16) + '"/>' +
        '<rect x="70" y="320" width="50" height="100" rx="18" fill="' + shade(a, -14) + '"/><rect x="440" y="320" width="50" height="100" rx="18" fill="' + shade(a, -14) + '"/>' +
        '<rect x="150" y="290" width="70" height="50" rx="12" fill="' + WARM + '"/><rect x="330" y="290" width="70" height="50" rx="12" fill="#FFF6E6"/>' +
        '<rect x="240" y="440" width="200" height="16" rx="6" fill="' + INK + '"/><rect x="260" y="456" width="10" height="40" fill="' + INK + '"/><rect x="410" y="456" width="10" height="40" fill="' + INK + '"/>' +
        '<circle cx="300" cy="432" r="10" fill="#FFF"/><line x1="620" y1="200" x2="620" y2="420" stroke="' + INK + '" stroke-width="5"/><path d="M590 200 h60 l-14 -44 h-32z" fill="' + WARM + '"/>' + plant(720, 400, 1.1);
    },
    cocina: function (p) {
      var a = p.acento, s = room('#F7F0E6', '#C9B79C');
      for (var i = 0; i < 12; i++) for (var j = 0; j < 3; j++) s += '<rect x="' + (60 + i * 58) + '" y="' + (250 + j * 30) + '" width="54" height="26" fill="#FFFFFF" stroke="#E6DCCC"/>';
      s += '<rect x="60" y="90" width="300" height="130" fill="' + a + '"/><line x1="160" y1="90" x2="160" y2="220" stroke="' + shade(a, -30) + '" stroke-width="3"/><line x1="260" y1="90" x2="260" y2="220" stroke="' + shade(a, -30) + '" stroke-width="3"/>';
      s += bigWindow(420, 80, 200, 150);
      s += '<rect x="50" y="340" width="700" height="20" fill="#E9E3D8"/><rect x="60" y="360" width="680" height="120" fill="' + a + '"/>';
      for (var k = 0; k < 5; k++) s += '<line x1="' + (60 + k * 136) + '" y1="360" x2="' + (60 + k * 136) + '" y2="480" stroke="' + shade(a, -30) + '" stroke-width="3"/><rect x="' + (110 + k * 136) + '" y="378" width="36" height="5" rx="2" fill="#FFF"/>';
      s += '<rect x="190" y="320" width="90" height="22" rx="4" fill="' + INK + '"/><circle cx="560" cy="318" r="22" fill="#F2B544"/><rect x="540" y="300" width="40" height="8" fill="#B4462A"/>';
      s += '<rect x="640" y="230" width="60" height="110" rx="6" fill="#E5E5E5"/>' + plant(700, 300, 0.6);
      return s;
    },
    dormitorio: function (p) {
      var a = p.acento;
      return room('#EEE4F0', '#D7BE9C') + bigWindow(560, 100, 170, 200) +
        '<rect x="150" y="150" width="320" height="130" rx="18" fill="' + INK + '"/>' +
        '<rect x="130" y="270" width="360" height="160" rx="14" fill="#FFFFFF"/><rect x="130" y="320" width="360" height="110" rx="14" fill="' + a + '"/>' +
        '<rect x="170" y="250" width="110" height="50" rx="16" fill="#FFF6E6"/><rect x="300" y="250" width="110" height="50" rx="16" fill="#FFF6E6"/>' +
        '<rect x="40" y="320" width="70" height="80" rx="6" fill="#C79B6D"/><rect x="510" y="320" width="70" height="80" rx="6" fill="#C79B6D"/>' +
        '<path d="M60 320 l14 -44 h22 l14 44z" fill="' + WARM + '"/><path d="M530 320 l14 -44 h22 l14 44z" fill="' + WARM + '"/>' +
        '<ellipse cx="310" cy="500" rx="240" ry="30" fill="#FFFFFF" opacity=".5"/>' + plant(690, 410, 0.9);
    },
    bano: function (p) {
      var a = p.acento, s = room('#E8F0EE', '#BFCFCB');
      for (var i = 0; i < 14; i++) for (var j = 0; j < 7; j++) s += '<rect x="' + (i * 58) + '" y="' + (j * 58) + '" width="56" height="56" fill="#F7FAF9" stroke="#D6E3E0"/>';
      s += '<rect x="80" y="300" width="360" height="130" rx="40" fill="#FFFFFF"/><rect x="80" y="300" width="360" height="22" rx="10" fill="#E3ECEA"/>';
      s += '<path d="M120 300 V150 a30 30 0 0 1 60 0" fill="none" stroke="#8C9A9B" stroke-width="8"/>';
      s += '<rect x="520" y="110" width="160" height="170" rx="80" fill="#DDEFF4" stroke="' + a + '" stroke-width="8"/>';
      s += '<rect x="500" y="300" width="200" height="30" rx="10" fill="#FFFFFF"/><rect x="510" y="330" width="180" height="90" rx="6" fill="' + a + '"/>';
      s += '<rect x="250" y="250" width="80" height="12" rx="6" fill="#FFF6E6"/>' + plant(740, 380, 0.6);
      return s;
    },
    exterior: function (p, id) {
      var has = function (k) { return (p.extras || []).indexOf(k) > -1; };
      var s = '<rect width="800" height="560" fill="url(#sky' + id + ')"/>';
      s += '<rect x="0" y="120" width="800" height="230" fill="#FFFFFF"/><rect x="0" y="110" width="800" height="14" fill="' + p.acento + '"/>';
      for (var i = 0; i < 6; i++) s += '<path d="M' + (40 + i * 130) + ' 124 v226" stroke="#EADFCF" stroke-width="2"/>';
      s += '<rect x="0" y="350" width="800" height="210" fill="#E9C9A6"/>';
      for (var k = 0; k < 10; k++) s += '<line x1="' + (k * 90) + '" y1="350" x2="' + (k * 90 - 60) + '" y2="560" stroke="#D4AF89" stroke-width="3"/>';
      if (has('piscina')) s += '<path d="M380 400 h380 l30 140 h-440z" fill="#5FB3C9"/><path d="M420 450 q30 -8 60 0 t60 0 t60 0 t60 0" fill="none" stroke="#DDF1F5" stroke-width="4"/>';
      s += '<ellipse cx="200" cy="470" rx="110" ry="20" fill="#C9A47E"/><rect x="110" y="400" width="180" height="14" rx="6" fill="' + INK + '"/><rect x="190" y="414" width="12" height="56" fill="' + INK + '"/>';
      s += '<path d="M200 230 L90 300 h220z" fill="' + p.acento + '"/><line x1="200" y1="300" x2="200" y2="400" stroke="' + INK + '" stroke-width="5"/>';
      s += '<rect x="80" y="380" width="40" height="60" rx="8" fill="' + WARM + '"/><rect x="290" y="380" width="40" height="60" rx="8" fill="' + WARM + '"/>';
      s += plant(40, 470, 1.1) + plant(350, 340, 0.8) + tree(720, 330, 0.8);
      return s;
    }
  };

  var NOMBRES = { fachada: 'Fachada', salon: 'Salón', cocina: 'Cocina', dormitorio: 'Dormitorio', bano: 'Baño', exterior: 'Exterior' };

  function svg(p, vista) {
    vista = vista || 'fachada';
    var id = 'h' + (++uid);
    var arte = p.arte || { fachada: 'piso', pared: '#F1E2D0', acento: '#D65A36' };
    var ctx = { pared: arte.pared, acento: arte.acento, extras: p.extras };
    var body = vista === 'fachada' ? (FACHADAS[arte.fachada] || FACHADAS.piso)(ctx, id)
      : (INTERIORES[vista] || INTERIORES.salon)(ctx, id);
    return wrap(body, (NOMBRES[vista] || '') + ' · ' + (p.titulo || 'inmueble') + ' (ilustración de demostración)', sky(id, vista === 'exterior'));
  }

  function vistas(p) {
    if (p.tipo === 'Local') return ['fachada', 'salon'];
    var v = ['fachada', 'salon', 'cocina', 'dormitorio', 'bano'];
    var ex = p.extras || [];
    if (ex.indexOf('piscina') > -1 || ex.indexOf('patio') > -1 || ex.indexOf('terraza') > -1) v.splice(2, 0, 'exterior');
    return v;
  }

  window.HogarArt = { svg: svg, vistas: vistas, nombres: NOMBRES };
})();
