import { AskButton } from "@/components/AskButton";
import { Consulta } from "@/components/Consulta";
import { Mark } from "@/components/Mark";
import { OpenStatus } from "@/components/OpenStatus";
import { animals, categories, dayNames, hours, perks, praise, site } from "@/content/site";

const weekOrder = [1, 2, 3, 4, 5, 6, 0];
const waHref = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent("Hola, Animalex. Quería haceros una consulta.")}`;

function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">
        Saltar al contenido
      </a>

      <header className="top">
        <div className="wrap top__in">
          <a href="#main" className="top__brand" aria-label="Animalex, inicio">
            <Mark />
          </a>
          <nav className="top__nav" aria-label="Secciones">
            <a href="#animal">Tu animal</a>
            <a href="#pasillos">Productos</a>
            <a href="#consulta">Consultar</a>
            <a href="#visita">Visítanos</a>
          </nav>
          <a className="btn btn--ink top__call" href={site.phoneHref}>
            <span className="top__call-long">Llamar · {site.phone}</span>
            <span className="top__call-short">Llamar</span>
          </a>
        </div>
      </header>

      <main id="main">
        {/* Inicio */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="wrap hero__in">
            <div className="hero__copy">
              <p className="kicker reveal" style={{ "--i": 0 } as React.CSSProperties}>
                Tienda de animales · {site.address.area}, Sevilla
              </p>
              <OpenStatus className="hero__status reveal" />
              <h1 id="hero-title" className="hero__title reveal" style={{ "--i": 1 } as React.CSSProperties}>
                Lo que necesita tu mascota.
                <br />
                <span className="hero__hl">Y alguien que sabe aconsejarte.</span>
              </h1>
              <p className="hero__lead reveal" style={{ "--i": 2 } as React.CSSProperties}>
                Alimentación de varias marcas, higiene, juguetes, correas, transportines y accesorios para perros
                y gatos. Pregunta antes de venir: te decimos si lo tenemos.
              </p>
              <div className="hero__cta reveal" style={{ "--i": 3 } as React.CSSProperties}>
                <a className="btn btn--signal btn--lg" href="#consulta">
                  Consultar un producto <Arrow />
                </a>
                <a className="btn btn--line btn--lg" href={site.maps.directions} target="_blank" rel="noopener noreferrer">
                  Cómo llegar
                </a>
              </div>
              <ul className="hero__facts reveal" style={{ "--i": 4 } as React.CSSProperties}>
                <li>
                  <strong>{site.address.street}</strong> {site.address.postal}
                </li>
                <li>
                  <strong>Lunes a sábado</strong> mañana · tarde de lunes a viernes
                </li>
                <li>
                  <strong>Reparto a domicilio</strong> pregunta condiciones
                </li>
              </ul>
            </div>

            <nav className="board reveal" style={{ "--i": 2 } as React.CSSProperties} aria-labelledby="board-title">
              <p className="board__head">
                <span id="board-title">En tienda</span>
                <span className="board__sub">Pasillos</span>
              </p>
              <ol className="board__list">
                {categories.map((c) => (
                  <li key={c.id}>
                    <a href={`#p-${c.id}`} className={`board__row tone-${c.tone}`}>
                      <span className="board__n">{c.n}</span>
                      <span className="board__name">{c.name}</span>
                      <Arrow />
                    </a>
                  </li>
                ))}
              </ol>
              <p className="board__foot">
                <span className="tag">Asesoramiento</span> ¿No lo ves? Pregunta.
              </p>
            </nav>
          </div>
        </section>

        {/* Qué animal tienes */}
        <section id="animal" className="section" aria-labelledby="animal-title">
          <div className="wrap">
            <div className="section__head">
              <p className="kicker">Empieza por aquí</p>
              <h2 id="animal-title" className="h2">
                ¿Qué animal tienes?
              </h2>
            </div>
            <ul className="animals">
              {animals.map((a, i) => (
                <li key={a.id} className={`animal animal--${a.id}`}>
                  <p className="animal__n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="animal__name">{a.label}</h3>
                  {a.note ? (
                    <p className="animal__note">{a.note}</p>
                  ) : (
                    <ul className="animal__lines">
                      {a.lines.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  )}
                  <AskButton animal={a.id} className="animal__cta">
                    Preguntar para {a.forLabel} <Arrow />
                  </AskButton>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pasillos */}
        <section id="pasillos" className="section section--paper2" aria-labelledby="pasillos-title">
          <div className="wrap">
            <div className="section__head section__head--split">
              <div>
                <p className="kicker">Qué encontrarás</p>
                <h2 id="pasillos-title" className="h2">
                  Seis pasillos, todo a mano.
                </h2>
              </div>
              <p className="section__aside">
                No vendemos online: pregunta por un producto o una marca y te decimos si lo tenemos.
              </p>
            </div>
            <ul className="aisles">
              {categories.map((c) => (
                <li key={c.id} id={`p-${c.id}`} className={`aisle tone-${c.tone}`}>
                  <div className="aisle__band">
                    <span className="aisle__n">{c.n}</span>
                    <span className="aisle__lbl">Pasillo</span>
                  </div>
                  <div className="aisle__body">
                    <h3 className="aisle__name">{c.name}</h3>
                    <p className="aisle__text">{c.text}</p>
                    <AskButton category={c.id} className="aisle__cta">
                      Consultar <Arrow />
                    </AskButton>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Asesoramiento */}
        <section className="advice" aria-labelledby="advice-title">
          <div className="wrap advice__in">
            <div className="advice__copy">
              <p className="kicker kicker--signal">Tienda de barrio</p>
              <h2 id="advice-title" className="h2 h2--light">
                Aquí no solo te despachan.
                <br />
                Te asesoran.
              </h2>
              <p className="advice__lead">
                Animalex es una tienda pequeña de El Cerro donde te atiende su dueño. Cuéntale qué animal tienes, su
                edad o qué te preocupa y te ayuda a acertar con la comida, el cuidado o el accesorio.
              </p>
            </div>
            <ul className="perks">
              {perks.map((p, i) => (
                <li key={p.title} className="perk">
                  <span className="perk__n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="perk__title">{p.title}</h3>
                  <p className="perk__text">{p.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Consulta */}
        <section id="consulta" className="section" aria-labelledby="consulta-title">
          <div className="wrap">
            <div className="section__head section__head--split">
              <div>
                <p className="kicker">Antes de venir</p>
                <h2 id="consulta-title" className="h2" tabIndex={-1}>
                  Pregunta si lo tenemos.
                </h2>
              </div>
              <p className="section__aside">
                Elige para quién y qué buscas. Te preparamos el mensaje; tú decides si lo envías por WhatsApp o
                prefieres llamar.
              </p>
            </div>
            <Consulta />
          </div>
        </section>

        {/* Reputación */}
        <section className="section section--paper2" aria-labelledby="rep-title">
          <div className="wrap">
            <div className="section__head section__head--split">
              <div>
                <p className="kicker">Opiniones en Google</p>
                <h2 id="rep-title" className="h2">
                  El barrio lo recomienda.
                </h2>
              </div>
              <p className="section__aside">Lo que más se repite en las valoraciones de sus clientes.</p>
            </div>
            <ul className="praise">
              {praise.map((p) => (
                <li key={p.word} className="praise__item">
                  <p className="praise__word">{p.word}</p>
                  <p className="praise__text">{p.text}</p>
                </li>
              ))}
            </ul>
            <a className="textlink" href={site.maps.place} target="_blank" rel="noopener noreferrer">
              Leer las opiniones en Google Maps <Arrow />
            </a>
          </div>
        </section>

        {/* Visita */}
        <section id="visita" className="section" aria-labelledby="visita-title">
          <div className="wrap visit">
            <div className="visit__place">
              <p className="kicker">Visítanos</p>
              <h2 id="visita-title" className="h2">
                En El Cerro, calle Lisboa.
              </h2>
              <div className="plate">
                <span className="plate__street">{site.address.street}</span>
                <span className="plate__city">{site.address.postal}</span>
              </div>
              <div className="visit__cta">
                <a className="btn btn--signal btn--lg" href={site.maps.directions} target="_blank" rel="noopener noreferrer">
                  Cómo llegar <Arrow />
                </a>
                <a className="btn btn--line btn--lg" href={site.phoneHref}>
                  Llamar · {site.phone}
                </a>
              </div>
            </div>

            <div className="hours">
              <div className="hours__head">
                <h3 className="hours__title">Horario</h3>
                <OpenStatus />
              </div>
              <dl className="hours__list">
                {weekOrder.map((d) => (
                  <div key={d} className="hours__row" data-day={d}>
                    <dt>{dayNames[d]}</dt>
                    <dd>
                      {hours[d].length
                        ? hours[d].map(([a, b]) => `${a}–${b}`).join(" · ")
                        : "Cerrado"}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="hours__note">En festivos, mejor llama antes de venir.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot__in">
          <Mark className="mark--light" />
          <p>
            {site.address.street}, {site.address.postal} ·{" "}
            <a href={site.phoneHref}>{site.phone}</a>
          </p>
          <p className="foot__demo">
            Web de demostración. No es la web oficial de Animalex ni vende online: las consultas se hacen por
            teléfono{site.whatsappEnabled ? " o WhatsApp" : ""}.
          </p>
        </div>
      </footer>

      {/* Barra de acciones fija en móvil */}
      <nav className="dock" aria-label="Acciones rápidas">
        <a href={site.phoneHref} className="dock__btn">
          Llamar
        </a>
        {site.whatsappEnabled && (
          <a href={waHref} className="dock__btn dock__btn--wa" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        )}
        <a href={site.maps.directions} className="dock__btn" target="_blank" rel="noopener noreferrer">
          Cómo llegar
        </a>
      </nav>
    </>
  );
}
