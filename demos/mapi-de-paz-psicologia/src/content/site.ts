// Datos públicos de la consulta. Solo lo que aparece en fuentes públicas
// contrastadas (ver docs/INTERNAL_AUDIT.md). Nada de precios ni horarios:
// las fuentes no coinciden o no los publican.

export const business = {
  name: "Mapi de Paz",
  fullName: "Mapi de Paz · Consulta de Psicología",
  role: "Psicóloga",
  college: "Colegiada en el Colegio Oficial de la Psicología de Andalucía Occidental",
  phone: "616 88 58 41",
  phoneHref: "tel:+34616885841",
  street: "Calle Larga, 76 · Local 6",
  town: "41110 Bollullos de la Mitación, Sevilla",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Mapi+de+Paz+Consulta+de+Psicolog%C3%ADa+Calle+Larga+76+Bollullos+de+la+Mitaci%C3%B3n",
  languages: "Castellano y catalán",
};

// Frase de su propia presentación pública.
export const ownWords = "Procuro que estés cómodo/a y acompañarte con cuidado en tu proceso.";

export const approach = {
  lead: "Mi enfoque terapéutico es integrador: me he formado en una gran variedad de técnicas y recursos.",
  resources: ["Gestalt", "Sistémica", "Arteterapia", "Psicodrama"],
  experience: "25 años de experiencia",
  teaching: "Formadora y supervisora de profesionales",
};

export type SessionKind = {
  id: string;
  numeral: string;
  title: string;
  line: string;
};

export const formats: SessionKind[] = [
  { id: "individual", numeral: "I", title: "Terapia individual", line: "Un espacio propio para mirar lo que te ocurre, a tu ritmo." },
  { id: "pareja", numeral: "II", title: "Terapia de pareja", line: "Para las dos personas, cuando la relación necesita otro lugar donde hablar." },
  { id: "familia", numeral: "III", title: "Terapia familiar", line: "Cuando lo que pasa afecta a varios miembros de la casa." },
  { id: "grupo", numeral: "IV", title: "Grupos", line: "Trabajo compartido con otras personas en un proceso parecido." },
];

// Áreas que la propia profesional indica en su perfil público. Se ha elegido
// una selección prudente y se presentan sin lenguaje diagnóstico.
export const areas = [
  "Ansiedad y estrés",
  "Autoestima",
  "Duelo",
  "Relaciones de pareja",
  "Conflictos familiares",
  "Separación y divorcio",
  "Orientación vocacional",
];

export const ages = "Desde la preadolescencia hasta la edad adulta y mayores de 65 años.";

// Reseñas públicas en Google (citadas literalmente, solo iniciales).
export const voices = [
  { text: "Es cercana, cálida y sabe escuchar.", who: "A. L." },
  { text: "Este centro rebosa profesionalidad y calidez humana.", who: "E. E." },
  { text: "Estoy encantada con su empatía y comprensión.", who: "V. C." },
];
