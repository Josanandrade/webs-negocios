/* Servicio Propiedad Inmobiliaria — datos de demostración e ilustraciones.
   Todos los inmuebles, consultas y solicitudes son DATOS DE EJEMPLO:
   no corresponden a la cartera real del negocio. */
(function () {
  const BUSINESS = {
    name: 'Servicio Propiedad Inmobiliaria',
    legal: 'Servicio Propiedad Inmobiliaria S.L.',
    phone: '954 77 84 51',
    tel: '+34954778451',
    address: 'C/ Agrupación Artística Coriana, 29 · Casa 2',
    city: '41100 Coria del Río, Sevilla',
  };

  const PROPS = [
    { ref: 'REF-001', title: 'Casa de pueblo con patio', type: 'Casa', op: 'venta', price: 168000,
      zone: 'Coria del Río · Centro', beds: 4, baths: 2, m2: 142, status: 'disponible', published: true,
      art: 'casa', sky: 'dia', tint: '#EFD9A6',
      desc: 'Casa encalada de dos plantas con patio interior, cocina independiente y azotea transitable.',
      feats: ['Patio', 'Azotea', 'Cocina independiente', 'Reja original'], views: 412, leads: 6 },
    { ref: 'REF-002', title: 'Piso de 3 dormitorios cerca del río', type: 'Piso', op: 'venta', price: 119000,
      zone: 'Coria del Río · Junto al río', beds: 3, baths: 1, m2: 88, status: 'reservado', published: true,
      art: 'piso', sky: 'tarde', tint: '#D9C2A7',
      desc: 'Tercera planta con ascensor, salón con balcón y orientación sur.',
      feats: ['Ascensor', 'Balcón', 'Orientación sur'], views: 298, leads: 4 },
    { ref: 'REF-003', title: 'Adosado con garaje y patio trasero', type: 'Adosado', op: 'venta', price: 214000,
      zone: 'Coria del Río · Cerro de San Juan', beds: 4, baths: 3, m2: 156, status: 'disponible', published: true,
      art: 'adosado', sky: 'dia', tint: '#E7C9B5',
      desc: 'Vivienda en tres alturas con garaje, patio trasero y dormitorio en planta baja.',
      feats: ['Garaje', 'Patio', 'Aire acondicionado', 'Trastero'], views: 356, leads: 5 },
    { ref: 'REF-004', title: 'Ático con terraza', type: 'Ático', op: 'alquiler', price: 750,
      zone: 'Coria del Río · Centro', beds: 2, baths: 1, m2: 70, status: 'disponible', published: true,
      art: 'atico', sky: 'tarde', tint: '#F1E4C8',
      desc: 'Ático luminoso con terraza de 25 m², amueblado y con aire acondicionado.',
      feats: ['Terraza', 'Amueblado', 'Aire acondicionado'], views: 521, leads: 9 },
    { ref: 'REF-005', title: 'Local comercial a pie de calle', type: 'Local', op: 'alquiler', price: 600,
      zone: 'Coria del Río · Zona comercial', beds: 0, baths: 1, m2: 95, status: 'alquilado', published: true,
      art: 'local', sky: 'dia', tint: '#E3DCCB',
      desc: 'Local diáfano con escaparate, aseo y salida de humos.',
      feats: ['Escaparate', 'Diáfano', 'Salida de humos'], views: 187, leads: 2 },
    { ref: 'REF-006', title: 'Chalet con piscina', type: 'Chalet', op: 'venta', price: 289000,
      zone: 'Entorno · La Puebla del Río', beds: 5, baths: 3, m2: 240, status: 'vendido', published: true,
      art: 'chalet', sky: 'dia', tint: '#F4EEDF',
      desc: 'Chalet independiente en parcela de 600 m² con piscina y porche.',
      feats: ['Piscina', 'Parcela', 'Porche', 'Barbacoa'], views: 640, leads: 11 },
    { ref: 'REF-007', title: 'Piso de 2 dormitorios reformado', type: 'Piso', op: 'alquiler', price: 620,
      zone: 'Entorno · Gelves', beds: 2, baths: 1, m2: 64, status: 'disponible', published: false,
      art: 'piso', sky: 'tarde', tint: '#CFD8D6',
      desc: 'Piso reformado, cocina nueva y suelo porcelánico.',
      feats: ['Reformado', 'Cocina nueva'], views: 0, leads: 0 },
    { ref: 'REF-008', title: 'Solar urbano', type: 'Solar', op: 'venta', price: 58000,
      zone: 'Entorno · Almensilla', beds: 0, baths: 0, m2: 310, status: 'disponible', published: false,
      art: 'solar', sky: 'dia', tint: '#E6D3A8',
      desc: 'Solar urbano con todos los servicios a pie de parcela.',
      feats: ['Servicios a pie de parcela', 'Esquina'], views: 0, leads: 0 },
  ];

  const STATUS = {
    disponible: { label: 'Disponible', cls: 'ok' },
    reservado: { label: 'Reservado', cls: 'warn' },
    vendido: { label: 'Vendido', cls: 'sold' },
    alquilado: { label: 'Alquilado', cls: 'rent' },
    borrador: { label: 'Borrador', cls: 'draft' },
  };

  const fmtPrice = (p) =>
    p.price.toLocaleString('es-ES') + (p.op === 'alquiler' ? ' €/mes' : ' €');

  /* ---------- Ilustraciones de fachada (SVG generado, sin fotos) ---------- */
  const SKY = {
    dia: ['#DCE6E6', '#F3EEE3'],
    tarde: ['#F0D7C0', '#F6EDE0'],
  };
  const INK = '#1C1B18';
  const CAL = '#FBF8F1';
  const LACRE = '#9A2E22';
  const RIO = '#4F6D78';

  function win(x, y, w, h, opts = {}) {
    const bars = opts.reja
      ? Array.from({ length: 4 }, (_, i) =>
          `<line x1="${x + ((i + 1) * w) / 5}" y1="${y}" x2="${x + ((i + 1) * w) / 5}" y2="${y + h}" stroke="${INK}" stroke-width="1.4"/>`).join('')
      : `<line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="${CAL}" stroke-width="2"/>`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${opts.glass || '#3F5961'}" rx="${opts.r || 1}"/>${bars}` +
      (opts.sill ? `<rect x="${x - 3}" y="${y + h}" width="${w + 6}" height="4" fill="${opts.sill}"/>` : '');
  }

  function scene(kind, tint, sky) {
    const [s1, s2] = SKY[sky] || SKY.dia;
    let b = '';
    switch (kind) {
      case 'casa':
        b = `<rect x="70" y="92" width="260" height="138" fill="${CAL}"/>
          <rect x="70" y="210" width="260" height="20" fill="${tint}"/>
          <rect x="62" y="84" width="276" height="10" fill="${tint}"/>
          <path d="M70 84 L70 72 L330 72 L330 84Z" fill="${CAL}"/>
          ${win(98, 112, 38, 52, { reja: true, glass: '#2F3E44', sill: tint })}
          ${win(264, 112, 38, 52, { reja: true, glass: '#2F3E44', sill: tint })}
          <path d="M176 230 V150 a24 24 0 0 1 48 0 V230Z" fill="${LACRE}"/>
          <circle cx="216" cy="192" r="2.4" fill="${tint}"/>
          <rect x="172" y="104" width="56" height="22" fill="${tint}" opacity=".7"/>
          <path d="M120 72 q6 -12 14 0" stroke="#5C7A4E" stroke-width="5" fill="none"/>
          <circle cx="300" cy="66" r="7" fill="#5C7A4E"/><circle cx="310" cy="64" r="5" fill="#B5432F"/>`;
        break;
      case 'piso':
        b = `<rect x="110" y="40" width="180" height="190" fill="${tint}"/>
          <rect x="104" y="34" width="192" height="10" fill="${INK}" opacity=".85"/>
          ${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) =>
            `${win(126 + c * 54, 56 + r * 42, 34, 26, { glass: '#3F5961' })}<rect x="${122 + c * 54}" y="${82 + r * 42}" width="42" height="7" fill="none" stroke="${INK}" stroke-width="1.5"/>`).join('')).join('')}
          <rect x="182" y="198" width="36" height="32" fill="${INK}"/>`;
        break;
      case 'adosado':
        b = [0, 1, 2].map((i) => {
          const x = 52 + i * 100, t = i === 1 ? tint : '#EAE3D3';
          return `<path d="M${x} 108 L${x + 50} 70 L${x + 100} 108Z" fill="${i === 1 ? LACRE : '#B9A98D'}"/>
            <rect x="${x + 6}" y="106" width="88" height="124" fill="${t}"/>
            ${win(x + 18, 122, 26, 30, { glass: '#3F5961' })}${win(x + 56, 122, 26, 30, { glass: '#3F5961' })}
            <rect x="${x + 16}" y="180" width="40" height="50" fill="${i === 1 ? '#6B7F86' : '#9AA5A3'}"/>
            <rect x="${x + 64}" y="186" width="20" height="44" fill="${INK}"/>`;
        }).join('');
        break;
      case 'atico':
        b = `<rect x="96" y="96" width="208" height="134" fill="${tint}"/>
          ${[0, 1].map((r) => [0, 1, 2, 3].map((c) => win(112 + c * 48, 116 + r * 52, 28, 32, { glass: '#3F5961' })).join('')).join('')}
          <rect x="140" y="56" width="120" height="40" fill="${CAL}"/>
          ${win(156, 66, 44, 24, { glass: '#3F5961' })}
          <rect x="96" y="90" width="208" height="6" fill="${INK}"/>
          <path d="M130 56 h140" stroke="${LACRE}" stroke-width="6"/>
          ${Array.from({ length: 8 }, (_, i) => `<line x1="${134 + i * 17}" y1="52" x2="${134 + i * 17}" y2="60" stroke="${INK}" stroke-width="2"/>`).join('')}
          <circle cx="226" cy="80" r="9" fill="#5C7A4E"/><rect x="224" y="80" width="4" height="12" fill="${INK}"/>`;
        break;
      case 'local':
        b = `<rect x="60" y="70" width="280" height="160" fill="${tint}"/>
          ${[0, 1, 2, 3].map((c) => win(84 + c * 62, 86, 36, 34, { glass: '#3F5961' })).join('')}
          <rect x="60" y="134" width="280" height="12" fill="${LACRE}"/>
          <rect x="84" y="152" width="170" height="78" fill="#3F5961"/>
          <path d="M84 152 h170" stroke="${CAL}" stroke-width="3"/>
          ${Array.from({ length: 6 }, (_, i) => `<line x1="84" y1="${162 + i * 10}" x2="254" y2="${162 + i * 10}" stroke="#5C7680" stroke-width="1"/>`).join('')}
          <rect x="270" y="160" width="46" height="70" fill="${INK}"/>`;
        break;
      case 'chalet':
        b = `<rect x="40" y="206" width="320" height="24" fill="#8FB0B5"/>
          <path d="M60 210 h120" stroke="${CAL}" stroke-width="2" opacity=".8"/>
          <path d="M110 112 L200 66 L290 112Z" fill="${LACRE}"/>
          <rect x="120" y="110" width="160" height="96" fill="${CAL}"/>
          ${win(140, 128, 36, 36, { glass: '#3F5961' })}${win(224, 128, 36, 36, { glass: '#3F5961' })}
          <rect x="186" y="150" width="28" height="56" fill="${INK}"/>
          <path d="M330 206 V120" stroke="#6E5A3A" stroke-width="5"/>
          ${[-60, -20, 20, 60, 100].map((a) => `<path d="M330 120 q${Math.cos(a * Math.PI / 180) * 30} ${Math.sin(a * Math.PI / 180) * 10 - 14} ${Math.cos(a * Math.PI / 180) * 44} ${Math.sin(a * Math.PI / 180) * 26}" stroke="#5C7A4E" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}`;
        break;
      case 'solar':
        b = `<rect x="40" y="160" width="320" height="70" fill="${tint}"/>
          ${Array.from({ length: 12 }, (_, i) => `<line x1="${50 + i * 28}" y1="150" x2="${50 + i * 28}" y2="186" stroke="${INK}" stroke-width="2"/>`).join('')}
          <path d="M44 160 H356 M44 174 H356" stroke="${INK}" stroke-width="1.4"/>
          <rect x="250" y="112" width="70" height="44" fill="${CAL}" stroke="${INK}" stroke-width="2"/>
          <text x="285" y="139" font-family="Martian Mono, monospace" font-size="11" text-anchor="middle" fill="${LACRE}">SE VENDE</text>
          <line x1="285" y1="156" x2="285" y2="176" stroke="${INK}" stroke-width="3"/>`;
        break;
    }
    return `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="sk-${kind}-${sky}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient></defs>
      <rect width="400" height="260" fill="url(#sk-${kind}-${sky})"/>
      <circle cx="${sky === 'tarde' ? 320 : 80}" cy="${sky === 'tarde' ? 60 : 48}" r="20" fill="${sky === 'tarde' ? '#E9A36B' : '#F2E3B3'}"/>
      ${b}
      <rect y="230" width="400" height="30" fill="#D8CDB6"/>
      <path d="M0 244 q50 -6 100 0 t100 0 t100 0 t100 0" stroke="${RIO}" stroke-width="2" fill="none" opacity=".35"/>
    </svg>`;
  }

  window.SPI = { BUSINESS, PROPS, STATUS, fmtPrice, scene };
})();
