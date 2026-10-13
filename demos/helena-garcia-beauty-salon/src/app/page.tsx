import Link from "next/link";
import { Booking } from "@/components/Booking";
import { CategoryLink } from "@/components/CategoryLink";
import { Dock } from "@/components/Dock";
import { Photo } from "@/components/Photo";
import { ServiceMenu } from "@/components/ServiceMenu";
import { Wordmark } from "@/components/Wordmark";
import { featured, marquee, reviews, salon } from "@/content/salon";

const SWATCHES = ["cherry", "blush", "lilac", "butter", "ink"] as const;

const STEPS = [
  {
    title: "Reservas en un minuto",
    text: "Eliges tratamiento y hueco desde el móvil, a cualquier hora. Sin llamadas ni esperas.",
  },
  {
    title: "Miramos tu uña",
    text: "Antes de esmaltar, revisamos cómo está. Si viene castigada, empezamos por cuidarla.",
  },
  {
    title: "Trabajo de precisión",
    text: "Técnica rusa, cutícula limpia y producto bien asentado para que el color aguante.",
  },
  {
    title: "Te vas con fecha",
    text: "Mantenimiento cada 15 días: tus manos siempre a punto sin pensar en ello.",
  },
];

function Stars() {
  return (
    <span className="stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20">
          <path d="M10 1.5l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L10 14.8l-5.4 2.9 1.2-5.9L1.4 7.7l6-.7z" />
        </svg>
      ))}
    </span>
  );
}

export default function Home() {
  return (
    <>
      <aside className="demo-bar" aria-label="Aviso de demo">
        <p>
          <span className="demo-bar__dot" aria-hidden="true" />
          Propuesta de web para Helena García · demo privada, no oficial ·{" "}
          <Link href="/propuesta">Ver propuesta</Link>
        </p>
      </aside>

      <header className="header">
        <a href="#inicio" className="header__brand" aria-label="Helena García Beauty Salon, inicio">
          <Wordmark />
        </a>
        <nav className="header__nav" aria-label="Secciones">
          <a href="#destacados">Tratamientos</a>
          <a href="#carta">Precios</a>
          <a href="#resenas">Reseñas</a>
          <a href="#ubicacion">Dónde estamos</a>
        </nav>
        <a href="#reserva" className="btn btn--primary btn--sm">
          Reservar
        </a>
      </header>

      <main>
        {/* HERO */}
        <section id="inicio" className="hero">
          <div className="hero__copy">
            <p className="sticker sticker--lilac hero__in" style={{ "--i": 0 } as React.CSSProperties}>
              Bormujos · Aljarafe
            </p>
            <h1 className="hero__title hero__in" style={{ "--i": 1 } as React.CSSProperties}>
              Uñas <span className="hl">sanas</span>.
              <br />
              Look que se nota.
            </h1>
            <p className="hero__lead hero__in" style={{ "--i": 2 } as React.CSSProperties}>
              Manicura rusa, semipermanente, pedicura, láser y lifting en el Edificio Cerro Colarte.
              Para Helena, la belleza empieza por cuidar la uña.
            </p>
            <div className="hero__ctas hero__in" style={{ "--i": 3 } as React.CSSProperties}>
              <a href="#reserva" className="btn btn--primary">
                Reservar cita
              </a>
              <a href="#carta" className="btn btn--ghost">
                Ver precios
              </a>
            </div>
            <a
              href="#resenas"
              className="rating-chip hero__in"
              style={{ "--i": 4 } as React.CSSProperties}
            >
              <Stars />
              <span>
                <strong>{salon.rating.score}</strong> · {salon.rating.reviews} reseñas en {salon.rating.source}
              </span>
            </a>
          </div>

          <div className="hero__art" aria-hidden="true">
            <div className="fan">
              {SWATCHES.map((t, i) => (
                <span key={t} className={`fan__nail tone-${t}`} style={{ "--n": i - 2 } as React.CSSProperties} />
              ))}
            </div>
            <span className="sticker sticker--float sticker--a">Manicura rusa</span>
            <span className="sticker sticker--float sticker--b">★ 5,0</span>
            <span className="sticker sticker--float sticker--c">Láser · prueba gratis</span>
          </div>
        </section>

        {/* TICKER */}
        <div className="ticker" aria-hidden="true">
          <div className="ticker__track">
            {[0, 1].map((k) => (
              <span key={k} className="ticker__group">
                {marquee.map((m) => (
                  <span key={m} className="ticker__item">
                    {m}
                    <span className="ticker__sep">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* DESTACADOS */}
        <section id="destacados" className="section">
          <div className="section__head" data-reveal>
            <p className="eyebrow">Lo más pedido</p>
            <h2 className="h2">Lo que te vas a querer repetir</h2>
          </div>
          <ul className="cards" data-reveal>
            {featured.map((f) => (
              <li key={f.title} className={`card tone-${f.tone}`}>
                <p className="card__kicker">{f.kicker}</p>
                <h3 className="card__title">{f.title}</h3>
                <p className="card__text">{f.text}</p>
                <div className="card__foot">
                  <span className="card__price">{f.from}</span>
                  <CategoryLink category={f.category} className="card__link">
                    Ver carta <span aria-hidden="true">→</span>
                  </CategoryLink>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* POR QUÉ */}
        <section id="salon" className="section why">
          <div className="why__grid">
            <div className="why__photo" data-reveal>
              <Photo slot="helena" sizes="(min-width: 960px) 40vw, 100vw" />
            </div>
            <div className="why__copy" data-reveal>
              <p className="eyebrow">El salón</p>
              <h2 className="h2">
                Belleza que empieza por <span className="hl">la salud</span>.
              </h2>
              <p className="lead">
                Unas uñas bonitas aguantan mejor cuando están sanas. Por eso en el salón de Helena
                no se trata solo de poner color: se trata de que tu uña llegue al siguiente
                mantenimiento mejor de lo que estaba.
              </p>
              <ul className="pillars">
                <li className="pillar tone-cherry">
                  <strong>Salud primero</strong>
                  <span>Si tu uña necesita descanso o cuidado, te lo decimos.</span>
                </li>
                <li className="pillar tone-lilac">
                  <strong>Técnica actual</strong>
                  <span>Manicura rusa, refuerzo y láser, en un mismo sitio.</span>
                </li>
                <li className="pillar tone-butter">
                  <strong>Cita sin vueltas</strong>
                  <span>Reserva online las 24 h, desde el móvil.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CARTA */}
        <section id="carta" className="section">
          <div className="section__head" data-reveal>
            <p className="eyebrow">Carta y precios</p>
            <h2 className="h2">Elige y reserva</h2>
            <p className="muted">
              Precios de referencia publicados por el salón en Booksy. Se confirman al reservar.
            </p>
          </div>
          <div data-reveal>
            <ServiceMenu />
          </div>
        </section>

        {/* PASOS */}
        <section id="cita" className="section steps-wrap">
          <div className="section__head" data-reveal>
            <p className="eyebrow eyebrow--light">Tu cita</p>
            <h2 className="h2">Así es venir a Helena</h2>
          </div>
          <ol className="steps" data-reveal>
            {STEPS.map((s, i) => (
              <li key={s.title} className="step">
                <span className="step__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="step__title">{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* RESEÑAS */}
        <section id="resenas" className="section">
          <div className="reviews">
            <div className="reviews__score" data-reveal>
              <p className="reviews__big">{salon.rating.score}</p>
              <Stars />
              <p>
                <strong>{salon.rating.reviews} reseñas</strong> de clientas en {salon.rating.source}
              </p>
              <a className="link" href={salon.booksyUrl} target="_blank" rel="noopener noreferrer">
                Leer todas las reseñas
              </a>
            </div>
            <ul className="quotes" data-reveal>
              {reviews.map((r, i) => (
                <li key={r.quote} className={`quote quote--${i}`}>
                  <p className="quote__text">“{r.quote}”</p>
                  <p className="quote__meta">Clienta en Booksy · {r.topic}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FEED */}
        <section id="feed" className="section feed-wrap">
          <div className="section__head section__head--row" data-reveal>
            <div>
              <p className="eyebrow">En el salón</p>
              <h2 className="h2">Recién hechas</h2>
            </div>
            <a className="btn btn--ghost btn--sm" href={salon.instagram.url} target="_blank" rel="noopener noreferrer">
              {salon.instagram.handle}
            </a>
          </div>
          <ul className="feed" data-reveal tabIndex={0} aria-label="Galería del salón (desliza para ver más)">
            {(["feed1", "feed2", "feed3", "feed4", "feed5"] as const).map((k) => (
              <li key={k} className="feed__item">
                <Photo slot={k} sizes="(min-width: 960px) 20vw, 62vw" />
              </li>
            ))}
          </ul>
        </section>

        {/* RESERVA */}
        <section id="reserva" className="section booking-wrap">
          <div className="booking-grid">
            <div className="section__head" data-reveal>
              <p className="eyebrow">Reserva</p>
              <h2 className="h2">Tu hueco, en tres toques</h2>
              <p className="lead">
                Elige qué te apetece y cuándo te viene bien. Te llevamos directamente a la agenda
                del salón con todo preparado.
              </p>
              <p className="muted">
                ¿Prefieres hablar? Llama al{" "}
                <a className="link" href={salon.phone.href}>
                  {salon.phone.display}
                </a>
                .
              </p>
            </div>
            <div data-reveal>
              <Booking />
            </div>
          </div>
        </section>

        {/* UBICACIÓN */}
        <section id="ubicacion" className="section">
          <div className="place" data-reveal>
            <div className="place__map" aria-hidden="true">
              <span className="place__road place__road--a" />
              <span className="place__road place__road--b" />
              <span className="place__label">Av. del Aljarafe</span>
              <span className="place__pin">
                <span>HG</span>
              </span>
            </div>
            <div className="place__info">
              <p className="eyebrow">Dónde estamos</p>
              <h2 className="h2">En pleno Bormujos</h2>
              <address className="place__addr">
                {salon.address.line1}
                <br />
                {salon.address.line2}
                <br />
                {salon.address.city}
              </address>
              <dl className="hours">
                {salon.hours.map((h) => (
                  <div key={h.days} className="hours__row">
                    <dt>{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
              <div className="place__ctas">
                <a className="btn btn--primary" href={salon.mapsUrl} target="_blank" rel="noopener noreferrer">
                  Cómo llegar
                </a>
                <a className="btn btn--ghost" href={salon.phone.href}>
                  Llamar
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL */}
        <section id="final" className="final">
          <div className="final__inner" data-reveal>
            <h2 className="final__title">
              ¿Uñas nuevas
              <br />
              esta semana?
            </h2>
            <p>Reserva online en un minuto. Tu manicura te está esperando.</p>
            <div className="final__ctas">
              <a href="#reserva" className="btn btn--light">
                Reservar cita
              </a>
              <a href={salon.instagram.url} className="btn btn--outline-light" target="_blank" rel="noopener noreferrer">
                Síguenos en Instagram
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <Wordmark className="wordmark--light" />
        <p>
          {salon.address.line1} · {salon.address.line2} · {salon.address.city}
        </p>
        <p className="footer__demo">
          Demo de diseño privada, no es la web oficial del salón. Sin cookies ni analítica.{" "}
          <Link href="/propuesta">Sobre esta propuesta</Link>
        </p>
      </footer>

      <Dock />
    </>
  );
}
