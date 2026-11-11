// Datos públicos de la consulta. Solo lo contrastado o publicado de forma
// coincidente en varios directorios; el detalle de fuentes está en el
// documento interno (no se despliega).

export const business = {
  name: "Pérez Bilbao Psicología",
  short: "Pérez Bilbao",
  street: "Av. de Sanlúcar la Mayor, 1",
  town: "Bollullos de la Mitación",
  province: "Sevilla",
  phoneDisplay: "688 978 090",
  phoneHref: "tel:+34688978090",
  hours: "Lunes a viernes, 10:00 – 21:00",
  hoursShort: "L – V · 10:00 – 21:00",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Av.+de+Sanl%C3%BAcar+la+Mayor+1%2C+Bollullos+de+la+Mitaci%C3%B3n%2C+Sevilla",
};

// Primera hora y última hora de inicio de cita (la consulta cierra a las 21:00).
export const agenda = {
  firstHour: 10,
  lastStartHour: 20,
};

export const faqs: { q: string; a: string }[] = [
  {
    q: "¿Cómo pido la primera cita?",
    a: `Puedes elegir día y hora en el apartado «Pedir cita» de esta página, o llamar al ${business.phoneDisplay} de lunes a viernes, de 10:00 a 21:00.`,
  },
  {
    q: "¿Tengo que explicar el motivo al pedir cita?",
    a: "No. Para solicitar un hueco basta con tu nombre y un teléfono de contacto. Lo que te trae a consulta se habla en persona, con calma.",
  },
  {
    q: "¿Qué ocurre en la primera cita?",
    a: "Es una primera conversación: cuentas lo que te preocupa, resuelves tus dudas y valoráis juntos cómo continuar.",
  },
  {
    q: "¿Lo que cuento en consulta es confidencial?",
    a: "Sí. La confidencialidad y el secreto profesional son principios del ejercicio de la psicología y están recogidos en su código deontológico.",
  },
  {
    q: "¿Cuánto cuesta una sesión?",
    a: `Las condiciones de cada sesión se informan directamente en la consulta. Puedes preguntarlas al llamar al ${business.phoneDisplay}.`,
  },
  {
    q: "¿Y si necesito cambiar o anular la cita?",
    a: "Llama a la consulta con la mayor antelación posible y se busca otro hueco que te venga bien.",
  },
];
