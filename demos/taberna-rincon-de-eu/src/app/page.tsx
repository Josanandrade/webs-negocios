import Azulejo from "@/components/Azulejo";
import Booking from "@/components/Booking";
import MobileCta from "@/components/MobileCta";
import { business, goodToKnow, house, sung } from "@/content/site";

const nav = [
  { href: "#casa", label: "La casa" },
  { href: "#pizarra", label: "Lo que se canta" },
  { href: "#tablon", label: "Tablón" },
  { href: "#visita", label: "Antes de venir" },
  { href: "#reservar", label: "Reservar" },
];

export default function Home() {
  return (
    <>
      <header className="sign">
        <a href="#top" className="sign-name" aria-label={`${business.name}, inicio`}>
          <span className="sign-small">Taberna</span>
          <span className="sign-big">Rincón de Eu</span>
        </a>
        <nav className="sign-nav" aria-label="Secciones">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className={n.href === "#reservar" ? "is-cta" : undefined}>{n.label}</a>
          ))}
        </nav>
      </header>

      <main id="top">
        {/* Portada: la idea de la casa en una frase y la pizarra del día. */}
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-kicker">Calle Murillo, 14 · {business.town} · desde {business.since}</p>
            <h1>
              Aquí la carta
              <br />no se lee.
              <em>Se canta.</em>
            </h1>
            <p className="hero-lede">
              Una casa de pueblo convertida en taberna. Eu se acerca a la mesa y te cuenta lo que ha traído hoy
              el mercado: tomate, pescado, guisos de cuchara y algo de carne. Para compartir y sin prisa.
            </p>
            <div className="hero-actions">
              <a href="#reservar" className="btn btn-red">Reservar mesa</a>
              <a href={business.phoneHref} className="btn btn-line">Llamar · {business.phone}</a>
            </div>
            <ul className="hero-facts">
              <li>Mediodías, de lunes a sábado</li>
              <li>Solo efectivo</li>
            </ul>
          </div>

          <figure className="board" aria-label="Pizarra de ejemplo con platos de la casa">
            <div className="board-frame">
              <div className="board-slate">
                <p className="board-title">Hoy, según mercado</p>
                <ul>
                  <li>Tomate con ventresca</li>
                  <li>Mejillones de O Grove</li>
                  <li>Fabes</li>
                  <li>Boquerones</li>
                  <li>Menudo</li>
                  <li>Presa ibérica</li>
                </ul>
                <p className="board-sign">— Eu</p>
              </div>
            </div>
            <figcaption>Pizarra de ejemplo con platos que se han servido en la casa. Cambia cada día.</figcaption>
          </figure>
        </section>

        <div className="band" aria-hidden="true"><Azulejo id="tile-a" /></div>

        {/* La casa: recorrido de la entrada al patio. */}
        <section id="casa" className="house">
          <div className="house-intro">
            <p className="kicker">La casa</p>
            <h2>Sin letrero grande. <br />Con más de treinta años detrás.</h2>
            <p>
              El Rincón de Eu lo abrió en {business.since} {business.cook}, cocinero de Pilas. Por fuera no hay un gran
              letrero ni una fachada llamativa. Por dentro, la casa se recorre de la barra al patio.
            </p>
          </div>
          <ol className="route">
            {house.map((h, i) => (
              <li key={h.key} className={`route-stop route-${h.key}`}>
                <span className="route-n">{String(i + 1).padStart(2, "0")}</span>
                <RouteIcon kind={h.key} />
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Lo que se canta: platos citados públicamente, sin precios. */}
        <section id="pizarra" className="sung">
          <div className="sung-head">
            <p className="kicker kicker-light">Lo que se canta</p>
            <h2>No hay carta impresa.<br />Hay lo que hay hoy.</h2>
            <p>
              Estos son platos que se han servido en la casa. No todos están cada día: depende de la temporada y del
              mercado. Si quieres saber el precio de algo, se pregunta en la mesa.
            </p>
          </div>
          <div className="sung-grid">
            {sung.map((g) => (
              <div key={g.group} className="sung-col">
                <h3>{g.group}</h3>
                <ul>
                  {g.dishes.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="sung-foot">
            Con una web propia, la casa podría publicar aquí la pizarra del día desde el móvil, en un minuto,
            para que quien venga sepa a qué viene.
          </p>
        </section>

        {/* Tablón: lo que la casa podría publicar en el futuro. */}
        <section id="tablon" className="board-notes">
          <div className="notes-head">
            <p className="kicker">Tablón de la casa</p>
            <h2>Un sitio para avisar sin depender de nadie</h2>
            <p>Así quedarían los avisos que hoy se cuentan de boca en boca. Los de abajo son ejemplos de formato.</p>
          </div>
          <div className="notes">
            <article className="note note-a">
              <span className="pin" aria-hidden="true" />
              <p className="note-tag">Plato especial</p>
              <h3>Lo que hoy merece aviso</h3>
              <p>Cuando entra algo fuera de lo habitual, una foto y dos líneas bastan para que se sepa.</p>
              <p className="note-ex">Ejemplo de formato</p>
            </article>
            <article className="note note-b">
              <span className="pin" aria-hidden="true" />
              <p className="note-tag">Jornadas</p>
              <h3>Unos días dedicados a un producto</h3>
              <p>Fechas, qué se va a cocinar y enlace directo a reservar mesa para esos días.</p>
              <p className="note-ex">Ejemplo de formato</p>
            </article>
            <article className="note note-c">
              <span className="pin" aria-hidden="true" />
              <p className="note-tag">Avisos</p>
              <h3>Cierres y cambios de horario</h3>
              <p>Vacaciones, festivos o un día con la casa llena: avisado aquí, menos llamadas preguntando.</p>
              <p className="note-ex">Ejemplo de formato</p>
            </article>
          </div>
        </section>

        {/* Antes de venir: información práctica, toda con fuente. */}
        <section id="visita" className="visit">
          <div className="visit-head">
            <p className="kicker">Antes de venir</p>
            <h2>Lo que conviene saber</h2>
          </div>
          <dl className="know">
            {goodToKnow.map((g) => (
              <div key={g.title}>
                <dt>{g.title}</dt>
                <dd>{g.text}</dd>
              </div>
            ))}
          </dl>

          <div className="where">
            <div className="plate" aria-hidden="true">
              <div className="plate-tiles"><Azulejo id="tile-plate" /></div>
              <div className="plate-face">
                <span className="plate-small">Calle</span>
                <span className="plate-big">Murillo</span>
                <span className="plate-num">14</span>
              </div>
            </div>
            <div className="where-text">
              <h3>Dónde estamos</h3>
              <p className="where-addr">{business.address}<br />{business.postal}</p>
              <p>{business.landmark}.</p>
              <div className="where-actions">
                <a className="btn btn-red" href={business.mapsHref} target="_blank" rel="noopener noreferrer">Cómo llegar</a>
                <a className="btn btn-line" href={business.phoneHref}>{business.phone}</a>
              </div>
            </div>
          </div>
        </section>

        {/* Reserva simulada. */}
        <section id="reservar" className="reserve">
          <div className="reserve-head">
            <p className="kicker">Reservar mesa</p>
            <h2>Apunta tu mesa sin esperar a que cojan el teléfono</h2>
            <p>
              Cuatro pasos y queda apuntada. A la hora del servicio, la cocina no tiene que parar para atender
              llamadas.
            </p>
          </div>
          <Booking />
        </section>
      </main>

      <footer className="foot">
        <div className="foot-sign">
          <span className="sign-small">Taberna</span>
          <span className="sign-big">Rincón de Eu</span>
        </div>
        <p>{business.address} · {business.postal}<br />Mediodías de lunes a sábado · Solo efectivo</p>
        <p className="foot-demo">Web de demostración: no es la web oficial del establecimiento y las reservas son simuladas.</p>
      </footer>

      <MobileCta />
    </>
  );
}

function RouteIcon({ kind }: { kind: string }) {
  const common = { width: 56, height: 56, viewBox: "0 0 56 56", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (kind === "barra")
    return (
      <svg {...common} className="route-ico">
        <path d="M10 14h36v28H34V24H22v18H10Z" />
        <path d="M24 10v4M32 10v4" />
        <path d="M27 31h2" />
      </svg>
    );
  if (kind === "saloncitos")
    return (
      <svg {...common} className="route-ico">
        <path d="M8 16h40M8 22h40" />
        <path d="M14 30h28v4H14Z" />
        <path d="M17 34v10M39 34v10" />
        <path d="M10 44v-9a3 3 0 0 1 3-3M46 44v-9a3 3 0 0 0-3-3" />
      </svg>
    );
  return (
    <svg {...common} className="route-ico">
      <path d="M28 46V30" />
      <path d="M28 30c-8 0-12-5-12-12 7 0 12 4 12 12Z" />
      <path d="M28 34c6 0 10-4 10-10-6 0-10 4-10 10Z" />
      <path d="M18 46h20l-2-6H20Z" />
    </svg>
  );
}
