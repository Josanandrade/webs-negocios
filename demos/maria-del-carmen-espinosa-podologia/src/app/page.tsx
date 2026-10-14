import { AgendaProvider } from "@/components/AgendaContext";
import AgendaView from "@/components/AgendaView";
import Booking from "@/components/Booking";
import { appointmentType, practice } from "@/content/site";

const Arrow = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="ico">
    <path d="M4 10h11M11 5.5 15.5 10 11 14.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

// La puerta de la consulta: un bajo con su placa y su maceta.
function Door() {
  return (
    <svg viewBox="0 0 360 420" className="door" role="img" aria-label={`Puerta de la consulta en ${practice.street}, ${practice.town}`}>
      <rect x="0" y="0" width="360" height="420" rx="28" fill="var(--wall)" />
      <path d="M70 400V170a110 110 0 0 1 220 0v230z" fill="var(--sage-200)" />
      <path d="M92 400V176a88 88 0 0 1 176 0v224z" fill="var(--green-ink)" />
      <path d="M180 92v308" stroke="var(--green-deep)" strokeWidth="3" />
      <rect x="108" y="200" width="56" height="78" rx="6" fill="none" stroke="var(--green-soft)" strokeWidth="2" />
      <rect x="196" y="200" width="56" height="78" rx="6" fill="none" stroke="var(--green-soft)" strokeWidth="2" />
      <rect x="108" y="300" width="56" height="78" rx="6" fill="none" stroke="var(--green-soft)" strokeWidth="2" />
      <rect x="196" y="300" width="56" height="78" rx="6" fill="none" stroke="var(--green-soft)" strokeWidth="2" />
      <circle cx="166" cy="290" r="5" fill="var(--brass)" />
      <circle cx="194" cy="290" r="5" fill="var(--brass)" />
      {/* Número */}
      <rect x="160" y="40" width="40" height="34" rx="5" fill="var(--paper)" stroke="var(--sage-600)" strokeWidth="2" />
      <text x="180" y="64" textAnchor="middle" className="door-num">
        10
      </text>
      {/* Placa */}
      <g transform="translate(18 196)">
        <rect width="44" height="64" rx="4" fill="var(--brass)" />
        <rect x="4" y="4" width="36" height="56" rx="2" fill="none" stroke="var(--brass-dark)" strokeWidth="1" />
        <text x="22" y="28" textAnchor="middle" className="plate-big">
          MC
        </text>
        <text x="22" y="44" textAnchor="middle" className="plate-small">
          PODOLOGÍA
        </text>
      </g>
      {/* Escalón */}
      <rect x="58" y="398" width="244" height="12" rx="3" fill="var(--sage-600)" />
      {/* Maceta con geranios */}
      <g transform="translate(300 300)">
        <circle cx="0" cy="40" r="20" fill="var(--sage-600)" />
        <circle cx="-14" cy="52" r="15" fill="var(--sage-400)" />
        <circle cx="14" cy="54" r="14" fill="var(--sage-400)" />
        <circle cx="-6" cy="30" r="9" fill="var(--geranium)" />
        <circle cx="10" cy="36" r="8" fill="var(--geranium)" />
        <circle cx="-16" cy="42" r="7" fill="var(--geranium-light)" />
        <circle cx="4" cy="24" r="6" fill="var(--geranium-light)" />
        <path d="M-24 66h48l-7 44h-34z" fill="var(--clay)" />
        <rect x="-27" y="62" width="54" height="9" rx="2" fill="var(--clay-dark)" />
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <AgendaProvider>
      <a href="#cita" className="skip">
        Ir a pedir cita
      </a>
      <header className="top">
        <a href="#inicio" className="brand" aria-label={`${practice.kind} ${practice.name}, inicio`}>
          <span className="brand-mark" aria-hidden="true">
            MC
          </span>
          <span className="brand-text">
            <span>{practice.shortName}</span>
            <small>Podología · {practice.town}</small>
          </span>
        </a>
        <nav aria-label="Secciones">
          <a href="#consulta">La consulta</a>
          <a href="#donde">Dónde estamos</a>
        </nav>
        <a href="#cita" className="btn btn-main btn-sm">
          Pedir cita
        </a>
      </header>

      <main id="inicio">
        <section className="hero">
          <div className="hero-text">
            <p className="eyebrow">
              {practice.kind} · {practice.area}, {practice.town}
            </p>
            <h1>
              Podología cerca de casa. <em>Y la cita, sin esperar al teléfono.</em>
            </h1>
            <p className="lead">
              La consulta de <strong>{practice.name}</strong> en la Calle Agramonte. Mira qué huecos quedan libres, elige día y hora,
              y llévate la cita confirmada en un minuto.
            </p>
            <div className="hero-actions">
              <a href="#cita" className="btn btn-main">
                Ver huecos libres <Arrow />
              </a>
              <a href={practice.phoneHref} className="btn btn-line">
                <Phone /> {practice.phone}
              </a>
            </div>
          </div>
          <div className="hero-art">
            <Door />
            <p className="hero-tag">
              <span className="dot" aria-hidden="true" /> {practice.street}
            </p>
          </div>
        </section>

        <section id="consulta" className="who">
          <div className="who-mark" aria-hidden="true">
            <span>MC</span>
          </div>
          <div className="who-text">
            <p className="eyebrow">La consulta</p>
            <h2>Una consulta con nombre propio.</h2>
            <p>
              {practice.kind} {practice.name} es una consulta pequeña, en un bajo de la {practice.area}, en {practice.town}. Esta
              página está pensada para que encuentres a la primera lo que necesitas: dónde está, cómo llegar y qué huecos quedan.
            </p>
            <dl className="facts">
              <div>
                <dt>Qué</dt>
                <dd>{appointmentType}</dd>
              </div>
              <div>
                <dt>Dónde</dt>
                <dd>
                  {practice.street}, {practice.town}
                </dd>
              </div>
              <div>
                <dt>Cita</dt>
                <dd>Aquí mismo o llamando al {practice.phone}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section id="cita" className="book">
          <div className="section-head">
            <p className="eyebrow">Pedir cita</p>
            <h2>Elige tu hueco tú mismo.</h2>
            <p className="lead small-lead">Tres pasos y lo tienes: día y hora, tus datos y confirmar.</p>
          </div>
          <Booking />
        </section>

        <section id="agenda" className="agenda">
          <div className="agenda-text">
            <p className="eyebrow eyebrow-light">Del otro lado</p>
            <h2>Y en la consulta, la agenda se ordena sola.</h2>
            <ul className="gains">
              <li>
                <strong>Menos llamadas para preguntar si hay hueco.</strong> Los pacientes ven las horas libres sin tener que llamar
                ni escribir.
              </li>
              <li>
                <strong>Cada cita entra con sus datos.</strong> Nombre, teléfono, si es la primera vez y lo que quieran contar.
              </li>
              <li>
                <strong>Todo en el móvil.</strong> El día de un vistazo, sin libreta ni mensajes sueltos.
              </li>
            </ul>
            <p className="agenda-hint">Pide una cita de prueba arriba y verás cómo aparece aquí.</p>
          </div>
          <AgendaView />
        </section>

        <section id="donde" className="where">
          <div className="where-info">
            <p className="eyebrow">Dónde estamos</p>
            <h2>En la {practice.area}.</h2>
            <address>
              {practice.street}
              <br />
              {practice.postcode} {practice.town}, {practice.province}
            </address>
            <div className="where-actions">
              <a href={practice.mapsHref} className="btn btn-main" target="_blank" rel="noopener noreferrer">
                Cómo llegar <Arrow />
              </a>
              <a href={practice.phoneHref} className="btn btn-line">
                <Phone /> Llamar
              </a>
            </div>
            <details className="faq">
              <summary>¿Hay hueco esta semana?</summary>
              <p>
                Míralo en <a href="#cita">Pedir cita</a>: solo aparecen las horas que siguen libres.
              </p>
            </details>
            <details className="faq">
              <summary>¿Y si prefiero llamar?</summary>
              <p>
                Claro. El teléfono de la consulta es el <a href={practice.phoneHref}>{practice.phone}</a>.
              </p>
            </details>
          </div>
          <div className="map">
            <iframe title={`Mapa: ${practice.street}, ${practice.town}`} src={practice.mapsEmbed} loading="lazy" referrerPolicy="no-referrer" />
          </div>
        </section>
      </main>

      <footer className="foot">
        <div>
          <strong>
            {practice.kind} {practice.name}
          </strong>
          <p>
            {practice.street} · {practice.postcode} {practice.town} · <a href={practice.phoneHref}>{practice.phone}</a>
          </p>
        </div>
        <p className="foot-demo">Web de demostración: no es la web oficial de la consulta y no gestiona citas reales.</p>
      </footer>
    </AgendaProvider>
  );
}
