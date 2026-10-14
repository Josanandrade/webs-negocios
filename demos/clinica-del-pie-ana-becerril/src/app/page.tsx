import Booking from "@/components/Booking";
import TextSize from "@/components/TextSize";
import { faqs, practice } from "@/content/site";

const NAV = [
  { href: "#consulta", label: "La consulta", short: "Consulta" },
  { href: "#cita", label: "Pedir cita", short: "Cita" },
  { href: "#horario", label: "Horario y dirección", short: "Horario" },
  { href: "#preguntas", label: "Preguntas", short: "Preguntas" },
];

const COMPARE = [
  { what: "Cuándo se pide", phone: "En horario de consulta, si hay línea libre", web: "A cualquier hora, también de noche o en fin de semana" },
  { what: "Elegir la hora", phone: "Se buscan huecos de palabra", web: "Ve las horas libres y elige la que le viene bien" },
  { what: "Sus datos", phone: "Se apuntan durante la llamada", web: "Llegan escritos, con el motivo y su nota" },
  { what: "Dudas de siempre", phone: "Cada paciente vuelve a preguntar", web: "Respondidas en esta misma página" },
];

export default function Home() {
  return (
    <>
      <a className="skip" href="#cita">Ir directamente a pedir cita</a>

      <header className="top">
        <div className="top__in">
          <a href="#inicio" className="brand" aria-label={`${practice.name}, inicio`}>
            <span className="brand__mark" aria-hidden="true">AB</span>
            <span className="brand__text">
              <span className="brand__name">{practice.name}</span>
              <span className="brand__sub">{practice.role} {practice.professional}</span>
            </span>
          </a>
          <div className="top__actions">
            <a className="btn btn--ghost btn--sm top__call" href={practice.phoneHref}>
              <PhoneIcon /> <span className="hide-xs">Llamar {practice.phone}</span><span className="show-xs">Llamar</span>
            </a>
            <a className="btn btn--primary btn--sm" href="#cita">Pedir cita</a>
          </div>
        </div>
      </header>
      <nav className="nav" aria-label="Secciones">
        <ul className="nav__in">
          {NAV.map((n) => (
            <li key={n.href}>
              <a href={n.href}>
                <span className="hide-xs">{n.label}</span>
                <span className="show-xs">{n.short}</span>
              </a>
            </li>
          ))}
          <li className="nav__tool"><TextSize /></li>
        </ul>
      </nav>

      <main id="inicio">
        <section className="hero">
          <div className="hero__in">
            <div className="hero__copy">
              <p className="kicker">Consulta de podología en {practice.town}</p>
              <h1>Pida su cita con la podóloga sin esperar al teléfono.</h1>
              <p className="lead">
                Elija el día y la hora que le vengan bien, deje su nombre y su teléfono, y listo.
                Y si lo prefiere, puede seguir llamando como siempre.
              </p>
              <div className="hero__cta">
                <a className="btn btn--primary btn--lg" href="#cita">Pedir cita ahora</a>
                <a className="btn btn--ghost btn--lg" href={practice.phoneHref}>
                  <PhoneIcon /> Llamar al {practice.phone}
                </a>
              </div>
            </div>

            <div className="hero__plate">
              <div className="plate" role="img" aria-label={`Placa de la consulta: ${practice.name}, ${practice.role} ${practice.professional}, ${practice.street}, ${practice.town}`}>
                <span className="plate__screw plate__screw--tl" />
                <span className="plate__screw plate__screw--tr" />
                <span className="plate__screw plate__screw--bl" />
                <span className="plate__screw plate__screw--br" />
                <p className="plate__clinic">{practice.name}</p>
                <span className="plate__rule" />
                <p className="plate__role">{practice.role}</p>
                <p className="plate__name">{practice.professional}</p>
                <p className="plate__town">{practice.town}</p>
              </div>
              <ol className="howto" aria-label="Cómo pedir cita">
                <li><span>1</span>Elija el día</li>
                <li><span>2</span>Elija la hora</li>
                <li><span>3</span>Deje su nombre y teléfono</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="section" id="consulta" aria-labelledby="consulta-t">
          <div className="wrap two">
            <div>
              <p className="kicker">La consulta</p>
              <h2 id="consulta-t">{practice.professional}, podóloga en {practice.town}.</h2>
              <p className="prose">
                La {practice.name} de {practice.town} es la consulta de podología de {practice.professional}.
                Desde esta página puede pedir su cita, ver cómo llegar y resolver las dudas más habituales antes de venir.
              </p>
              <p className="prose">
                Si tiene dudas sobre qué cita pedir, puede llamar antes a la consulta.
              </p>
            </div>
            <div className="card-ficha">
              <p className="card-ficha__title">Datos de la consulta</p>
              <dl className="ficha">
                <div><dt>Profesional</dt><dd>{practice.professional}, {practice.role.toLowerCase()}</dd></div>
                <div><dt>Dirección</dt><dd>{practice.street}<br />{practice.postcode} {practice.town} ({practice.province})</dd></div>
                <div><dt>Teléfono</dt><dd><a href={practice.phoneHref}>{practice.phone}</a></dd></div>
                <div><dt>Cita</dt><dd>Por teléfono o desde esta web</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section className="section section--cita" id="cita" aria-labelledby="cita-t">
          <div className="wrap">
            <p className="kicker">Pedir cita</p>
            <h2 id="cita-t">Su cita en cuatro respuestas.</h2>
            <p className="prose prose--narrow">
              Conteste a las cuatro preguntas y pulse «Enviar solicitud». Las horas que se ven aquí son de ejemplo.
            </p>
            <Booking />
          </div>
        </section>

        <section className="section" aria-labelledby="web-t">
          <div className="wrap">
            <p className="kicker">Menos llamadas, mejor organizadas</p>
            <h2 id="web-t">Lo mismo de siempre, pero sin depender del teléfono.</h2>
            <div className="compare" role="table" aria-label="Pedir cita por teléfono o desde la web">
              <div className="compare__row compare__row--head" role="row">
                <span role="columnheader" />
                <span role="columnheader">Por teléfono</span>
                <span role="columnheader">Desde la web</span>
              </div>
              {COMPARE.map((c) => (
                <div className="compare__row" role="row" key={c.what}>
                  <span role="rowheader" className="compare__what">{c.what}</span>
                  <span role="cell" className="compare__phone"><em className="compare__tag">Por teléfono</em>{c.phone}</span>
                  <span role="cell" className="compare__web"><em className="compare__tag">Desde la web</em>{c.web}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--where" id="horario" aria-labelledby="horario-t">
          <div className="wrap two">
            <div>
              <p className="kicker">Horario</p>
              <h2 id="horario-t">Horario de atención</h2>
              <div className="notice">
                <p>
                  El horario de la consulta se confirma por teléfono. Llame al{" "}
                  <a href={practice.phoneHref}>{practice.phone}</a> y se lo indican.
                </p>
              </div>
              <a className="btn btn--ghost btn--lg" href={practice.phoneHref}>
                <PhoneIcon /> Llamar a la consulta
              </a>
            </div>
            <div>
              <p className="kicker">Cómo llegar</p>
              <h2>Dirección</h2>
              <address className="address">
                <span className="address__street">{practice.street}</span>
                <span>{practice.postcode} {practice.town}</span>
                <span>{practice.province}</span>
              </address>
              <a className="btn btn--primary btn--lg" href={practice.mapsHref} target="_blank" rel="noopener noreferrer">
                Abrir en el mapa
              </a>
            </div>
          </div>
        </section>

        <section className="section" id="preguntas" aria-labelledby="faq-t">
          <div className="wrap wrap--narrow">
            <p className="kicker">Preguntas frecuentes</p>
            <h2 id="faq-t">Antes de pedir su cita</h2>
            <div className="faq">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
            <div className="faq__end">
              <p>¿Tiene otra pregunta?</p>
              <a className="btn btn--ghost" href={practice.phoneHref}><PhoneIcon /> {practice.phone}</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot__in">
          <div>
            <p className="foot__name">{practice.name}</p>
            <p>{practice.role} {practice.professional}</p>
            <p>{practice.street}, {practice.postcode} {practice.town} ({practice.province})</p>
            <p><a href={practice.phoneHref}>{practice.phone}</a></p>
          </div>
          <p className="foot__demo">
            Web de demostración: no es la web oficial de la consulta. La reserva es simulada y no envía ni guarda ningún dato.
          </p>
        </div>
      </footer>
    </>
  );
}

function PhoneIcon() {
  return (
    <svg className="ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
      />
    </svg>
  );
}
