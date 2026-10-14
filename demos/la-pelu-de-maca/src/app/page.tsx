import { CallBar } from "@/components/CallBar";
import { Doodle, Scribble, type DoodleName } from "@/components/Doodle";
import { HoursList } from "@/components/HoursList";
import { Icon } from "@/components/Icon";
import { OpenNow } from "@/components/OpenNow";
import { reviews, salon, services, team } from "@/content/salon";

const serviceDoodle: Record<(typeof services)[number]["key"], DoodleName> = {
  corte: "scissors",
  color: "brush",
  peinado: "dryer",
  cuidado: "drop",
};

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">
        Saltar al contenido
      </a>

      <header className="topbar">
        <div className="wrap topbar__inner">
          <a className="wordmark" href="#main" aria-label="La Pelu de Maca, inicio">
            <span className="wordmark__la">la pelu de</span>
            <span className="wordmark__maca">Maca</span>
          </a>
          <nav className="topbar__nav" aria-label="Secciones">
            <a href="#equipo">Las chicas</a>
            <a href="#servicios">Servicios</a>
            <a href="#opiniones">Opiniones</a>
            <a href="#visita">Horario</a>
          </nav>
          <a className="btn btn--primary btn--sm" href={salon.phoneHref}>
            <Icon name="phone" />
            <span className="topbar__call-long">{salon.phoneDisplay}</span>
            <span className="topbar__call-short">Llamar</span>
          </a>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        {/* HERO */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="wrap hero__grid">
            <div className="hero__copy">
              <p className="hand hero__where">
                <Icon name="pin" className="icon icon--sm" />
                Reyes Católicos, 1 · Dos Hermanas
              </p>
              <h1 id="hero-title" className="hero__title">
                Vienes una vez y{" "}
                <span className="nowrap">
                  <span className="hero__mark">
                    repites seguro
                    <Scribble />
                  </span>
                  .
                </span>
              </h1>
              <p className="hero__lead">
                Maca, Carmen y Mari Carmen te cortan, te dan color y te peinan con muchísimo estilo. Y de
                paso, te ríes un rato.
              </p>
              <div className="hero__actions" id="hero-actions">
                <a className="btn btn--primary btn--lg" href={salon.phoneHref}>
                  <Icon name="phone" />
                  Llamar para pedir cita
                </a>
                <a className="btn btn--ghost btn--lg" href="#visita">
                  <Icon name="clock" />
                  Ver horario
                </a>
              </div>
              <p className="hero__rating">
                <span className="stars" aria-hidden="true">
                  <Icon name="star" />
                  <Icon name="star" />
                  <Icon name="star" />
                  <Icon name="star" />
                  <Icon name="star" />
                </span>
                <span>
                  <strong>{salon.rating.value}</strong> en {salon.rating.source} · {salon.rating.count} opiniones
                </span>
              </p>
            </div>

            <div className="hero__art">
              <Doodle name="scissors" className="hero__doodle hero__doodle--scissors" />
              <Doodle name="sparkle" className="hero__doodle hero__doodle--sparkle" />
              <Doodle name="comb" className="hero__doodle hero__doodle--comb" />

              <article className="appt" aria-label="Tarjeta de cita">
                <header className="appt__head">
                  <span className="appt__kind">Tarjeta de cita</span>
                  <span className="appt__brand">La Pelu de Maca</span>
                </header>
                <dl className="appt__lines">
                  <div>
                    <dt>Para</dt>
                    <dd className="hand">tú</dd>
                  </div>
                  <div>
                    <dt>Día</dt>
                    <dd className="hand">el que mejor te venga</dd>
                  </div>
                  <div>
                    <dt>Con</dt>
                    <dd className="hand">Maca, Carmen o Mari Carmen</dd>
                  </div>
                </dl>
                <a className="appt__phone" href={salon.phoneHref}>
                  <span className="appt__phone-label">Llámanos</span>
                  <span className="appt__phone-number">{salon.phoneDisplay}</span>
                </a>
                <OpenNow className="appt__status" />
              </article>

              <p className="stamp" aria-hidden="true">
                <span>risas</span>
                <span>aseguradas</span>
              </p>
            </div>
          </div>
        </section>

        {/* LO QUE MÁS SE REPITE */}
        <section className="words" aria-label="Lo que más se repite en las reseñas">
          <div className="wrap words__inner" data-reveal>
            <p className="words__intro">Lo que más se repite en las reseñas:</p>
            <ul className="words__list">
              <li className="sticker sticker--butter">acogedoras</li>
              <li className="sticker sticker--blush">con muchísimo estilo</li>
              <li className="sticker sticker--sage">calidad precio inmejorable</li>
              <li className="sticker sticker--tomato">risas aseguradas</li>
            </ul>
          </div>
        </section>

        {/* EQUIPO */}
        <section className="team section" id="equipo" aria-labelledby="team-title">
          <div className="wrap">
            <div className="section__head" data-reveal>
              <p className="kicker">Las chicas</p>
              <h2 id="team-title" className="section__title">
                Maca y sus compis
              </h2>
              <p className="section__lead">
                Buen ambiente, trato cercano y tres profesionales que se toman tu pelo muy en serio. Al frente,
                Maca; a su lado, Carmen y Mari Carmen.
              </p>
            </div>
            <ul className="team__list">
              {team.map((p, i) => (
                <li key={p.name} className={`tag tag--${p.tone}`} data-reveal style={{ "--i": i } as React.CSSProperties}>
                  <span className="tag__hello">Hola, soy</span>
                  <span className="tag__name">{p.name}</span>
                  <span className="tag__role">{p.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SERVICIOS */}
        <section className="services section" id="servicios" aria-labelledby="services-title">
          <div className="wrap">
            <div className="section__head" data-reveal>
              <p className="kicker">Servicios</p>
              <h2 id="services-title" className="section__title">
                ¿Qué te hacemos hoy?
              </h2>
            </div>
            <ul className="services__list">
              {services.map((s, i) => (
                <li key={s.key} className="service" data-reveal style={{ "--i": i } as React.CSSProperties}>
                  <Doodle name={serviceDoodle[s.key]} className="service__doodle" />
                  <h3 className="service__title">{s.title}</h3>
                  <p className="service__text">{s.text}</p>
                </li>
              ))}
            </ul>
            <p className="services__note" data-reveal>
              <span className="hand">¿Y cuánto es?</span> Depende del largo y de lo que te hagamos. Pregúntanos
              al llamar y te lo decimos.
            </p>
          </div>
        </section>

        {/* OPINIONES */}
        <section className="reviews section" id="opiniones" aria-labelledby="reviews-title">
          <div className="wrap reviews__grid">
            <div className="reviews__score" data-reveal>
              <p className="kicker">Opiniones</p>
              <h2 id="reviews-title" className="section__title">
                Lo que se dice de la pelu
              </h2>
              <p className="score">
                <span className="score__value">{salon.rating.value}</span>
                <span className="score__meta">
                  <span className="stars" aria-hidden="true">
                    <Icon name="star" />
                    <Icon name="star" />
                    <Icon name="star" />
                    <Icon name="star" />
                    <Icon name="star" />
                  </span>
                  <span>
                    de 5 · {salon.rating.count} opiniones en {salon.rating.source}
                  </span>
                </span>
              </p>
            </div>
            <ul className="notes">
              {reviews.map((r, i) => (
                <li key={i} className={`note note--${r.tone}`} data-reveal style={{ "--i": i } as React.CSSProperties}>
                  <figure>
                    <blockquote>
                      <p>«{r.text}»</p>
                    </blockquote>
                    <figcaption>Reseña en Google</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* INSTAGRAM */}
        <section className="insta section" aria-labelledby="insta-title">
          <div className="wrap">
            <a className="insta__card" href={salon.instagramUrl} target="_blank" rel="noopener noreferrer" data-reveal>
              <Doodle name="heart" className="insta__heart" />
              <span className="insta__copy">
                <span id="insta-title" className="insta__title">
                  Los cambios, en Instagram
                </span>
                <span className="insta__text">Síguenos para ver los últimos cortes, colores y peinados.</span>
              </span>
              <span className="insta__handle">
                <Icon name="instagram" />
                {salon.instagramHandle}
                <Icon name="arrow" className="icon icon--sm" />
              </span>
            </a>
          </div>
        </section>

        {/* VISITA */}
        <section className="visit section" id="visita" aria-labelledby="visit-title">
          <div className="wrap visit__grid">
            <div className="visit__copy" data-reveal>
              <p className="kicker">Pásate</p>
              <h2 id="visit-title" className="section__title">
                Te esperamos en Reyes Católicos
              </h2>
              <address className="visit__address">
                {salon.street}
                <br />
                {salon.city}
              </address>
              <div className="visit__actions">
                <a className="btn btn--primary btn--lg" href={salon.phoneHref}>
                  <Icon name="phone" />
                  Llamar · {salon.phoneDisplay}
                </a>
                <a className="btn btn--ghost btn--lg" href={salon.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="pin" />
                  Cómo llegar
                </a>
              </div>
              <p className="visit__hint">Las citas se piden por teléfono.</p>
            </div>
            <div className="visit__hours" data-reveal>
              <h3 className="visit__hours-title">Horario</h3>
              <OpenNow />
              <HoursList />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__inner">
          <p className="wordmark wordmark--footer" aria-hidden="true">
            <span className="wordmark__la">la pelu de</span>
            <span className="wordmark__maca">Maca</span>
          </p>
          <p className="footer__data">
            {salon.street} · {salon.city}
            <br />
            <a href={salon.phoneHref}>{salon.phoneDisplay}</a> ·{" "}
            <a href={salon.instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </p>
          <p className="footer__fine">
            Web de demostración: no es la web oficial del salón ni gestiona citas.
          </p>
        </div>
      </footer>

      <CallBar />
    </>
  );
}
