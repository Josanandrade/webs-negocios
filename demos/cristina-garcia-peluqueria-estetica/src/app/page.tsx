import Dock from "@/components/Dock";
import HoursTable from "@/components/HoursTable";
import OpenNow from "@/components/OpenNow";
import ServiceCatalog from "@/components/ServiceCatalog";
import { amenities, areas, business, photos, popular, quotes, rating, team } from "@/content/site";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const events = areas.find((a) => a.id === "eventos")!;
const [bride, ...eventRest] = events.groups.flatMap((g) => g.items);
const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

function Stars() {
  return (
    <svg className="stars" viewBox="0 0 100 18" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          transform={`translate(${i * 20.5} 0)`}
          d="M9 0.8l2.5 5.3 5.8.7-4.3 4 1.1 5.7L9 13.7l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"
        />
      ))}
    </svg>
  );
}

export default function Home() {
  const maxStars = Math.max(...rating.stars);
  return (
    <>
      <a className="skip" href="#servicios">
        Saltar a la carta de servicios
      </a>

      <header className="topbar">
        <div className="wrap topbar__inner">
          <a className="brand" href="#inicio">
            <span className="brand__name">{business.name}</span>
            <span className="brand__tag">{business.tagline}</span>
          </a>
          <nav className="topbar__nav" aria-label="Secciones">
            <a href="#servicios">Servicios</a>
            <a href="#novias">Novias</a>
            <a href="#opiniones">Opiniones</a>
            <a href="#equipo">Equipo</a>
            <a href="#visita">Visítanos</a>
          </nav>
          <a className="btn btn--solid btn--sm" href={business.booking} {...ext}>
            Reservar cita
          </a>
        </div>
      </header>

      <main>
        {/* Portada: qué es el centro, cómo reservar y la carta de un vistazo */}
        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <div className="wrap hero__grid">
            <div className="hero__copy">
              <p className="hero__place">Peluquería y estética en {business.town}</p>
              <h1 id="hero-title" className="hero__title">
                Todo tu cuidado, de la melena a la piel, en un mismo centro.
              </h1>
              <p className="hero__lead">
                Corte, color y mechas, novias, cejas, uñas, faciales, corporal y depilación láser. Cinco profesionales
                y {business.experience.toLowerCase()} en la Avenida del Aljarafe.
              </p>
              <div className="hero__cta">
                <a className="btn btn--solid btn--lg" href={business.booking} {...ext}>
                  Reservar cita online
                </a>
                <a className="btn btn--ghost btn--lg" href={business.phone.href}>
                  Llamar al {business.phone.display}
                </a>
              </div>
              <a className="hero__rating" href="#opiniones">
                <Stars />
                <span>
                  <strong>{rating.score}</strong> de 5 en {rating.total} reseñas de {rating.source}
                </span>
              </a>
              <OpenNow className="hero__open" />
            </div>

            <nav className="board" aria-labelledby="board-title">
              <div className="board__head">
                <h2 id="board-title" className="board__title">
                  La carta del centro
                </h2>
                <p className="board__sub">Un servicio de referencia por área</p>
              </div>
              <ul className="board__list">
                {areas.map((a, i) => (
                  <li key={a.id} style={{ "--i": i } as React.CSSProperties}>
                    <a className="board__row" href={`#${a.id}`}>
                      <span className="board__area">{a.label}</span>
                      <span className="board__svc">{a.signature.name}</span>
                      <span className="board__price">{a.signature.price}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="board__foot">
                <span>Lo más reservado</span>
                {popular.map((p) => (
                  <span key={p.name} className="board__chip">
                    {p.name} <b>{p.price}</b>
                  </span>
                ))}
              </p>
            </nav>
          </div>
        </section>

        {/* Reputación */}
        <section id="opiniones" className="reviews" aria-labelledby="reviews-title">
          <div className="wrap reviews__grid">
            <div className="reviews__score">
              <h2 id="reviews-title" className="sr-only">
                Opiniones
              </h2>
              <p className="reviews__big" aria-label={`${rating.score} sobre 5`}>
                {rating.score}
              </p>
              <Stars />
              <p className="reviews__meta">
                Media de {rating.total} reseñas de clientas y clientes en {rating.source}.
              </p>
            </div>
            <div className="reviews__bars" role="img" aria-label={`Reparto: ${rating.stars.map((n, i) => `${n} reseñas de ${5 - i} estrellas`).join(", ")}`}>
              {rating.stars.map((n, i) => (
                <div key={i} className="bar">
                  <span className="bar__label">{5 - i}</span>
                  <span className="bar__track">
                    <span className="bar__fill" style={{ "--w": n / maxStars } as React.CSSProperties} />
                  </span>
                  <span className="bar__count">{n}</span>
                </div>
              ))}
            </div>
            <div className="reviews__quotes">
              {quotes.map((q) => (
                <figure key={q.author} className="quote">
                  <blockquote>«{q.text}»</blockquote>
                  <figcaption>
                    {q.author}, {q.service.toLowerCase()}
                  </figcaption>
                </figure>
              ))}
              <a className="link" href={business.booking} {...ext}>
                Leer todas las reseñas en Booksy
              </a>
            </div>
          </div>
        </section>

        {/* Carta completa */}
        <section id="servicios" className="services" aria-labelledby="services-title">
          <div className="wrap">
            <div className="section-head">
              <h2 id="services-title" className="section-title">
                Toda la carta, ordenada por áreas
              </h2>
              <p className="section-lead">
                Precios y tiempos de la agenda del centro. Elige área, encuentra tu servicio y resérvalo tal cual en
                Booksy.
              </p>
            </div>
            <ServiceCatalog />
          </div>
        </section>

        {/* Novias y eventos */}
        <section id="novias" className="bridal" aria-labelledby="bridal-title">
          <div className="wrap bridal__grid">
            <div className="bridal__copy">
              <h2 id="bridal-title" className="section-title">
                Novias, madrinas e invitadas
              </h2>
              <p className="section-lead">
                Peinado y maquillaje con prueba previa, y un equipo que se organiza para atender a todo el cortejo. Las
                invitadas pueden prepararse en el centro o en casa.
              </p>
              <div className="bridal__cta">
                <a className="btn btn--peach btn--lg" href={business.phone.href}>
                  Llamar para consultar fecha
                </a>
                <a className="btn btn--line-light btn--lg" href={business.booking} {...ext}>
                  Reservar en Booksy
                </a>
              </div>
            </div>
            <div className="bridal__offer">
              <div className="bridal__feature">
                <p className="bridal__feature-name">{bride.name}</p>
                <p className="bridal__feature-price">{bride.price}</p>
                <p className="bridal__feature-time">{bride.time} de dedicación, pruebas incluidas</p>
              </div>
              <ul className="bridal__list">
                {eventRest.map((s) => (
                  <li key={s.name}>
                    <span>{s.name}</span>
                    <span className="bridal__price">{s.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Equipo */}
        <section id="equipo" className="team" aria-labelledby="team-title">
          <div className="wrap team__grid">
            <div className="section-head">
              <h2 id="team-title" className="section-title">
                Cinco profesionales, un mismo centro
              </h2>
              <p className="section-lead">
                Un equipo con {business.experience.toLowerCase()}. Al reservar en Booksy puedes elegir con quién
                quieres tu cita.
              </p>
            </div>
            <ul className="team__list">
              {team.map((m) => (
                <li key={m.name} className="member" data-lead={"role" in m || undefined}>
                  <span className="member__mono" aria-hidden="true">
                    {initials(m.name)}
                  </span>
                  <span className="member__name">{m.name}</span>
                  {"role" in m && <span className="member__role">{m.role}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Visita */}
        <section id="visita" className="visit" aria-labelledby="visit-title">
          <div className="wrap visit__grid">
            <div className="visit__main">
              <h2 id="visit-title" className="section-title">
                Visítanos en la Avenida del Aljarafe
              </h2>
              <address className="visit__address">
                {business.address.street}
                <br />
                {business.address.city}
              </address>
              <div className="visit__cta">
                <a className="btn btn--solid btn--lg" href={business.booking} {...ext}>
                  Reservar cita online
                </a>
                <a className="btn btn--ghost btn--lg" href={business.phone.href}>
                  Llamar al {business.phone.display}
                </a>
                <a className="btn btn--ghost btn--lg" href={business.maps} {...ext}>
                  Cómo llegar
                </a>
              </div>
              <ul className="amenities" aria-label="Comodidades">
                {amenities.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              {photos.salon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="visit__photo" src={photos.salon.src} alt={photos.salon.alt} loading="lazy" decoding="async" />
              )}
            </div>
            <div className="visit__hours">
              <h3 className="visit__sub">Horario</h3>
              <OpenNow />
              <HoursTable />
              <p className="visit__note">Atención con cita previa. Rayos UVA sin cita, por orden de llegada.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__inner">
          <div>
            <p className="footer__brand">{business.fullName}</p>
            <p className="footer__muted">
              {business.address.street}, {business.address.city}
            </p>
          </div>
          <ul className="footer__links">
            <li>
              <a href={business.instagram.href} {...ext}>
                Instagram
              </a>
            </li>
            <li>
              <a href={business.facebook} {...ext}>
                Facebook
              </a>
            </li>
            <li>
              <a href={business.booking} {...ext}>
                Booksy
              </a>
            </li>
          </ul>
          <p className="footer__demo">
            Web de demostración preparada para {business.fullName}. No es la web oficial del centro.
          </p>
        </div>
      </footer>

      <Dock />
    </>
  );
}
