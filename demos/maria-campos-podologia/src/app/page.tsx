import Booking from "@/components/Booking";
import ReasonLink from "@/components/ReasonLink";
import { practice, reasons } from "@/content/site";

const Arrow = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="ico">
    <path d="M4 10h11M11 5.5 15.5 10 11 14.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Phone = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="ico">
    <path
      d="M6.2 2.8 4.4 3.4c-.9.3-1.4 1.2-1.2 2.1.9 4.9 4.4 8.4 9.3 9.3.9.2 1.8-.3 2.1-1.2l.6-1.8-3.1-1.6-1.4 1.4c-1.6-.7-3-2.1-3.7-3.7l1.4-1.4z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Home() {
  return (
    <>
      <header className="top">
        <a href="#inicio" className="wordmark" aria-label={`${practice.name}, inicio`}>
          <span>María Campos</span>
          <small>Podología · {practice.town}</small>
        </a>
        <nav aria-label="Secciones">
          <a href="#consulta">La consulta</a>
          <a href="#motivos">Motivos</a>
          <a href="#donde">Dónde</a>
        </nav>
        <a href="#cita" className="btn btn-ink top-cta">
          Pedir cita
        </a>
      </header>

      <main id="inicio">
        <section className="hero">
          <div className="hero-text">
            <p className="kicker">
              {practice.role} en {practice.town}, {practice.province}
            </p>
            <h1>
              María
              <br />
              Campos <span>Rodríguez</span>
            </h1>
            <p className="lead">
              Tu consulta de podología en la Avenida Aljarafe. Pide cita desde aquí cuando te venga bien: eliges motivo,
              día y hora, y te queda confirmada al momento.
            </p>
            <div className="hero-actions">
              <a href="#cita" className="btn btn-honey">
                Elegir día y hora <Arrow />
              </a>
              <a href={practice.phoneHref} className="btn btn-line">
                <Phone /> {practice.phone}
              </a>
            </div>
          </div>

          <div className="hero-cards" aria-hidden="true">
            <div className="paper-card">
              <p className="paper-title">Próxima cita</p>
              <p className="paper-line">
                Día <span />
              </p>
              <p className="paper-line">
                Hora <span />
              </p>
              <p className="paper-small">Si no puede asistir, avise por teléfono.</p>
            </div>
            <div className="visit-card">
              <p className="visit-name">{practice.name}</p>
              <p className="visit-role">{practice.role}</p>
              <hr />
              <p>
                {practice.street}
                <br />
                {practice.postcode} {practice.town} · {practice.province}
              </p>
              <p className="visit-phone">{practice.phone}</p>
              <span className="visit-dot" />
            </div>
          </div>
        </section>

        <section className="intro" id="consulta">
          <h2 className="intro-quote">
            Una consulta con nombre y apellidos, <span>a un paso de casa.</span>
          </h2>
          <div className="intro-body">
            <p>
              {practice.name} es podóloga y atiende en su consulta de {practice.town}. Esta web reúne en un solo sitio lo que
              un paciente necesita: pedir cita, contar el motivo antes de llegar y tener a mano la dirección y el teléfono.
            </p>
            <dl className="facts">
              <div>
                <dt>Quién</dt>
                <dd>
                  {practice.name}, {practice.role.toLowerCase()}
                </dd>
              </div>
              <div>
                <dt>Dónde</dt>
                <dd>
                  {practice.street}, {practice.town}
                </dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>
                  <a href={practice.phoneHref}>{practice.phone}</a>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="shift" aria-labelledby="shift-title">
          <div className="shift-head">
            <p className="kicker">De la tarjetita de papel a la agenda</p>
            <h2 id="shift-title">Menos llamadas para cuadrar una hora.</h2>
          </div>
          <ol className="shift-list">
            <li>
              <b>Pides cita cuando puedes.</b>
              <span>Por la noche, en el descanso del trabajo o en domingo. Sin esperar a que alguien coja el teléfono.</span>
            </li>
            <li>
              <b>Llegas con la ficha hecha.</b>
              <span>Tus datos y el motivo de la visita quedan guardados antes de entrar por la puerta.</span>
            </li>
            <li>
              <b>Recordatorio el día antes.</b>
              <span>Con un enlace para cambiar o anular la cita y dejar el hueco libre para otra persona.</span>
            </li>
          </ol>
        </section>

        <section className="reasons-index" id="motivos" aria-labelledby="motivos-title">
          <div className="reasons-head">
            <h2 id="motivos-title">¿Para qué quieres la cita?</h2>
            <p>
              Elige el motivo y la agenda te lleva directo al día y la hora. Si no lo tienes claro, marca «Otro motivo» o
              llama a la consulta.
            </p>
          </div>
          <ul>
            {reasons.map((r, i) => (
              <li key={r.id}>
                <ReasonLink id={r.id}>
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="txt">
                    <b>{r.label}</b>
                    <small>{r.hint}</small>
                  </span>
                  <span className="go">
                    Reservar <Arrow />
                  </span>
                </ReasonLink>
              </li>
            ))}
          </ul>
        </section>

        <section className="cita" id="cita" aria-labelledby="cita-title">
          <div className="cita-head">
            <h2 id="cita-title">Pide tu cita</h2>
            <p className="sample">Agenda de ejemplo: los huecos que ves no son reales.</p>
          </div>
          <Booking />
        </section>

        <section className="donde" id="donde" aria-labelledby="donde-title">
          <div>
            <p className="kicker">Dónde estamos</p>
            <h2 id="donde-title" className="address">
              Avenida Aljarafe, 19
              <span>bajo 3 · {practice.postcode} {practice.town}</span>
            </h2>
          </div>
          <div className="donde-info">
            <dl>
              <div>
                <dt>Teléfono</dt>
                <dd>
                  <a href={practice.phoneHref}>{practice.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Horario</dt>
                <dd>Consúltalo por teléfono o elige un hueco en la agenda.</dd>
              </div>
            </dl>
            <a href={practice.mapsHref} className="btn btn-line" target="_blank" rel="noopener noreferrer">
              Cómo llegar <Arrow />
            </a>
          </div>
        </section>
      </main>

      <footer className="foot">
        <p className="foot-name">{practice.name}</p>
        <p>
          {practice.role} · {practice.street}, {practice.postcode} {practice.town} ({practice.province}) ·{" "}
          <a href={practice.phoneHref}>{practice.phone}</a>
        </p>
        <p className="foot-demo">
          Web de demostración: no es la web oficial de la consulta. Las citas son simuladas y no se envía ningún dato.
        </p>
      </footer>

      <div className="mobile-bar">
        <a href={practice.phoneHref} aria-label={`Llamar al ${practice.phone}`}>
          <Phone /> Llamar
        </a>
        <a href="#cita" className="mobile-cta">
          Pedir cita
        </a>
      </div>
    </>
  );
}
