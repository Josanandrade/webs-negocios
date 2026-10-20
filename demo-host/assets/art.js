/*
 * Ilustraciones SVG propias para los inmuebles de demostración.
 * Sustituyen a las fotografías hasta que la agencia suba las suyas
 * desde el panel. Sin imágenes de terceros.
 */
(function () {
  var FACHADA = ["#F2E2C0", "#ECD8CE", "#DCE4D2", "#F5EFE3", "#D6DEE7"];
  var CIELO = ["#F7E9CF", "#E8EEF2", "#EFEADF", "#F3E4D4", "#E4ECE6"];
  var INK = "#1F3A5A", ALB = "#D9A43B", VERDE = "#5E7D4F", TEJA = "#B8553A";

  function ventanas(x, y, cols, filas, w, h, gx, gy, color) {
    var s = "";
    for (var f = 0; f < filas; f++) for (var c = 0; c < cols; c++) {
      var vx = x + c * (w + gx), vy = y + f * (h + gy);
      s += '<rect x="' + vx + '" y="' + vy + '" width="' + w + '" height="' + h + '" rx="2" fill="' + color + '"/>' +
        '<rect x="' + (vx - 3) + '" y="' + (vy + h) + '" width="' + (w + 6) + '" height="4" fill="#fff" opacity=".7"/>' +
        '<line x1="' + (vx + w / 2) + '" y1="' + vy + '" x2="' + (vx + w / 2) + '" y2="' + (vy + h) + '" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>';
    }
    return s;
  }
  function arbol(x, y, s) {
    s = s || 1;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-3" y="0" width="6" height="34" fill="#6B4F35"/>' +
      '<circle cx="0" cy="-8" r="24" fill="' + VERDE + '"/><circle cx="-14" cy="4" r="16" fill="#6E8F5E"/><circle cx="14" cy="2" r="17" fill="#4F6E43"/></g>';
  }
  function naranjo(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-2.5" y="0" width="5" height="26" fill="#6B4F35"/>' +
      '<circle cx="0" cy="-10" r="20" fill="#4F6E43"/><circle cx="-8" cy="-14" r="3" fill="' + ALB + '"/><circle cx="7" cy="-6" r="3" fill="' + ALB + '"/><circle cx="2" cy="-20" r="3" fill="' + ALB + '"/></g>';
  }
  function suelo() {
    return '<rect x="0" y="232" width="400" height="48" fill="#E3D6BC"/><rect x="0" y="232" width="400" height="6" fill="#CDBE9E"/>';
  }

  function fachada(forma, t) {
    var f = FACHADA[t % 5], cielo = CIELO[t % 5], s = "";
    s += '<rect width="400" height="280" fill="' + cielo + '"/>';
    s += '<circle cx="330" cy="58" r="26" fill="' + ALB + '" opacity=".55"/>';
    s += '<path d="M0 200 Q60 180 120 196 T260 190 T400 198 V240 H0Z" fill="#E6DCC6"/>';
    if (forma === "bloque") {
      s += '<rect x="96" y="58" width="208" height="176" fill="' + f + '"/><rect x="90" y="50" width="220" height="10" fill="' + INK + '"/>';
      s += ventanas(116, 76, 4, 4, 30, 24, 16, 14, INK);
      for (var i = 0; i < 4; i++) s += '<rect x="110" y="' + (102 + i * 38) + '" width="180" height="3" fill="' + INK + '" opacity=".25"/>';
      s += '<rect x="182" y="198" width="36" height="36" fill="' + INK + '"/><rect x="176" y="194" width="48" height="5" fill="' + ALB + '"/>';
      s += arbol(62, 200, 1) + naranjo(340, 210);
    } else if (forma === "atico") {
      s += '<rect x="80" y="96" width="240" height="138" fill="' + f + '"/>';
      s += '<rect x="120" y="54" width="160" height="44" fill="#fff" opacity=".9"/><rect x="74" y="94" width="252" height="6" fill="' + INK + '"/>';
      s += '<rect x="134" y="62" width="58" height="34" rx="2" fill="' + INK + '"/><rect x="204" y="62" width="62" height="34" rx="2" fill="' + INK + '" opacity=".85"/>';
      s += '<path d="M84 82 h52 M84 82 v12 M110 82 v12 M136 82 v12" stroke="' + INK + '" stroke-width="2" fill="none"/>';
      s += '<rect x="92" y="70" width="10" height="12" fill="' + VERDE + '" rx="5"/><rect x="290" y="70" width="10" height="12" fill="' + VERDE + '" rx="5"/>';
      s += '<path d="M258 54 h40 l-20 -10z" fill="' + ALB + '"/><line x1="278" y1="54" x2="278" y2="94" stroke="' + INK + '" stroke-width="2"/>';
      s += ventanas(102, 116, 5, 3, 28, 22, 14, 16, INK);
      s += arbol(48, 204, .9) + arbol(352, 206, .8);
    } else if (forma === "adosado") {
      for (var k = 0; k < 3; k++) {
        var x = 40 + k * 110, col = k === 1 ? f : FACHADA[(t + k + 2) % 5];
        s += '<rect x="' + x + '" y="110" width="104" height="124" fill="' + col + '"/>';
        s += '<path d="M' + (x - 6) + ' 112 L' + (x + 52) + ' 70 L' + (x + 110) + ' 112Z" fill="' + TEJA + '"' + (k === 1 ? "" : ' opacity=".75"') + '/>';
        s += '<rect x="' + (x + 14) + '" y="126" width="30" height="28" rx="2" fill="' + INK + '"/><rect x="' + (x + 60) + '" y="126" width="30" height="28" rx="2" fill="' + INK + '"/>';
        s += '<rect x="' + (x + 14) + '" y="182" width="34" height="52" fill="' + INK + '" opacity=".9"/><rect x="' + (x + 58) + '" y="190" width="34" height="44" fill="#fff" opacity=".7"/>';
      }
      s += '<rect x="30" y="226" width="340" height="8" fill="#fff" opacity=".6"/>' + naranjo(372, 214);
    } else if (forma === "chalet") {
      s += '<rect x="96" y="112" width="220" height="122" fill="' + f + '"/>';
      s += '<path d="M84 116 L206 52 L328 116Z" fill="' + TEJA + '"/><rect x="262" y="58" width="16" height="34" fill="#8A4A35"/>';
      s += '<rect x="122" y="136" width="44" height="40" rx="2" fill="' + INK + '"/><rect x="246" y="136" width="44" height="40" rx="2" fill="' + INK + '"/>';
      s += '<path d="M186 234 V172 a20 20 0 0 1 40 0 V234Z" fill="' + INK + '"/>';
      s += '<rect x="60" y="214" width="290" height="20" fill="' + VERDE + '" opacity=".7" rx="10"/>';
      s += arbol(56, 196, 1.1) + naranjo(348, 206);
    } else {
      s += '<rect x="70" y="70" width="260" height="164" fill="' + f + '"/><rect x="70" y="70" width="260" height="34" fill="#fff" opacity=".6"/>';
      s += ventanas(96, 78, 4, 1, 40, 18, 22, 0, INK);
      s += '<rect x="86" y="132" width="228" height="20" fill="' + ALB + '"/><path d="M86 152 h228 l-10 14 h-208z" fill="' + INK + '" opacity=".2"/>';
      s += '<rect x="96" y="160" width="150" height="74" fill="#BFD0DA"/><path d="M96 160 l60 74 M150 160 l60 74" stroke="#fff" stroke-opacity=".5" stroke-width="6"/>';
      s += '<rect x="258" y="160" width="46" height="74" fill="' + INK + '"/>';
      s += '<text x="200" y="147" text-anchor="middle" font-family="Bitter, serif" font-size="12" font-weight="700" fill="' + INK + '" letter-spacing="3">SE ALQUILA</text>';
    }
    s += suelo();
    return s;
  }

  function salon(t) {
    var pared = FACHADA[(t + 3) % 5];
    return '<rect width="400" height="280" fill="' + pared + '"/><rect y="214" width="400" height="66" fill="#D9C7A6"/>' +
      '<path d="M0 214 H400" stroke="#BFA97F" stroke-width="3"/>' +
      '<rect x="230" y="40" width="130" height="130" fill="' + CIELO[t % 5] + '" stroke="#fff" stroke-width="8"/><line x1="295" y1="40" x2="295" y2="170" stroke="#fff" stroke-width="5"/>' +
      '<circle cx="270" cy="88" r="16" fill="' + ALB + '" opacity=".6"/>' +
      '<rect x="40" y="150" width="170" height="54" rx="14" fill="' + INK + '"/><rect x="40" y="128" width="170" height="40" rx="14" fill="#2C4C72"/>' +
      '<rect x="40" y="200" width="10" height="16" fill="#6B4F35"/><rect x="200" y="200" width="10" height="16" fill="#6B4F35"/>' +
      '<rect x="70" y="140" width="36" height="26" rx="8" fill="' + ALB + '"/><ellipse cx="200" cy="246" rx="120" ry="16" fill="#C9B48A"/>' +
      '<rect x="230" y="186" width="80" height="8" rx="4" fill="#6B4F35"/><rect x="240" y="194" width="6" height="26" fill="#6B4F35"/><rect x="294" y="194" width="6" height="26" fill="#6B4F35"/>' +
      '<rect x="368" y="160" width="20" height="56" rx="4" fill="#B8553A"/><circle cx="378" cy="146" r="22" fill="' + VERDE + '"/>' +
      '<line x1="110" y1="0" x2="110" y2="60" stroke="' + INK + '" stroke-width="2"/><path d="M90 76 L110 56 L130 76Z" fill="' + ALB + '"/>';
  }
  function cocina(t) {
    return '<rect width="400" height="280" fill="#F5F0E6"/>' +
      '<g fill="#E8E0CF">' + Array.from({ length: 10 }, function (_, i) { return '<rect x="' + (i * 40 + 2) + '" y="120" width="36" height="16"/><rect x="' + (i * 40 + 22) + '" y="138" width="36" height="16"/>'; }).join("") + '</g>' +
      '<rect x="20" y="40" width="360" height="70" fill="' + FACHADA[(t + 2) % 5] + '"/>' +
      '<line x1="110" y1="40" x2="110" y2="110" stroke="#fff" stroke-width="3"/><line x1="200" y1="40" x2="200" y2="110" stroke="#fff" stroke-width="3"/><line x1="290" y1="40" x2="290" y2="110" stroke="#fff" stroke-width="3"/>' +
      '<rect x="20" y="160" width="360" height="12" fill="' + INK + '"/><rect x="20" y="172" width="360" height="80" fill="' + FACHADA[(t + 2) % 5] + '"/>' +
      '<line x1="110" y1="172" x2="110" y2="252" stroke="#fff" stroke-width="3"/><line x1="200" y1="172" x2="200" y2="252" stroke="#fff" stroke-width="3"/><line x1="290" y1="172" x2="290" y2="252" stroke="#fff" stroke-width="3"/>' +
      '<rect x="216" y="146" width="60" height="14" rx="3" fill="#C9C1B2"/><rect x="232" y="132" width="26" height="14" rx="4" fill="' + TEJA + '"/>' +
      '<circle cx="80" cy="150" r="10" fill="' + VERDE + '"/><rect x="74" y="148" width="12" height="12" fill="' + ALB + '"/>' +
      '<rect y="252" width="400" height="28" fill="#CDBE9E"/>';
  }
  function dormitorio(t) {
    return '<rect width="400" height="280" fill="' + CIELO[(t + 1) % 5] + '"/><rect y="220" width="400" height="60" fill="#D9C7A6"/>' +
      '<rect x="110" y="70" width="180" height="70" rx="10" fill="' + INK + '"/>' +
      '<rect x="80" y="140" width="240" height="70" rx="8" fill="#fff"/><rect x="80" y="170" width="240" height="44" rx="6" fill="' + ALB + '" opacity=".85"/>' +
      '<rect x="110" y="122" width="70" height="28" rx="10" fill="#F5EFE3"/><rect x="220" y="122" width="70" height="28" rx="10" fill="#F5EFE3"/>' +
      '<rect x="24" y="160" width="44" height="50" fill="#6B4F35"/><circle cx="46" cy="140" r="12" fill="#F2E2C0"/><rect x="43" y="150" width="6" height="12" fill="' + INK + '"/>' +
      '<rect x="332" y="160" width="44" height="50" fill="#6B4F35"/><circle cx="354" cy="146" r="16" fill="' + VERDE + '"/>' +
      '<rect x="80" y="210" width="10" height="12" fill="#6B4F35"/><rect x="310" y="210" width="10" height="12" fill="#6B4F35"/>' +
      '<rect x="160" y="24" width="80" height="36" fill="#fff" opacity=".7"/><path d="M168 52 l20 -18 l16 12 l14 -10 l14 16z" fill="' + VERDE + '" opacity=".7"/>';
  }
  function exterior(t) {
    return '<rect width="400" height="280" fill="#E7EEF0"/><rect y="150" width="400" height="130" fill="#7FB3C8"/>' +
      '<path d="M0 170 Q50 162 100 170 T200 170 T300 170 T400 170" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>' +
      '<path d="M0 200 Q50 192 100 200 T200 200 T300 200 T400 200" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none"/>' +
      '<rect y="230" width="400" height="50" fill="#EADFC8"/><rect y="140" width="400" height="12" fill="#F5EFE3"/>' +
      '<rect x="40" y="206" width="70" height="10" rx="5" fill="#fff"/><rect x="60" y="216" width="6" height="16" fill="#C9C1B2"/>' +
      '<path d="M300 236 V120" stroke="#6B4F35" stroke-width="5"/><path d="M250 132 Q300 96 350 132Z" fill="' + ALB + '"/>' +
      arbol(60, 108, .9) + arbol(350, 104, 1) + naranjo(180, 114);
  }

  var VISTAS = { fachada: "Exterior", salon: "Salón", cocina: "Cocina", dormitorio: "Dormitorio", exterior: "Zona común" };

  function svg(inner, label) {
    return '<svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + label + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }

  window.VILLALON_ART = {
    VISTAS: VISTAS,
    portada: function (p) { return svg(fachada(p.arte.forma, p.arte.tono), "Ilustración de " + p.titulo.toLowerCase()); },
    galeria: function (p) {
      var t = p.arte.tono, out = [{ k: "fachada", svg: svg(fachada(p.arte.forma, t), "Exterior") }];
      if (p.tipo === "Local") return out.concat([{ k: "salon", svg: svg(cocina(t), "Interior") }]);
      out.push({ k: "salon", svg: svg(salon(t), "Salón") }, { k: "cocina", svg: svg(cocina(t), "Cocina") }, { k: "dormitorio", svg: svg(dormitorio(t), "Dormitorio") });
      if (p.extras.some(function (e) { return /piscina|jard|terraza/i.test(e); })) out.push({ k: "exterior", svg: svg(exterior(t), "Zona exterior") });
      return out;
    }
  };
})();
