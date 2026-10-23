/* Ilustraciones propias de inmuebles de ejemplo: alzados tipo lámina de arquitecto. */
(function () {
  var TONES = [
    { bg: "#EFE7DA", wall: "#F8F4EC", ink: "#1A1613", acc: "#A33A2B", sky: "#E4D9C6" },
    { bg: "#E9D3C8", wall: "#F6ECE4", ink: "#1A1613", acc: "#2C5AA0", sky: "#E0C2B4" },
    { bg: "#D9E1EC", wall: "#F4F1EA", ink: "#1A1613", acc: "#A33A2B", sky: "#C9D4E4" },
    { bg: "#E6E2CF", wall: "#FAF7EE", ink: "#1A1613", acc: "#B9862F", sky: "#D8D2B6" }
  ];

  function win(x, y, w, h, t, shutter) {
    var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + t.sky + '" stroke="' + t.ink + '" stroke-width="1.6"/>' +
      '<line x1="' + (x + w / 2) + '" y1="' + y + '" x2="' + (x + w / 2) + '" y2="' + (y + h) + '" stroke="' + t.ink + '" stroke-width="1.2"/>';
    if (shutter) s += '<rect x="' + (x - 2) + '" y="' + (y - 6) + '" width="' + (w + 4) + '" height="6" fill="' + t.acc + '"/>';
    return s;
  }
  function balcony(x, y, w, t) {
    var s = '<line x1="' + x + '" y1="' + y + '" x2="' + (x + w) + '" y2="' + y + '" stroke="' + t.ink + '" stroke-width="2"/>';
    for (var i = x + 4; i < x + w; i += 6) s += '<line x1="' + i + '" y1="' + y + '" x2="' + i + '" y2="' + (y + 14) + '" stroke="' + t.ink + '" stroke-width="1"/>';
    return s + '<line x1="' + x + '" y1="' + (y + 14) + '" x2="' + (x + w) + '" y2="' + (y + 14) + '" stroke="' + t.ink + '" stroke-width="1.6"/>';
  }
  function cota(x1, x2, y, label, t) {
    return '<g class="cota" stroke="' + t.acc + '" stroke-width="1" fill="' + t.acc + '">' +
      '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '"/>' +
      '<line x1="' + x1 + '" y1="' + (y - 5) + '" x2="' + x1 + '" y2="' + (y + 5) + '"/>' +
      '<line x1="' + x2 + '" y1="' + (y - 5) + '" x2="' + x2 + '" y2="' + (y + 5) + '"/>' +
      '<text x="' + (x1 + x2) / 2 + '" y="' + (y - 6) + '" text-anchor="middle" font-family="Azeret Mono, monospace" font-size="10" stroke="none">' + label + '</text></g>';
  }
  function sun(t) {
    return '<circle cx="330" cy="58" r="22" fill="none" stroke="' + t.acc + '" stroke-width="1.4"/><circle cx="330" cy="58" r="14" fill="' + t.acc + '" opacity=".18"/>';
  }
  function ground(t) {
    return '<line x1="0" y1="232" x2="400" y2="232" stroke="' + t.ink + '" stroke-width="2"/>' +
      '<g stroke="' + t.ink + '" stroke-width=".8" opacity=".35">' +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(function (i) {
        return '<line x1="' + (i * 22) + '" y1="240" x2="' + (i * 22 + 12) + '" y2="232"/>';
      }).join("") + "</g>";
  }
  function tree(x, t) {
    return '<line x1="' + x + '" y1="232" x2="' + x + '" y2="196" stroke="' + t.ink + '" stroke-width="2"/>' +
      '<circle cx="' + x + '" cy="184" r="18" fill="#7C8C5A" opacity=".55" stroke="' + t.ink + '" stroke-width="1.4"/>' +
      '<circle cx="' + (x + 6) + '" cy="178" r="3" fill="#E39A3B"/><circle cx="' + (x - 7) + '" cy="188" r="3" fill="#E39A3B"/>';
  }

  var KINDS = {
    bloque: function (t) {
      var s = '<rect x="110" y="44" width="180" height="188" fill="' + t.wall + '" stroke="' + t.ink + '" stroke-width="2"/>' +
        '<rect x="104" y="38" width="192" height="8" fill="' + t.ink + '"/>';
      for (var f = 0; f < 4; f++) {
        var y = 60 + f * 40;
        s += win(124, y, 28, 26, t, f % 2 === 0) + win(186, y, 28, 26, t, f % 2 === 1) + win(248, y, 28, 26, t, f % 2 === 0);
        if (f === 1) s += balcony(180, y + 26, 40, t);
      }
      s += '<rect x="186" y="198" width="28" height="34" fill="' + t.acc + '" stroke="' + t.ink + '" stroke-width="1.6"/>';
      return s + tree(70, t) + tree(342, t) + cota(110, 290, 22, "18,40 m", t);
    },
    adosada: function (t) {
      var s = "";
      [70, 170, 270].forEach(function (x, i) {
        var main = i === 1;
        s += '<rect x="' + x + '" y="110" width="100" height="122" fill="' + (main ? t.wall : t.bg) + '" stroke="' + t.ink + '" stroke-width="' + (main ? 2 : 1.2) + '" opacity="' + (main ? 1 : .7) + '"/>' +
          '<path d="M' + (x - 6) + ' 112 L' + (x + 50) + ' 74 L' + (x + 106) + ' 112" fill="' + (main ? t.acc : "none") + '" stroke="' + t.ink + '" stroke-width="' + (main ? 2 : 1.2) + '" opacity="' + (main ? 1 : .7) + '"/>';
        if (main) s += win(186, 128, 26, 26, t, true) + win(228, 128, 26, 26, t, true) + '<rect x="186" y="180" width="28" height="52" fill="' + t.sky + '" stroke="' + t.ink + '" stroke-width="1.6"/>' + win(228, 184, 26, 24, t);
      });
      return s + cota(170, 270, 54, "6,20 m", t);
    },
    atico: function (t) {
      var s = '<rect x="96" y="96" width="208" height="136" fill="' + t.wall + '" stroke="' + t.ink + '" stroke-width="2"/>' +
        '<rect x="150" y="56" width="120" height="40" fill="' + t.wall + '" stroke="' + t.ink + '" stroke-width="2"/>' +
        '<rect x="144" y="50" width="132" height="7" fill="' + t.ink + '"/>' + win(164, 64, 40, 26, t) + win(222, 64, 36, 26, t) +
        balcony(96, 82, 54, t) + '<path d="M106 82 q12 -22 26 0" fill="#7C8C5A" opacity=".6" stroke="' + t.ink + '"/>';
      for (var f = 0; f < 3; f++) for (var c = 0; c < 4; c++) s += win(112 + c * 48, 110 + f * 40, 26, 24, t, c === 1);
      return s + '<rect x="88" y="94" width="224" height="5" fill="' + t.acc + '"/>' + cota(150, 270, 34, "ático · 88 m²", t);
    },
    local: function (t) {
      return '<rect x="80" y="70" width="240" height="162" fill="' + t.wall + '" stroke="' + t.ink + '" stroke-width="2"/>' +
        win(100, 86, 40, 30, t, true) + win(180, 86, 40, 30, t, true) + win(260, 86, 40, 30, t, true) +
        '<path d="M92 136 h216 l-12 22 h-192 z" fill="' + t.acc + '" stroke="' + t.ink + '" stroke-width="1.6"/>' +
        '<g stroke="' + t.wall + '" stroke-width="10" opacity=".35"><line x1="120" y1="137" x2="112" y2="157"/><line x1="160" y1="137" x2="152" y2="157"/><line x1="200" y1="137" x2="192" y2="157"/><line x1="240" y1="137" x2="232" y2="157"/><line x1="280" y1="137" x2="272" y2="157"/></g>' +
        '<rect x="104" y="166" width="150" height="66" fill="' + t.sky + '" stroke="' + t.ink + '" stroke-width="1.6"/>' +
        '<rect x="266" y="166" width="34" height="66" fill="' + t.bg + '" stroke="' + t.ink + '" stroke-width="1.6"/>' +
        cota(104, 254, 254, "5,00 m", t);
    },
    chalet: function (t) {
      return '<rect x="90" y="120" width="220" height="112" fill="' + t.wall + '" stroke="' + t.ink + '" stroke-width="2"/>' +
        '<path d="M78 122 L200 64 L322 122" fill="' + t.acc + '" stroke="' + t.ink + '" stroke-width="2"/>' +
        win(112, 142, 34, 30, t, true) + win(254, 142, 34, 30, t, true) +
        '<rect x="176" y="168" width="48" height="64" fill="' + t.sky + '" stroke="' + t.ink + '" stroke-width="1.6"/>' +
        '<rect x="40" y="220" width="70" height="12" rx="2" fill="#7FB1D6" stroke="' + t.ink + '" stroke-width="1.2"/>' +
        tree(352, t) + cota(90, 310, 44, "parcela 450 m²", t);
    }
  };

  window.FEArt = {
    svg: function (kind, tone, extraClass) {
      var t = TONES[(tone || 0) % TONES.length];
      return '<svg class="art ' + (extraClass || "") + '" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustración de inmueble de ejemplo">' +
        '<rect width="400" height="260" fill="' + t.bg + '"/>' + sun(t) + (KINDS[kind] || KINDS.bloque)(t) + ground(t) + "</svg>";
    }
  };
})();
