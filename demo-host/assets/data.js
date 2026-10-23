/* Datos de demostración compartidos por la web y por /panel-demo.
   Todos los inmuebles, consultas y propietarios son DE EJEMPLO: no son cartera real del negocio. */
window.GC = {
  negocio: {
    nombre: 'Grupo Inmobiliario Goldencenter',
    corto: 'Golden Center',
    direccion: 'C/ Gerona, 17 · Sevilla',
    telefono: '954 21 41 42',
    telHref: 'tel:+34954214142',
    whatsapp: '34685859202',
  },
  estados: {
    disponible: { label: 'Disponible' },
    reservado: { label: 'Reservado' },
    vendido: { label: 'Vendido' },
    alquilado: { label: 'Alquilado' },
    borrador: { label: 'Borrador' },
  },
  inmuebles: [
    { ref: 'GC-101', titulo: 'Piso con balcones a la calle', tipo: 'Piso', op: 'venta', zona: 'San Julián', ciudad: 'Sevilla', precio: 224000, hab: 3, banos: 2, m2: 104, estado: 'disponible', publicado: true, img: 'casco-albero', galeria: ['salon-verde', 'cocina'], tags: ['Balcones', 'Ascensor', 'Casco Antiguo'], fecha: '2026-10-21', visitas: 412, consultas: 6 },
    { ref: 'GC-102', titulo: 'Ático con terraza y vistas a la Giralda', tipo: 'Ático', op: 'venta', zona: 'Santa Catalina', ciudad: 'Sevilla', precio: 289000, hab: 2, banos: 1, m2: 78, estado: 'reservado', publicado: true, img: 'atico-giralda', galeria: ['salon-oro', 'cocina'], tags: ['Terraza 30 m²', 'Pérgola', 'Vistas'], fecha: '2026-10-18', visitas: 688, consultas: 11 },
    { ref: 'GC-103', titulo: 'Piso familiar junto a la Buhaira', tipo: 'Piso', op: 'alquiler', zona: 'Nervión', ciudad: 'Sevilla', precio: 990, hab: 3, banos: 2, m2: 110, estado: 'disponible', publicado: true, img: 'bloque-nervion', galeria: ['salon-oro', 'cocina'], tags: ['Garaje', 'Aire acondicionado', 'Metro'], fecha: '2026-10-20', visitas: 530, consultas: 9 },
    { ref: 'GC-104', titulo: 'Casa con porche en la aldea', tipo: 'Casa', op: 'venta', zona: 'El Rocío', ciudad: 'Almonte', precio: 565000, hab: 4, banos: 3, m2: 210, estado: 'disponible', publicado: true, img: 'casa-rocio', galeria: ['patio', 'salon-verde'], tags: ['Porche', 'Parcela', 'Cuadra'], fecha: '2026-10-12', visitas: 301, consultas: 4 },
    { ref: 'GC-105', titulo: 'Dúplex a dos pasos de las Setas', tipo: 'Dúplex', op: 'venta', zona: 'Encarnación', ciudad: 'Sevilla', precio: 345000, hab: 2, banos: 2, m2: 95, estado: 'disponible', publicado: true, img: 'casco-almagra', galeria: ['estudio-feria', 'cocina'], tags: ['Dos plantas', 'Reformado', 'Luminoso'], fecha: '2026-10-16', visitas: 455, consultas: 7 },
    { ref: 'GC-106', titulo: 'Estudio reformado en calle Feria', tipo: 'Estudio', op: 'alquiler', zona: 'Feria', ciudad: 'Sevilla', precio: 720, hab: 1, banos: 1, m2: 42, estado: 'alquilado', publicado: true, img: 'estudio-feria', galeria: ['casco-cal'], tags: ['Amueblado', 'Reformado'], fecha: '2026-09-30', visitas: 276, consultas: 14 },
    { ref: 'GC-107', titulo: 'Oficina luminosa en el Arenal', tipo: 'Oficina', op: 'alquiler', zona: 'Arenal', ciudad: 'Sevilla', precio: 760, hab: 0, banos: 1, m2: 85, estado: 'disponible', publicado: true, img: 'oficina-arenal', galeria: ['casco-cal'], tags: ['Diáfana', 'Exterior'], fecha: '2026-10-09', visitas: 118, consultas: 2 },
    { ref: 'GC-108', titulo: 'Nave con portón y oficina', tipo: 'Nave', op: 'venta', zona: 'Torreblanca', ciudad: 'Sevilla', precio: 52000, hab: 0, banos: 1, m2: 320, estado: 'vendido', publicado: true, img: 'nave-torreblanca', galeria: [], tags: ['Portón', 'Altura 7 m'], fecha: '2026-09-22', visitas: 190, consultas: 5 },
    { ref: 'GC-109', titulo: 'Piso exterior para entrar a vivir', tipo: 'Piso', op: 'venta', zona: 'La Salle', ciudad: 'Sevilla', precio: 182000, hab: 3, banos: 1, m2: 86, estado: 'disponible', publicado: true, img: 'bloque-lasalle', galeria: ['salon-verde', 'cocina'], tags: ['Exterior', 'Trastero'], fecha: '2026-10-19', visitas: 362, consultas: 8 },
    { ref: 'GC-110', titulo: 'Casa de pueblo con patio y torre', tipo: 'Casa', op: 'venta', zona: 'Centro', ciudad: 'Carmona', precio: 345000, hab: 5, banos: 3, m2: 260, estado: 'borrador', publicado: false, img: 'cortijo-carmona', galeria: ['patio'], tags: ['Patio', 'Torre mirador'], fecha: '2026-10-22', visitas: 0, consultas: 0 },
    { ref: 'GC-111', titulo: 'Piso con patio de vecinos en Santa Cruz', tipo: 'Piso', op: 'alquiler', zona: 'Santa Cruz', ciudad: 'Sevilla', precio: 1380, hab: 2, banos: 1, m2: 70, estado: 'reservado', publicado: true, img: 'casco-cal', galeria: ['patio', 'salon-oro'], tags: ['Patio', 'Amueblado'], fecha: '2026-10-14', visitas: 599, consultas: 12 },
    { ref: 'GC-112', titulo: 'Local a pie de calle en Puerta Carmona', tipo: 'Local', op: 'venta', zona: 'Puerta Carmona', ciudad: 'Sevilla', precio: 210000, hab: 0, banos: 1, m2: 120, estado: 'borrador', publicado: false, img: 'local-puerta-carmona', galeria: [], tags: ['Escaparate', 'Esquina'], fecha: '2026-10-22', visitas: 0, consultas: 0 },
  ],
  consultas: [
    { id: 1, nombre: 'María López', ref: 'GC-103', canal: 'Formulario', hace: 'hace 12 min', mensaje: 'Quería saber si podemos visitarla esta semana.', estado: 'nueva', tel: '600 000 001' },
    { id: 2, nombre: 'Javier Moreno', ref: 'GC-102', canal: 'WhatsApp', hace: 'hace 1 h', mensaje: '¿La terraza es privativa? Me encaja mucho, ¿hay opción de verla el sábado?', estado: 'nueva', tel: '600 000 002' },
    { id: 3, nombre: 'Lucía Fernández', ref: 'GC-109', canal: 'Formulario', hace: 'hace 3 h', mensaje: 'Somos dos y un bebé. ¿Aceptarían una oferta por debajo del precio?', estado: 'nueva', tel: '600 000 003' },
    { id: 4, nombre: 'Antonio Ruiz', ref: 'GC-107', canal: 'Llamada', hace: 'ayer', mensaje: 'Busco oficina para un despacho de tres personas. ¿Incluye comunidad?', estado: 'atendida', tel: '600 000 004' },
    { id: 5, nombre: 'Carmen Díaz', ref: 'GC-104', canal: 'Formulario', hace: 'ayer', mensaje: 'Vivimos fuera y vamos al Rocío en noviembre. ¿Se puede ver entonces?', estado: 'atendida', tel: '600 000 005' },
    { id: 6, nombre: 'Pablo Sánchez', ref: 'GC-101', canal: 'WhatsApp', hace: 'hace 2 días', mensaje: '¿Tiene ascensor hasta la planta? Me interesa para mis padres.', estado: 'atendida', tel: '600 000 006' },
  ],
  propietarios: [
    { id: 1, nombre: 'Rosario Vela', tel: '600 000 011', zona: 'Macarena', tipo: 'Piso', op: 'Vender', fecha: '23 oct', nota: 'Heredado, 3 dormitorios. Quiere saber cuánto vale.', estado: 'nueva' },
    { id: 2, nombre: 'Manuel Ortega', tel: '600 000 012', zona: 'Triana', tipo: 'Piso', op: 'Alquilar', fecha: '22 oct', nota: 'Se muda por trabajo; lo dejaría amueblado.', estado: 'nueva' },
    { id: 3, nombre: 'Inés Prieto', tel: '600 000 013', zona: 'San Bernardo', tipo: 'Local', op: 'Vender', fecha: '21 oct', nota: 'Local de 60 m² cerrado desde marzo.', estado: 'valoracion' },
    { id: 4, nombre: 'Francisco Gil', tel: '600 000 014', zona: 'El Rocío', tipo: 'Casa', op: 'Vender', fecha: '19 oct', nota: 'Casa de hermandad compartida, varios propietarios.', estado: 'visita' },
    { id: 5, nombre: 'Elena Romero', tel: '600 000 015', zona: 'Nervión', tipo: 'Piso', op: 'Vender', fecha: '17 oct', nota: 'Quiere vender y comprar otro más grande.', estado: 'captado' },
  ],
  semanas: [
    { s: '1 sep', v: 9 }, { s: '8 sep', v: 12 }, { s: '15 sep', v: 10 }, { s: '22 sep', v: 15 },
    { s: '29 sep', v: 14 }, { s: '6 oct', v: 19 }, { s: '13 oct', v: 17 }, { s: '20 oct', v: 23 },
  ],
};

window.GC.fmtPrecio = (p) => {
  const n = p.precio.toLocaleString('es-ES', { maximumFractionDigits: 0 }).replace(/(\d)(?=(\d{3})+$)/g, '$1.');
  return p.op === 'alquiler' ? `${n} €/mes` : `${n} €`;
};
