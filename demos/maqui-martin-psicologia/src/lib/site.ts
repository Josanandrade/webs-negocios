// Datos públicos de la profesional usados en la demo.
//
// Solo se incluye lo que aparece de forma coincidente en fichas públicas
// (heredadas de su antigua ficha de Google Business). Todo lo demás —formación,
// nº de colegiada, horario, tarifas, modalidad online— queda fuera hasta que
// ella lo confirme. Ver README.md («Información verificada»).

export const site = {
  name: "Maqui Martín Hernández",
  shortName: "Maqui Martín",
  role: "Psicóloga",
  city: "Dos Hermanas",
  province: "Sevilla",
  address: {
    street: "C. Luis Ortega Bru, 4",
    postalCode: "41704",
    locality: "Dos Hermanas, Sevilla",
  },
  phone: {
    display: "617 40 83 80",
    href: "tel:+34617408380",
  },
  // Enlace a búsqueda en Google Maps: no incrusta mapas ni carga scripts de terceros.
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Maqui Martín Hernández psicóloga, C. Luis Ortega Bru 4, 41704 Dos Hermanas"),
} as const;

export const nav = [
  { href: "#acompanamiento", label: "Acompañamiento" },
  { href: "#primera-cita", label: "Primera cita" },
  { href: "#consulta", label: "La consulta" },
  { href: "#preguntas", label: "Preguntas" },
] as const;
