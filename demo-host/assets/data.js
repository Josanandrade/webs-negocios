/* Datos de demostración. Ningún inmueble, persona ni cifra corresponde a
   la cartera real de la inmobiliaria: todo está marcado como ejemplo. */
(function () {
  const inmuebles = [
    {
      ref: 'GSI-001', titulo: 'Piso luminoso junto a la Alfalfa', tipo: 'Piso', op: 'venta',
      barrio: 'Centro', zona: 'Alfalfa', precio: 289000, hab: 3, banos: 2, m2: 104,
      estado: 'disponible', publicado: true, art: { kind: 'piso', wall: '#F1E3C6', trim: '#9A6B34', floors: 4, seed: 3 },
      extras: ['Balcón a la calle', 'Ascensor', 'Aire acondicionado'],
      visitas: 2, consultas: 6, alta: '02 oct'
    },
    {
      ref: 'GSI-002', titulo: 'Casa con patio en Triana', tipo: 'Casa', op: 'venta',
      barrio: 'Triana', zona: 'Calle Pagés del Corro', precio: 415000, hab: 4, banos: 2, m2: 168,
      estado: 'reservado', publicado: true, art: { kind: 'casa', wall: '#F6EBD8', trim: '#B4573A', floors: 2, seed: 7 },
      extras: ['Patio andaluz', 'Azotea', 'Reformada'],
      visitas: 1, consultas: 9, alta: '18 sep'
    },
    {
      ref: 'GSI-003', titulo: 'Ático con terraza en Los Remedios', tipo: 'Ático', op: 'venta',
      barrio: 'Los Remedios', zona: 'Av. República Argentina', precio: 362000, hab: 3, banos: 2, m2: 118,
      estado: 'disponible', publicado: true, art: { kind: 'atico', wall: '#EDE6DA', trim: '#3E9B8A', floors: 5, seed: 11 },
      extras: ['Terraza 35 m²', 'Garaje', 'Trastero'],
      visitas: 3, consultas: 11, alta: '09 oct'
    },
    {
      ref: 'GSI-004', titulo: 'Piso de dos dormitorios en Nervión', tipo: 'Piso', op: 'alquiler',
      barrio: 'Nervión', zona: 'Luis de Morales', precio: 1150, hab: 2, banos: 1, m2: 78,
      estado: 'alquilado', publicado: true, art: { kind: 'piso', wall: '#E9DCC4', trim: '#5B4A3A', floors: 5, seed: 5 },
      extras: ['Amueblado', 'Ascensor', 'Cerca del metro'],
      visitas: 0, consultas: 14, alta: '12 sep'
    },
    {
      ref: 'GSI-005', titulo: 'Casa adosada en la Macarena', tipo: 'Casa', op: 'venta',
      barrio: 'Macarena', zona: 'San Julián', precio: 238000, hab: 3, banos: 2, m2: 126,
      estado: 'vendido', publicado: true, art: { kind: 'casa', wall: '#F2D9A8', trim: '#2B5F57', floors: 2, seed: 13 },
      extras: ['Patio', 'Dos plantas', 'Para entrar a vivir'],
      visitas: 0, consultas: 7, alta: '28 ago'
    },
    {
      ref: 'GSI-006', titulo: 'Local a pie de calle en Sevilla Este', tipo: 'Local', op: 'alquiler',
      barrio: 'Sevilla Este', zona: 'Av. de las Ciencias', precio: 950, hab: 0, banos: 1, m2: 92,
      estado: 'disponible', publicado: true, art: { kind: 'local', wall: '#E7E1D6', trim: '#9A6B34', floors: 3, seed: 17 },
      extras: ['Escaparate', 'Salida de humos', 'Diáfano'],
      visitas: 1, consultas: 3, alta: '15 oct'
    },
    {
      ref: 'GSI-007', titulo: 'Estudio reformado en la Alameda', tipo: 'Piso', op: 'alquiler',
      barrio: 'Alameda', zona: 'Calle Feria', precio: 790, hab: 1, banos: 1, m2: 46,
      estado: 'disponible', publicado: true, art: { kind: 'piso', wall: '#F3E6CF', trim: '#3E9B8A', floors: 3, seed: 19 },
      extras: ['Reformado', 'Amueblado', 'Luminoso'],
      visitas: 2, consultas: 5, alta: '11 oct'
    },
    {
      ref: 'GSI-008', titulo: 'Chalet con jardín en Bellavista', tipo: 'Casa', op: 'venta',
      barrio: 'Bellavista', zona: 'Jardines de Hércules', precio: 329000, hab: 4, banos: 3, m2: 190,
      estado: 'borrador', publicado: false, art: { kind: 'casa', wall: '#F4EEE2', trim: '#9A6B34', floors: 2, seed: 23 },
      extras: ['Jardín', 'Piscina', 'Garaje'],
      visitas: 0, consultas: 0, alta: '—'
    }
  ];

  const consultas = [
    { id: 1, nombre: 'María López', ref: 'GSI-003', canal: 'Formulario web', hace: 'hace 12 min', nueva: true,
      msg: 'Quería saber si podemos visitarla esta semana. Por las tardes me viene mejor.' },
    { id: 2, nombre: 'Javier Romero', ref: 'GSI-001', canal: 'WhatsApp', hace: 'hace 1 h', nueva: true,
      msg: '¿El precio es negociable? Tengo la hipoteca preaprobada.' },
    { id: 3, nombre: 'Lucía Fernández', ref: 'GSI-007', canal: 'Formulario web', hace: 'hace 3 h', nueva: true,
      msg: 'Me interesa para entrar en noviembre. ¿Admiten mascotas?' },
    { id: 4, nombre: 'Antonio Márquez', ref: 'GSI-006', canal: 'Llamada registrada', hace: 'ayer', nueva: false,
      msg: 'Busca local para una cafetería. Pregunta por la licencia y la salida de humos.' },
    { id: 5, nombre: 'Carmen Ruiz', ref: 'GSI-002', canal: 'Formulario web', hace: 'ayer', nueva: false,
      msg: 'Si la reserva no sigue adelante, me gustaría que me avisarais.' },
    { id: 6, nombre: 'Pablo Ortega', ref: 'GSI-003', canal: 'Formulario web', hace: 'hace 2 días', nueva: false,
      msg: '¿La plaza de garaje está incluida en el precio?' }
  ];

  const propietarios = [
    { nombre: 'Rosario Gil', tel: '6•• •• •• 41', zona: 'Triana', tipo: 'Piso 3 dorm.', fecha: '22 oct', estado: 'nueva' },
    { nombre: 'Manuel Vega', tel: '6•• •• •• 07', zona: 'Nervión', tipo: 'Ático', fecha: '21 oct', estado: 'nueva' },
    { nombre: 'Encarnación Díaz', tel: '9•• •• •• 63', zona: 'Centro', tipo: 'Casa con patio', fecha: '19 oct', estado: 'valoración' },
    { nombre: 'Francisco Ramos', tel: '6•• •• •• 92', zona: 'Los Remedios', tipo: 'Piso 4 dorm.', fecha: '16 oct', estado: 'contactado' },
    { nombre: 'Inés Moreno', tel: '6•• •• •• 18', zona: 'Macarena', tipo: 'Local', fecha: '12 oct', estado: 'contactado' }
  ];

  // Iconos de estado: el estado nunca se comunica solo con color.
  const I = {
    dot: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.6" fill="currentColor"/></svg>',
    half: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 1.4a3.6 3.6 0 010 7.2z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 10 10"><path d="M1.8 5.3l2.2 2.2 4.2-4.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    dash: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="2 1.6"/></svg>'
  };
  const estados = {
    disponible: { label: 'Disponible', icon: I.dot },
    reservado: { label: 'Reservado', icon: I.half },
    vendido: { label: 'Vendido', icon: I.check },
    alquilado: { label: 'Alquilado', icon: I.check },
    borrador: { label: 'Borrador', icon: I.dash }
  };

  const precio = (p) => p.op === 'alquiler'
    ? p.precio.toLocaleString('es-ES') + ' €/mes'
    : p.precio.toLocaleString('es-ES') + ' €';

  window.GSI = { icons: I, inmuebles, consultas, propietarios, estados, precio };
})();
