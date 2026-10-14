import Dock from "@/components/Dock";
import HoursTable from "@/components/HoursTable";
import OpenNow from "@/components/OpenNow";
import Panel from "@/components/Panel";
import ServiceMenu from "@/components/ServiceMenu";
import { areas, business, reputation } from "@/content/site";

const tileDetail: Record<string, string> = {
  cabello: "Corte · color · mechas · alisado · recogidos",
  barberia: "Corte caballero · cejas · depilación · barba con láser",
  estetica: "Cejas a hilo · pestañas · uñas · facial · cera",
  laser: "Láser médico · tatuajes · micropigmentación",
};

function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wordmark__first">Marta</span>
      <span className="wordmark__last">Benítez</span>
    </span>
  );
}

const heroWords = [
  ["Corte.", "narrow"],
  ["Barba.", "wide"],
  ["Piel.", "narrow"],
  ["Láser.", "wide"],
] as const;

function HeroWords({ hidden = false }: { hidden?: boolean }) {
  return (
    <span className={`hero__copy hero__copy--${hidden ? "dark" : "light"}`} aria-hidden={hidden || undefined}>
      {heroWords.map(([w, width]) => (
        <span key={w} className={`line line--${width}`}>
          <span>{w}</span>
        </span>
      ))}
    </span>
  );
}

function Star() {
  return (
    <svg className="star" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7z" fill="currentColor" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip" href="#servicios">
        Saltar a servicios
      </a>

      <header className="top">
        <a className="top__brand" href="#inicio" aria-label={`${business.name}, inicio`}>
          <Wordmark />
          <span className="top__descriptor">{business.descriptor}</span>
        </a>
        <nav className="top__nav" aria-label="Principal">
          {areas.map((a) => (
            <a key={a.id} href={`#${a.id}`}>
              {a.label}
            </a>
          ))}
          <a href="#visita">Visítanos</a>
        </nav>
        <a className="btn btn--accent btn--sm top__cta" href={business.booking} target="_blank" rel="noopener noreferrer">
          Reservar
        </a>
      </header>

      <main>
        {/* PORTADA — dos superficies y un corte vertical que atraviesa el titular */}
        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <div className="hero__inner">
            <div className="hero__split">
              <div className="hero__cut" aria-hidden="true" />
              <p className="hero__kicker">
                <span>Dos Hermanas</span>
                <span aria-hidden="true">/</span>
                <span>Desde {business.since}</span>
              </p>

              {/* El titular se pinta dos veces: claro sobre tinta y oscuro sobre cal,
                  recortados por el mismo corte. Solo la primera copia se lee. */}
              <h1 id="hero-title" className="hero__title">
                <HeroWords />
                <HeroWords hidden />
              </h1>
            </div>

            <div className="hero__foot">
              <p className="hero__lead">
                Peluquería, barbería especializada, estética y láser médico bajo el mismo techo. Un salón para quien viene a
                cortarse el pelo, a perfilarse la barba, a hacerse las cejas o a quitarse un tatuaje.
              </p>
              <div className="hero__actions">
                <a className="btn btn--accent" href={business.booking} target="_blank" rel="noopener noreferrer">
                  Reservar cita
                </a>
                <a className="btn btn--ghost" href={business.whatsapp.href} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
                <a className="btn btn--ghost" href={business.phone.href}>
                  Llamar
                </a>
              </div>
              <div className="hero__meta">
                <OpenNow />
                <a className="rating-chip" href="#opiniones">
                  <Star />
                  <strong>{reputation.rating}</strong>
                  <span>
                    {reputation.count} reseñas en {reputation.source}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ACCESOS — cada persona encuentra su puerta en un toque */}
        <section className="doors" aria-labelledby="doors-title">
          <div className="wrap doors__head">
            <h2 id="doors-title" className="section-title">
              ¿A qué <em>vienes</em>?
            </h2>
            <p className="doors__sub">Cuatro áreas, una sola cita. Elige la tuya y ve directo a sus servicios y precios.</p>
          </div>
          <ul className="doors__grid">
            {areas.map((a, i) => (
              <li key={a.id} className="door" data-tone={i === 0 || i === 3 ? "ink" : "cal"}>
                <a href={`#${a.id}`} className="door__link">
                  <span className="door__index">{a.index}</span>
                  <span className="door__label">{a.label}</span>
                  <span className="door__detail">{tileDetail[a.id]}</span>
                  <span className="door__arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* CARTA */}
        <section id="servicios" className="services" aria-labelledby="services-title">
          <div className="wrap">
            <div className="services__head">
              <h2 id="services-title" className="section-title">
                La <em>carta</em>
              </h2>
              <p className="services__note">Precios de la carta del salón. La duración es aproximada y depende de cada pelo y cada piel.</p>
            </div>
            <ServiceMenu />
          </div>
        </section>

        {/* TÉCNICA */}
        <section className="craft" aria-labelledby="craft-title">
          <div className="wrap craft__grid">
            <div className="craft__media">
              <Panel id="laser" glyph="Láser" caption="Cabina de láser · Alarcón 7" />
            </div>
            <div className="craft__text">
              <p className="eyebrow">Lo que no encuentras en cualquier salón</p>
              <h2 id="craft-title" className="section-title section-title--light">
                Base <em>técnica</em>, trato de barrio.
              </h2>
              <p>
                Marta Benítez abrió el salón en diciembre de {business.since}, en la esquina de Alarcón con Zurbarán. Se formó en
                estética y maquillaje profesional y como técnico de láser IPL y de diodo.
              </p>
              <p>
                Esa formación explica la parte menos habitual de la casa: depilación láser médica por zonas, eliminación de
                tatuajes y micropigmentación, junto a la peluquería, la barbería y la estética de siempre.
              </p>
              <ul className="craft__list">
                <li>
                  <span>01</span>Depilación láser médica
                </li>
                <li>
                  <span>02</span>Eliminación de tatuajes
                </li>
                <li>
                  <span>03</span>Micropigmentación
                </li>
              </ul>
              <a className="btn btn--accent" href={business.whatsapp.href} target="_blank" rel="noopener noreferrer">
                Pedir valoración por WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* OPINIONES */}
        <section id="opiniones" className="voices" aria-labelledby="voices-title">
          <div className="wrap voices__grid">
            <div className="voices__score">
              <h2 id="voices-title" className="sr-only">
                Opiniones
              </h2>
              <p className="voices__number">
                {reputation.rating}
                <Star />
              </p>
              <p className="voices__caption">
                Media de {reputation.count} reseñas de clientes en {reputation.source}.
              </p>
              <a className="link-arrow" href={business.booking} target="_blank" rel="noopener noreferrer">
                Leer todas en Booksy
              </a>
            </div>
            <ul className="voices__list">
              {reputation.reviews.map((r) => (
                <li key={r.author} className="voice">
                  <blockquote>
                    <p>“{r.quote}”</p>
                  </blockquote>
                  <p className="voice__who">
                    <strong>{r.author}</strong> · {r.service}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* VISITA */}
        <section id="visita" className="visit" aria-labelledby="visit-title">
          <div className="wrap visit__grid">
            <div className="visit__where">
              <p className="eyebrow">Visítanos</p>
              <h2 id="visit-title" className="visit__street">
                Alarcón<span>7</span>
              </h2>
              <address>
                {business.street}
                <br />
                {business.corner}
                <br />
                {business.city}
              </address>
              <ul className="visit__amenities">
                {business.amenities.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <a className="btn btn--line" href={business.maps} target="_blank" rel="noopener noreferrer">
                Cómo llegar
              </a>
            </div>

            <div className="visit__hours">
              <h3 className="visit__label">Horario</h3>
              <HoursTable />
              <OpenNow className="open-now--block" />
            </div>

            <div className="visit__contact">
              <h3 className="visit__label">Cita</h3>
              <a className="contact-row" href={business.booking} target="_blank" rel="noopener noreferrer">
                <span>Reserva online</span>
                <strong>Booksy</strong>
              </a>
              <a className="contact-row" href={business.whatsapp.href} target="_blank" rel="noopener noreferrer">
                <span>WhatsApp</span>
                <strong>{business.whatsapp.display}</strong>
              </a>
              <a className="contact-row" href={business.phone.href}>
                <span>Teléfono</span>
                <strong>{business.phone.display}</strong>
              </a>
              <a className="contact-row" href={business.instagram.href} target="_blank" rel="noopener noreferrer">
                <span>Instagram</span>
                <strong>{business.instagram.handle}</strong>
              </a>
            </div>
          </div>

          <footer className="foot">
            <div className="wrap foot__inner">
              <Wordmark />
              <p>
                {business.legalLine} · {business.city}
              </p>
              <p>
                <a href={business.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
                {" · "}
                <a href={`mailto:${business.email}`}>{business.email}</a>
              </p>
            </div>
          </footer>
        </section>
      </main>

      <Dock />
    </>
  );
}
