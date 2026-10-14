// Datos públicos de la consulta. Solo lo que se ha podido contrastar
// (ver docs/INTERNAL_AUDIT.md): nombre, localidad y teléfono.
export const business = {
  name: "Pablo San Juan",
  discipline: "Psicología",
  brand: "Pablo San Juan | Psicología",
  town: "Aznalcázar",
  province: "Sevilla",
  phoneDisplay: "618 201 313",
  phoneHref: "tel:+34618201313",
  mapsHref: "https://www.google.com/maps/search/?api=1&query=Aznalc%C3%A1zar%2C%20Sevilla",
} as const;

export const nav = [
  { href: "#pablo", label: "Pablo" },
  { href: "#forma", label: "Cómo trabaja" },
  { href: "#cita", label: "Cita" },
  { href: "#donde", label: "Dónde" },
  { href: "#preguntas", label: "Preguntas" },
] as const;

export const faqs = [
  {
    q: "¿Cómo pido una primera cita?",
    a: "Desde el apartado «Cita» de esta página: eliges un día, una hora que te venga bien y dejas tu nombre y un teléfono. Si lo prefieres, también puedes llamar al 618 201 313.",
  },
  {
    q: "¿Tengo que explicar el motivo al pedir la cita?",
    a: "No. Basta con tu nombre y un teléfono de contacto. Si quieres añadir algo, hay un campo opcional, pero lo importante se habla en consulta.",
  },
  {
    q: "¿La hora que elijo queda reservada al momento?",
    a: "La hora que marcas es una solicitud. Pablo la revisa y te confirma por teléfono, o te propone otra cercana si ese hueco ya no está libre.",
  },
  {
    q: "¿Y si después no puedo ir?",
    a: "Avisa por teléfono cuanto antes. Así ese hueco puede aprovecharlo otra persona y buscamos otro momento para ti.",
  },
  {
    q: "¿Lo que cuento en consulta es confidencial?",
    a: "Sí. La confidencialidad forma parte de la ética profesional de la psicología. Lo que se habla en consulta se queda en consulta.",
  },
  {
    q: "¿Cuánto cuesta una sesión?",
    a: "Las tarifas se informan directamente por teléfono o al confirmar tu cita, para que conozcas las condiciones antes de la primera sesión.",
  },
] as const;
