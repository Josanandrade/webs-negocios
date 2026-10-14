import { academy, faqs, nav, steps } from "@/content/site";
import { HeroPaths } from "@/components/HeroPaths";
import { Audience } from "@/components/Audience";
import { Solicitud } from "@/components/Solicitud";

function Wordmark() {
  return (
    <a href="#inicio" className="wordmark" aria-label={`${academy.name}, inicio`}>
      <span className="wm-dots" aria-hidden="true">
        <i style={{ background: "var(--sky)" }} />
        <i style={{ background: "var(--lime)" }} />
        <i style={{ background: "var(--lilac)" }} />
        <i style={{ background: "var(--mandarin)" }} />
      </span>
      <span className="wm-text">
        <small>Academia</small>
        Diversidad
      </span>
    </a>
  );
}

export default function Home() {
  return (
    <>
      <header className="top">
        <div className="wrap top-in">
          <Wordmark />
          <nav aria-label="Principal">
            {nav.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <a className="btn btn-primary btn-sm" href="#apuntarme">
            Quiero apuntarme
          </a>
        </div>
      </header>

      <main id="inicio">
        {/* Portada */}
        <section className="hero">
          <div className="wrap hero-in">
            <div className="hero-copy">
              <p className="kicker">
                <span className="pin" aria-hidden="true" /> Academia en {academy.town}, {academy.province}
              </p>
              <h1>
                Cada alumno llega desde un sitio <span className="hl">distinto.</span>
                <br />
                Aquí avanzamos <em>juntos</em>.
              </h1>
              <p className="lead">
                Formación adaptada a cada alumno, con trato cercano. Cuéntanos qué necesitas y {academy.name} te ayuda a encontrar
                tu siguiente paso.
              </p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#solicitud">
                  Solicita información
                </a>
                <a className="btn btn-line" href={academy.phoneHref}>
                  <PhoneIcon /> {academy.phoneDisplay}
                </a>
              </div>
            </div>
            <div className="hero-art">
              <HeroPaths />
            </div>
          </div>
        </section>

        {/* La academia */}
        <section className="intro" id="academia">
          <div className="wrap intro-in">
            <h2 className="section-tag">La academia</h2>
            <p className="big-statement">
              Se llama <strong>Diversidad</strong> por algo: no hay dos alumnos iguales, ni dos maneras iguales de aprender.
            </p>
            <div className="intro-cols">
              <p>
                {academy.name} es una academia de {academy.town}. Una academia de pueblo, cercana, donde las familias saben con quién
                hablan y los alumnos saben a quién preguntar.
              </p>
              <p>
                Esta web reúne en un solo sitio lo que una familia o un alumno necesita para dar el primer paso: conocer la academia,
                resolver dudas y enviar una solicitud sin esperas.
              </p>
            </div>
          </div>
        </section>

        {/* Familias y alumnos */}
        <section className="who">
          <div className="wrap">
            <div className="section-head">
              <h2 className="section-tag">Qué puedes encontrar</h2>
              <p className="h2">Escribe tanto si eres familia como si eres alumno o alumna.</p>
            </div>
            <Audience />
          </div>
        </section>

        {/* Opciones formativas */}
        <section className="offer">
          <div className="wrap offer-in">
            <div>
              <h2 className="section-tag light">Opciones formativas</h2>
              <p className="offer-title">Antes de recomendarte nada, preferimos escucharte.</p>
            </div>
            <div className="offer-side">
              <p>
                Consulta nuestras opciones formativas contándonos tu caso: qué estudias, qué te cuesta o qué quieres conseguir.
                La academia te explicará qué puede encajar contigo.
              </p>
              <a className="btn btn-paper" href="#solicitud">
                Cuéntanos qué necesitas
              </a>
            </div>
          </div>
        </section>

        {/* Cómo empezar */}
        <section className="start" id="empezar">
          <div className="wrap">
            <div className="section-head">
              <h2 className="section-tag">Cómo empezar</h2>
              <p className="h2">Cuatro pasos, y el primero es el más fácil.</p>
            </div>
            <ol className="route">
              {steps.map((s, i) => (
                <li key={s.n} style={{ ["--i" as string]: i }}>
                  <span className="route-dot" aria-hidden="true" />
                  <span className="route-n">{s.n}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Solicitud */}
        <section className="apply" id="solicitud">
          <span id="apuntarme" className="anchor" aria-hidden="true" />
          <div className="wrap apply-in">
            <div className="apply-copy">
              <h2 className="section-tag">Solicitud</h2>
              <p className="h2">Pide información o dinos que quieres apuntarte.</p>
              <p>
                Rellena tres pasos cortos. {academy.name} recibe tu solicitud y se pone en contacto contigo como prefieras.
              </p>
              <p className="apply-alt">
                ¿Prefieres hablar directamente? Llama al <a href={academy.phoneHref}>{academy.phoneDisplay}</a>.
              </p>
            </div>
            <Solicitud />
          </div>
        </section>

        {/* Todo en un mismo entorno */}
        <section className="inside">
          <div className="wrap inside-in">
            <div>
              <h2 className="section-tag light">Para la academia</h2>
              <p className="inside-title">Las solicitudes, los grupos y los avisos, en un mismo sitio.</p>
              <p className="inside-text">
                La misma web puede crecer con la academia: recibir solicitudes ordenadas, organizar grupos y enviar avisos a familias
                y alumnos desde un único panel.
              </p>
            </div>
            <div className="panel" aria-label="Ejemplo ilustrativo de panel interno">
              <div className="panel-bar">
                <span className="panel-dots" aria-hidden="true"><i /><i /><i /></span>
                <span>Panel de la academia</span>
                <span className="panel-tag">Ejemplo ilustrativo</span>
              </div>
              <div className="panel-grid">
                <div className="panel-card">
                  <span className="pc-k">Solicitudes nuevas</span>
                  <span className="pc-v">3</span>
                  <ul>
                    <li><b className="dot sky" />Familia · Información</li>
                    <li><b className="dot mandarin" />Alumno/a · Quiero apuntarme</li>
                    <li><b className="dot lime" />Familia · Resolver una duda</li>
                  </ul>
                </div>
                <div className="panel-card">
                  <span className="pc-k">Grupos</span>
                  <ul className="bars">
                    <li><span>Grupo A</span><i style={{ width: "80%" }} /></li>
                    <li><span>Grupo B</span><i style={{ width: "55%" }} /></li>
                    <li><span>Grupo C</span><i style={{ width: "35%" }} /></li>
                  </ul>
                </div>
                <div className="panel-card wide">
                  <span className="pc-k">Aviso a familias</span>
                  <p>«Recordatorio: mañana cambia el horario del Grupo B.»</p>
                  <span className="pc-foot">Enviar por email · Programar</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preguntas */}
        <section className="faq" id="preguntas">
          <div className="wrap faq-in">
            <div className="section-head">
              <h2 className="section-tag">Preguntas frecuentes</h2>
              <p className="h2">Lo que suele preguntarse antes de empezar.</p>
            </div>
            <div className="faq-list">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>
                    {f.q}
                    <span className="plus" aria-hidden="true" />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section className="contact" id="contacto">
          <div className="wrap contact-in">
            <div className="contact-main">
              <h2 className="section-tag">Ubicación y contacto</h2>
              <p className="contact-town">
                {academy.town}
                <span>{academy.province}</span>
              </p>
              <a className="contact-phone" href={academy.phoneHref}>
                <PhoneIcon /> {academy.phoneDisplay}
              </a>
            </div>
            <div className="contact-cards">
              <a className="c-card" href={academy.phoneHref}>
                <span className="c-k">Llamar</span>
                <span className="c-v">{academy.phoneDisplay}</span>
                <span className="c-a">Habla directamente con la academia →</span>
              </a>
              <a className="c-card" href="#solicitud">
                <span className="c-k">Escribir</span>
                <span className="c-v">Formulario de solicitud</span>
                <span className="c-a">Te contactamos como prefieras →</span>
              </a>
              <a className="c-card" href={academy.mapsHref} target="_blank" rel="noopener noreferrer">
                <span className="c-k">Cómo llegar</span>
                <span className="c-v">{academy.town}, {academy.province}</span>
                <span className="c-a">Abrir en Google Maps ↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot-in">
          <Wordmark />
          <p>
            {academy.name} · {academy.town} ({academy.province}) · <a href={academy.phoneHref}>{academy.phoneDisplay}</a>
          </p>
          <p className="demo-note">Web de demostración: no es la web oficial de la academia. Los formularios no envían ni guardan datos.</p>
        </div>
      </footer>

      <div className="mobile-bar">
        <a href={academy.phoneHref} className="mb-call" aria-label={`Llamar al ${academy.phoneDisplay}`}>
          <PhoneIcon /> Llamar
        </a>
        <a href="#solicitud" className="mb-main">
          Solicitar información
        </a>
      </div>
    </>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}
