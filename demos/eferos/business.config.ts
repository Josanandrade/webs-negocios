/**
 * Datos de negocio de Eferos Fisioterapia.
 *
 * Única fuente de verdad para nombre, contacto, horario, equipo, servicios y
 * navegación. Cualquier componente que muestre datos del negocio los lee de aquí.
 *
 * Origen de los datos: web pública eferos.es y su página de reservas en Setmore
 * (consultadas en octubre de 2026). Los puntos marcados con `TODO(verificar)`
 * deben confirmarse con el cliente antes de publicar.
 */

import type { Business } from "@/lib/types";

export const business: Business = {
  name: "Eferos Fisioterapia",
  tagline: "Fisioterapia avanzada en Mairena del Aljarafe",
  description:
    "Centro de fisioterapia en Mairena del Aljarafe. Combinamos terapia manual y tecnología (EPI® ecoguiada, punción seca, diatermia y ejercicio terapéutico) para tratar la lesión desde su origen.",
  foundedYear: 2022,

  contact: {
    phoneDisplay: "644 46 16 41",
    phoneE164: "+34644461641",
    whatsappUrl: "https://wa.me/34644461641",
    email: "eferos.fisioterapia@gmail.com",
  },

  // Reservas online gestionadas en Setmore
  booking: {
    url: "https://eferosfisioterapia.setmore.com/",
    label: "Reservar cita",
  },

  address: {
    street: "C/ Hermanas Mirabal 6, local 8",
    postalCode: "41927",
    locality: "Mairena del Aljarafe",
    region: "Sevilla",
    country: "ES",
    landmark: "Frente al parque infantil",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Eferos+Fisioterapia+Calle+Hermanas+Mirabal+6+Mairena+del+Aljarafe",
  },

  // TODO(verificar): eferos.es publica L–J 9:30–20:30 y V 9:30–13:30; otros
  // directorios indican 9:00–21:00 / 9:00–14:00. Confirmar con el centro.
  hours: [
    { days: "Lunes a jueves", dayIndexes: [1, 2, 3, 4], opens: "09:30", closes: "20:30" },
    { days: "Viernes", dayIndexes: [5], opens: "09:30", closes: "13:30" },
    { days: "Sábado y domingo", dayIndexes: [6, 0], closed: true },
  ],

  registrations: [
    { label: "Centro sanitario", value: "NICA 57826", detail: "Consejería de Salud y Familia, Junta de Andalucía" },
    { label: "Colegiado", value: "Ilustre Colegio de Fisioterapia de Sevilla" },
  ],

  // Rellenar cuando se confirmen los perfiles. Los vacíos no se muestran.
  social: [
    { label: "Instagram", url: "" },
    { label: "Facebook", url: "" },
  ],

  nav: [
    { label: "Tratamientos", href: "/#tratamientos" },
    { label: "El centro", href: "/#centro" },
    { label: "Equipo", href: "/#equipo" },
    { label: "Contacto", href: "/#contacto" },
  ],

  team: [
    {
      slug: "cristina-leon",
      name: "Cristina León Mirman",
      initials: "CL",
      role: "Fisioterapeuta",
      license: "Col. nº 9134",
      photo: "/images/equipo/cristina-leon.jpg",
      // Texto de su presentación en eferos.es, en primera persona
      bio: [
        "Graduada en Fisioterapia por la Universidad de Sevilla (2019), me he especializado en el tratamiento de trastornos neuromusculoesqueléticos, abordando tanto patologías agudas como dolores crónicos en adultos.",
        "Entiendo la fisioterapia desde la transparencia y la honestidad. Mi práctica se basa en un alto sentido de la responsabilidad: me comprometo al máximo para resolver tu problema, manteniendo siempre la sinceridad clínica sobre las posibilidades de recuperación en cada caso.",
      ],
      // Formación adicional al grado (que ya figura en `bio`); vacío = no se muestra la lista
      credentials: [],
      mentors: ["Chad Cook", "Jo Gibson", "Annina Schmid", "Mark Laslett"],
    },
  ],

  spaces: [
    {
      id: "gabinetes",
      where: "En el centro",
      title: "Gabinetes individuales",
      text: "Valoración y tratamiento a solas contigo, en una sala cerrada. Aquí hacemos la exploración, la terapia manual y las técnicas ecoguiadas.",
    },
    {
      id: "sala",
      where: "En el centro",
      title: "Sala de recuperación activa",
      text: "Un espacio amplio para el ejercicio terapéutico. Lo que trabajamos en camilla se consolida aquí, con movimiento y carga progresiva.",
    },
    {
      id: "domicilio",
      where: "A domicilio",
      title: "En tu casa",
      text: "A veces una dolencia no te deja desplazarte. Para esos casos, vamos nosotros a tu domicilio con lo necesario para tratarte.",
    },
  ],

  // Fotografías del centro para la tira horizontal de «El centro».
  // Sustituir `src: null` por la ruta del archivo en /public/images/centro/.
  gallery: [
    {
      src: "/images/centro/sala-recuperacion-activa.jpg",
      alt: "Sala de recuperación activa con bicicleta, cinta de correr, jaula de fuerza y esterillas",
      caption: "Sala de recuperación activa",
      width: 800,
      height: 530,
    },
    {
      src: "/images/centro/gabinete-individual.jpg",
      alt: "Gabinete con mesa de consulta, títulos en la pared, camilla y ecógrafo",
      caption: "Gabinete individual",
      width: 1206,
      height: 872,
    },
    {
      src: "/images/centro/camilla-ecografo.jpg",
      alt: "Camilla de tratamiento junto al ecógrafo",
      caption: "Ecografía",
      width: 1206,
      height: 878,
    },
    {
      src: "/images/centro/zona-fuerza.jpg",
      alt: "Zona de fuerza con jaula, barra olímpica y kettlebells",
      caption: "Zona de fuerza",
      width: 1206,
      height: 872,
    },
    {
      src: "/images/centro/gabinete-tratamiento.jpg",
      alt: "Gabinete de tratamiento con camilla, ecógrafo y el equipo de EPI®",
      caption: "Gabinete de tratamiento",
      width: 800,
      height: 400,
    },
  ],

  // Las descripciones técnicas (`intro`) parten de eferos.es; los bloques
  // `sections` son redacción propuesta para la demo. TODO(verificar) con el equipo.
  services: [
    {
      slug: "terapia-manual",
      name: "Terapia manual ortopédica",
      kind: "Manual",
      summary: "Técnicas con las manos para valorar y tratar articulaciones, músculo y tejido nervioso.",
      intro:
        "La terapia manual es un conjunto de técnicas aplicadas con las manos para diagnosticar y tratar el tejido blando, las articulaciones y el tejido nervioso. Su papel es modular el dolor y devolver función a la zona lesionada.",
      sections: [
        {
          title: "Cómo la usamos",
          body: "Es el punto de partida de casi cualquier valoración: con las manos localizamos qué estructura está implicada y cómo responde. A partir de ahí la combinamos con ejercicio y, cuando el caso lo pide, con técnicas invasivas o diatermia.",
        },
      ],
      indications: [],
    },
    {
      slug: "epi",
      name: "EPI®",
      fullName: "Electrólisis Percutánea Intratisular",
      kind: "Invasiva · ecoguiada",
      summary: "Corriente galvánica aplicada con una aguja guiada por ecografía sobre el tejido degenerado.",
      intro:
        "La electrólisis percutánea intratisular (EPI®) es una técnica de fisioterapia mínimamente invasiva y ecoguiada. Consiste en aplicar una corriente galvánica sobre un tejido degenerado a través de una aguja de acupuntura, viendo en todo momento en el ecógrafo dónde está la aguja.",
      sections: [
        {
          title: "Por qué ecoguiada",
          body: "La ecografía nos deja ver el tejido lesionado y la posición exacta de la aguja durante la aplicación. Tratamos el punto que necesita tratamiento, y solo ese.",
        },
      ],
      indications: [
        "Tendinopatías y entesopatías crónicas",
        "Fascitis plantar",
        "Bursitis",
        "Roturas musculares agudas",
        "Fibrosis musculares",
        "Puntos gatillo miofasciales",
        "Esguinces",
        "Atrapamientos nerviosos",
      ],
    },
    {
      slug: "puncion-seca",
      name: "Punción seca",
      kind: "Invasiva",
      summary: "Aguja fina, sin medicación, sobre los puntos gatillo miofasciales.",
      intro:
        "La punción seca es una técnica invasiva en la que se introduce una aguja fina, sin inyectar ninguna sustancia, en el músculo. Se utiliza sobre todo para tratar puntos gatillo miofasciales, esas zonas de tensión que provocan dolor local o referido.",
      sections: [
        {
          title: "Cuándo la proponemos",
          body: "Cuando la valoración muestra que el dolor tiene un componente muscular claro. Siempre la integramos en un tratamiento más amplio, nunca como técnica aislada.",
        },
      ],
      indications: [],
    },
    {
      slug: "diatermia",
      name: "Diatermia",
      kind: "Tecnología",
      summary: "Calor generado en profundidad dentro del tejido mediante corrientes de alta frecuencia.",
      intro:
        "La diatermia utiliza corrientes de alta frecuencia para generar calor dentro de los tejidos, en profundidad y no solo en la superficie de la piel. Ese aumento de temperatura favorece la circulación y ayuda a aliviar el dolor.",
      sections: [
        {
          title: "Cómo la usamos",
          body: "Como apoyo dentro de la sesión: prepara el tejido antes de la terapia manual o del ejercicio y ayuda a controlar el dolor en las fases en las que más molesta.",
        },
      ],
      indications: [],
    },
    {
      slug: "ejercicio-terapeutico",
      name: "Ejercicio terapéutico",
      kind: "Activo",
      summary: "Ejercicio pautado y progresado según tu lesión, en nuestra sala de recuperación.",
      intro:
        "El ejercicio terapéutico es ejercicio prescrito para tu lesión concreta: qué movimientos, con cuánta carga y cómo progresar. Es lo que hace que la mejora conseguida en camilla se mantenga en el tiempo.",
      sections: [
        {
          title: "Dónde lo hacemos",
          body: "En la sala de recuperación activa del centro, con espacio suficiente para trabajar con calma. Y te llevas pautas claras para continuar por tu cuenta.",
        },
      ],
      indications: [],
    },
  ],
};
