import { clinic, visitTypes } from "@/content/site";
import Booking from "@/components/Booking";
import { BookingProvider } from "@/components/BookingStore";
import ClinicDesk from "@/components/ClinicDesk";
import Header from "@/components/Header";
import NextSlots from "@/components/NextSlots";
import PickType from "@/components/PickType";

const STEPS = [
  { t: "Elige la consulta", d: "Primera visita, revisión o consulta general." },
  { t: "Mira las horas libres", d: "La agenda enseña solo los huecos disponibles." },
  { t: "Deja tus datos", d: "Una ficha corta: nombre, teléfono y motivo." },
  { t: "Recibe la confirmación", d: "Al momento, con recordatorio antes de la cita." },
];

const FAQ = [
  {
    q: "¿Necesito cita previa?",
    a: "Sí. La clínica atiende con cita previa. Puedes reservarla desde esta web o llamando por teléfono.",
  },
  {
    q: "No sé qué tipo de cita elegir",
    a: "Elige «Consulta de podología» y escribe el motivo en pocas palabras. La clínica lo verá antes de tu visita.",
  },
  {
    q: "¿Puedo cambiar o anular la cita?",
    a: "Sí. El mensaje de confirmación incluye un enlace para cambiarla o anularla sin llamar. También puedes llamar a la clínica.",
  },
  {
    q: "¿Qué pasa con mis datos?",
    a: "Solo se usan para gestionar tu cita y avisarte. Se piden los mínimos imprescindibles.",
  },
];

export default function Home() {
  return (
    <BookingProvider>
      <Header />
      <main id="inicio">
        {/* Inicio */}
        <section className="hero">
          <div className="wrap hero-in">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="dot" aria-hidden /> Podología · {clinic.town}
              </p>
              <h1>
                Tu cita de podología,
                <br />
                <span>sin llamar y sin esperas.</span>
              </h1>
              <p className="lead">
                Elige el tipo de consulta, mira las horas libres y reserva desde el móvil. La clínica recibe tus
                datos ordenados y tú, la confirmación al momento.
              </p>
              <div className="hero-ctas">
                <a href="#cita" className="btn btn-solid btn-lg">
                  Reservar cita online
                </a>
                <a href={clinic.phoneHref} className="btn btn-line btn-lg">
                  Llamar <span className="mono">{clinic.phone}</span>
                </a>
              </div>
              <ul className="hero-facts">
                <li>Atención con cita previa</li>
                <li>{clinic.street}</li>
                <li>{clinic.town}, {clinic.province}</li>
              </ul>
            </div>
            <NextSlots />
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="sec" id="como">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">Cómo reservar</p>
              <h2>Cuatro pasos. Ninguna llamada.</h2>
            </div>
            <ol className="flow">
              {STEPS.map((s, i) => (
                <li key={s.t}>
                  <span className="flow-n mono">{String(i + 1).padStart(2, "0")}</span>
                  <strong>{s.t}</strong>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Consultas */}
        <section className="sec sec-tint" id="consultas">
          <div className="wrap split">
            <div className="sec-head">
              <p className="eyebrow">Consultas</p>
              <h2>¿Qué cita necesitas?</h2>
              <p>
                Tres tipos de cita para que reservar sea sencillo. Si dudas, elige consulta de podología y cuéntanos
                el motivo: la clínica te orientará.
              </p>
            </div>
            <ul className="vt">
              {visitTypes.map((t) => (
                <li key={t.id}>
                  <span className="vt-code mono">{t.code}</span>
                  <div className="vt-txt">
                    <h3>{t.name}</h3>
                    <p className="vt-for">{t.forWho}</p>
                    <p>{t.detail}</p>
                  </div>
                  <PickType id={t.id} label="Reservar" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Reserva */}
        <section className="sec" id="cita">
          <div className="wrap">
            <div className="sec-head sec-head-row">
              <div>
                <p className="eyebrow">Cita online</p>
                <h2>Reserva tu cita</h2>
              </div>
              <p>
                ¿Prefieres hablar con la clínica? Llama al{" "}
                <a href={clinic.phoneHref} className="mono">
                  {clinic.phone}
                </a>
                .
              </p>
            </div>
            <Booking />
          </div>
        </section>

        {/* Lo que recibe la clínica */}
        <section className="sec sec-ink" id="gestion">
          <div className="wrap">
            <div className="sec-head sec-head-row">
              <div>
                <p className="eyebrow">Para la clínica</p>
                <h2>Cada reserva llega a la agenda, con su ficha.</h2>
              </div>
              <ul className="gains">
                <li>Menos llamadas y mensajes para cuadrar horarios.</li>
                <li>Los datos del paciente llegan completos y ordenados.</li>
                <li>Recordatorios automáticos antes de cada cita.</li>
              </ul>
            </div>
            <ClinicDesk />
          </div>
        </section>

        {/* La clínica y contacto */}
        <section className="sec" id="clinica">
          <div className="wrap place">
            <div className="sec-head">
              <p className="eyebrow">La clínica</p>
              <h2>Podología en {clinic.town}.</h2>
              <p>
                {clinic.name} atiende con cita previa en la carretera de Almensilla, en {clinic.town}. Reserva online
                o llama para cualquier duda.
              </p>
            </div>
            <div className="place-card" id="contacto">
              <dl className="place-dl">
                <div>
                  <dt>Dirección</dt>
                  <dd>
                    {clinic.street}
                    <br />
                    {clinic.postalCode} {clinic.town} ({clinic.province})
                  </dd>
                </div>
                <div>
                  <dt>Teléfono</dt>
                  <dd>
                    <a href={clinic.phoneHref} className="mono">
                      {clinic.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Atención</dt>
                  <dd>Con cita previa. Consulta los días y horas disponibles en la reserva online.</dd>
                </div>
              </dl>
              <div className="place-map" aria-hidden>
                <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
                  <path className="m-road" d="M-10 130 C 80 120, 140 70, 330 60" />
                  <path className="m-road m-thin" d="M120 -10 C 130 60, 150 120, 140 190" />
                  <path className="m-road m-thin" d="M220 190 C 230 140, 260 100, 330 110" />
                  <circle className="m-pin-halo" cx="168" cy="92" r="18" />
                  <circle className="m-pin" cx="168" cy="92" r="7" />
                </svg>
                <span>Ctra. Almensilla</span>
              </div>
              <div className="place-ctas">
                <a href="#cita" className="btn btn-solid">
                  Reservar cita
                </a>
                <a href={clinic.mapsHref} className="btn btn-line" target="_blank" rel="noopener noreferrer">
                  Cómo llegar
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Preguntas */}
        <section className="sec sec-tint" id="preguntas">
          <div className="wrap split">
            <div className="sec-head">
              <p className="eyebrow">Preguntas frecuentes</p>
              <h2>Antes de reservar</h2>
            </div>
            <div className="faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="ft">
        <div className="wrap ft-in">
          <div>
            <strong>{clinic.name}</strong>
            <p>
              {clinic.street} · {clinic.postalCode} {clinic.town} ({clinic.province})
            </p>
            <p>
              <a href={clinic.phoneHref} className="mono">
                {clinic.phone}
              </a>
            </p>
          </div>
          <p className="ft-demo">
            Web de demostración: no es la web oficial de la clínica. Las reservas son simuladas y no se envía ningún
            dato.
          </p>
        </div>
      </footer>

      <nav className="mbar" aria-label="Acciones rápidas">
        <a href={clinic.phoneHref} className="btn btn-line">
          Llamar
        </a>
        <a href="#cita" className="btn btn-solid">
          Reservar cita
        </a>
      </nav>
    </BookingProvider>
  );
}
