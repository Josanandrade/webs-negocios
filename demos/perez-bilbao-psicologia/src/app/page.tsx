import Booking from "@/components/Booking";
import Directory from "@/components/Directory";
import { business, faqs } from "@/content/site";

const nav = [
  { href: "#consulta", label: "La consulta" },
  { href: "#primera-cita", label: "Primera cita" },
  { href: "#ubicacion", label: "Ubicación" },
  { href: "#preguntas", label: "Preguntas" },
];

export default function Home() {
  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>

      <header className="bar">
        <a className="brand" href="#inicio" aria-label={`${business.name}, inicio`}>
          <span className="brand-mark" aria-hidden="true">
            PB
          </span>
          <span className="brand-name">
            Pérez Bilbao <em>Psicología</em>
          </span>
        </a>
        <nav className="bar-nav" aria-label="Secciones">
          {nav.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <a className="btn btn-small" href="#cita">
          Pedir cita
        </a>
      </header>

      <main id="contenido">
        {/* Portada: titular editorial + el «directorio del portal» como índice. */}
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <p className="kicker">
              Consulta de psicología · {business.town}, {business.province}
            </p>
            <h1 className="hero-title">
              Un espacio propio para <em>empezar a hablar.</em>
            </h1>
            <p className="hero-lede">
              Pide tu primera cita, consulta el horario y encuentra cómo llegar. Todo lo que necesitas para dar
              el primer paso, ordenado en un solo lugar.
            </p>
            <div className="hero-actions">
              <a className="btn" href="#cita">
                Elegir día y hora
              </a>
              <a className="btn btn-ghost" href={business.phoneHref}>
                Llamar al {business.phoneDisplay}
              </a>
            </div>
          </div>
          <Directory />
        </section>

        <section className="facts" aria-label="Datos de contacto">
          <div className="fact">
            <span className="fact-label">Horario</span>
            <span className="fact-value">{business.hours}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Teléfono</span>
            <a className="fact-value" href={business.phoneHref}>
              {business.phoneDisplay}
            </a>
          </div>
          <div className="fact">
            <span className="fact-label">Dirección</span>
            <span className="fact-value">
              {business.street} · {business.town}
            </span>
          </div>
        </section>

        <section className="chapter" id="consulta" aria-labelledby="consulta-t">
          <div className="chapter-head">
            <span className="chapter-n" aria-hidden="true">
              01
            </span>
            <h2 id="consulta-t">La consulta</h2>
          </div>
          <div className="chapter-body two">
            <p className="lead">
              {business.name} es una consulta de psicología en {business.town}, en el Aljarafe sevillano.
            </p>
            <div className="prose">
              <p>
                Pedir ayuda es una decisión personal y, a veces, lo más difícil es saber por dónde empezar. Por
                eso aquí la información está a la vista: cuándo se atiende, dónde está la consulta y cómo
                solicitar una primera cita sin tener que dar explicaciones por adelantado.
              </p>
              <p>
                El horario de atención es de lunes a viernes, de 10:00 a 21:00, también por la tarde para quien
                trabaja o estudia por la mañana.
              </p>
            </div>
          </div>
          <blockquote className="pull">
            <p>Tu primera cita, en tus términos: eliges el hueco y lo demás se habla en persona.</p>
          </blockquote>
        </section>

        <section className="chapter" id="primera-cita" aria-labelledby="primera-t">
          <div className="chapter-head">
            <span className="chapter-n" aria-hidden="true">
              02
            </span>
            <h2 id="primera-t">Cómo es la primera cita</h2>
          </div>
          <ol className="steps">
            <li>
              <span className="step-n">I</span>
              <h3>Eliges un hueco</h3>
              <p>Ves los días y horas disponibles y solicitas el que mejor te encaje, sin llamadas ni esperas.</p>
            </li>
            <li>
              <span className="step-n">II</span>
              <h3>La consulta te confirma</h3>
              <p>Recibes la confirmación en el teléfono que indiques. Si hace falta mover la hora, se acuerda contigo.</p>
            </li>
            <li>
              <span className="step-n">III</span>
              <h3>Primera conversación</h3>
              <p>Cuentas lo que te preocupa, resuelves tus dudas y valoráis juntos cómo continuar.</p>
            </li>
          </ol>
        </section>

        <section className="chapter chapter-booking" id="cita" aria-labelledby="cita-t">
          <div className="chapter-head">
            <span className="chapter-n" aria-hidden="true">
              03
            </span>
            <h2 id="cita-t">Pedir cita</h2>
          </div>
          <p className="chapter-intro">
            Toca un hueco libre de la semana para solicitarlo. Solo te pediremos tu nombre y un teléfono.
          </p>
          <Booking />
        </section>

        <section className="chapter" id="ubicacion" aria-labelledby="ubicacion-t">
          <div className="chapter-head">
            <span className="chapter-n" aria-hidden="true">
              04
            </span>
            <h2 id="ubicacion-t">Dónde estamos</h2>
          </div>
          <div className="place">
            <address className="place-card">
              <span className="place-line big">{business.street}</span>
              <span className="place-line">
                {business.town}, {business.province}
              </span>
              <span className="place-rule" aria-hidden="true" />
              <span className="place-line">{business.hours}</span>
              <a className="place-line" href={business.phoneHref}>
                {business.phoneDisplay}
              </a>
            </address>
            <div className="place-actions">
              <a className="btn" href={business.mapsHref} target="_blank" rel="noopener noreferrer">
                Abrir en Google Maps
              </a>
              <a className="btn btn-ghost" href={business.phoneHref}>
                Llamar
              </a>
              <p className="place-note">
                Si es tu primera visita y tienes dudas sobre el acceso, llama antes y te indicamos cómo llegar.
              </p>
            </div>
          </div>
        </section>

        <section className="chapter" id="preguntas" aria-labelledby="preguntas-t">
          <div className="chapter-head">
            <span className="chapter-n" aria-hidden="true">
              05
            </span>
            <h2 id="preguntas-t">Preguntas frecuentes</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>
                  <span>{f.q}</span>
                  <span className="faq-sign" aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-brand">
          <span className="brand-mark" aria-hidden="true">
            PB
          </span>
          <p>
            <strong>{business.name}</strong>
            <br />
            {business.street}
            <br />
            {business.town}, {business.province}
          </p>
        </div>
        <p className="foot-contact">
          <a href={business.phoneHref}>{business.phoneDisplay}</a>
          <br />
          {business.hours}
        </p>
        <p className="foot-demo">
          Web de demostración: no es la web oficial de {business.name}. La reserva es simulada y no envía ni
          guarda ningún dato.
        </p>
      </footer>

      <nav className="dock" aria-label="Acciones rápidas">
        <a href={business.phoneHref}>Llamar</a>
        <a className="dock-main" href="#cita">
          Pedir cita
        </a>
      </nav>
    </>
  );
}
