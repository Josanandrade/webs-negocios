import { BookButton, BookingProvider } from "@/components/Booking";
import { MobileDock } from "@/components/MobileDock";
import { Photo } from "@/components/Photo";
import { TreatmentMenu } from "@/components/TreatmentMenu";
import { categories, highlights, site } from "@/content/site";

export default function Home() {
  return (
    <BookingProvider>
      <div className="demo-bar" role="note">
        <p>
          Propuesta de diseño para {site.name}. No es su web oficial.
        </p>
      </div>

      <header className="header">
        <div className="header__inner">
          <a href="#inicio" className="wordmark" aria-label={`${site.name}, inicio`}>
            <span className="wordmark__a">Pura</span>
            <span className="wordmark__b">Bellezza</span>
          </a>
          <nav className="header__nav" aria-label="Secciones">
            <a href="#tratamientos">Tratamientos</a>
            <a href="#como-trabajamos">Cómo trabajamos</a>
            <a href="#visitanos">Visítanos</a>
          </nav>
          <BookButton className="btn btn--solid btn--sm">Pedir cita</BookButton>
        </div>
      </header>

      <main id="inicio">
        {/* Hero */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__text">
            <p className="hero__kicker">
              Estética y bienestar en {site.town}
            </p>
            <h1 id="hero-title" className="hero__title">
              Tu rato para cuidarte, sin prisas
            </h1>
            <p className="hero__lead">
              Rostro, pestañas, uñas y cuerpo en un espacio luminoso de la avenida
              de la Constitución. Tú eliges el tratamiento; aquí ponemos el tiempo
              y el mimo.
            </p>
            <div className="hero__actions" id="hero-actions">
              <BookButton>Pedir cita</BookButton>
              <a className="btn btn--ghost" href={site.phone.href}>
                Llamar
              </a>
            </div>
          </div>

          <div className="hero__visual">
            <div className="mirror mirror--hero">
              <Photo name="hero" sizes="(min-width: 960px) 40vw, 80vw" priority />
              <span className="mirror__sheen" aria-hidden="true" />
            </div>
            <a
              className="rating"
              href={site.booking.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="rating__score">{site.rating.score}</span>
              <span className="rating__stars" aria-hidden="true">
                ★★★★★
              </span>
              <span className="rating__meta">
                en {site.rating.source}
                <br />
                {site.rating.count.toLowerCase()}
              </span>
            </a>
          </div>
        </section>

        {/* Favoritos */}
        <section className="section favs" aria-labelledby="favs-title">
          <div className="section__head">
            <h2 id="favs-title" className="h2">
              Por dónde empezar
            </h2>
            <p className="section__lead">
              Cuatro tratamientos, uno de cada familia, para que encuentres el tuyo de
              un vistazo.
            </p>
          </div>
          <ul className="favs__row">
            {highlights.map((h) => {
              const cat = categories.find((c) => c.id === h.category)!;
              return (
                <li key={h.title} className="fav">
                  <div className="mirror mirror--card">
                    <Photo name={h.photo} sizes="(min-width: 960px) 22vw, 64vw" />
                  </div>
                  <p className="fav__family">{cat.name}</p>
                  <h3 className="fav__title">{h.title}</h3>
                  <p className="fav__line">{h.line}</p>
                  <BookButton category={h.category} className="link-btn">
                    Pedir cita
                  </BookButton>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Carta */}
        <section
          id="tratamientos"
          className="section carta"
          aria-labelledby="carta-title"
        >
          <div className="carta__inner">
            <div className="section__head">
              <h2 id="carta-title" className="h2">
                La carta, ordenada
              </h2>
              <p className="section__lead">
                Todo lo que hacemos, agrupado por lo que quieres cuidar. Precios y
                duraciones, siempre al día en la agenda online.
              </p>
            </div>
            <TreatmentMenu />
          </div>
        </section>

        {/* Cómo trabajamos */}
        <section
          id="como-trabajamos"
          className="section ways"
          aria-labelledby="ways-title"
        >
          <div className="section__head">
            <h2 id="ways-title" className="h2">
              Cómo trabajamos
            </h2>
          </div>
          <div className="ways__grid">
            <article className="way">
              <h3>Primero, escuchar</h3>
              <p>
                En los tratamientos faciales y corporales empezamos con una valoración:
                vemos cómo está tu piel y qué buscas antes de proponerte nada.
              </p>
            </article>
            <article className="way">
              <h3>Un espacio limpio y tranquilo</h3>
              <p>
                Es lo que más repiten quienes ya vienen: orden, limpieza y un trato
                cercano desde que cruzas la puerta.
              </p>
            </article>
            <article className="way">
              <h3>Cerca de casa</h3>
              <p>
                En plena avenida de la Constitución de Bormujos, a mano desde cualquier
                punto del Aljarafe.
              </p>
            </article>
          </div>
        </section>

        {/* Opiniones */}
        <section className="section voices" aria-labelledby="voices-title">
          <div className="voices__score">
            <p className="voices__big" aria-hidden="true">
              {site.rating.score}
            </p>
            <h2 id="voices-title" className="voices__title">
              <span className="sr-only">{site.rating.score} de 5. </span>
              {site.rating.count} en {site.rating.source}
            </h2>
          </div>
          <div className="voices__themes">
            <p className="voices__intro">Lo que más se repite en sus valoraciones:</p>
            <dl>
              <div>
                <dt>El trato</dt>
                <dd>Cercano, atento y sin prisas.</dd>
              </div>
              <div>
                <dt>La limpieza</dt>
                <dd>Un centro cuidado hasta el último detalle.</dd>
              </div>
              <div>
                <dt>La puntualidad</dt>
                <dd>Se respeta la hora de cada cita.</dd>
              </div>
            </dl>
            <p className="voices__note">
              Resumen de las valoraciones públicas del centro. En la web definitiva,
              reseñas reales con el permiso de cada clienta.
            </p>
          </div>
        </section>

        {/* Reserva */}
        <section className="section steps" aria-labelledby="steps-title">
          <div className="section__head">
            <h2 id="steps-title" className="h2">
              Reservar es sencillo
            </h2>
          </div>
          <ol className="steps__list">
            <li>
              <h3>Elige tu tratamiento</h3>
              <p>Desde esta web o desde la carta, sin tener que llamar.</p>
            </li>
            <li>
              <h3>Elige día y hora</h3>
              <p>Ves los huecos libres en la agenda online, a cualquier hora.</p>
            </li>
            <li>
              <h3>Listo</h3>
              <p>Recibes la confirmación de tu cita y solo queda venir.</p>
            </li>
          </ol>
          <div className="steps__cta">
            <BookButton>Pedir cita</BookButton>
            <p>
              ¿Prefieres llamar?{" "}
              <a href={site.phone.href}>{site.phone.display}</a>
            </p>
          </div>
        </section>

        {/* Visita */}
        <section
          id="visitanos"
          className="section visit"
          aria-labelledby="visit-title"
        >
          <div className="visit__photo mirror mirror--wide">
            <Photo name="space" sizes="(min-width: 960px) 40vw, 90vw" />
          </div>
          <div className="visit__info">
            <h2 id="visit-title" className="h2">
              Visítanos
            </h2>
            <address className="visit__address">
              {site.address.street}
              <br />
              {site.address.postal}
            </address>
            <dl className="visit__hours">
              {site.hours.map((h) => (
                <div key={h.days}>
                  <dt>{h.days}</dt>
                  <dd>{h.time}</dd>
                </div>
              ))}
            </dl>
            <ul className="visit__links">
              <li>
                <a href={site.maps.href} target="_blank" rel="noopener noreferrer">
                  Cómo llegar
                </a>
              </li>
              <li>
                <a href={site.phone.href}>{site.phone.display}</a>
              </li>
              <li>
                <a href={site.instagram.href} target="_blank" rel="noopener noreferrer">
                  {site.instagram.handle} en Instagram
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* Cierre */}
        <section className="closing" aria-labelledby="closing-title">
          <div className="closing__glow" aria-hidden="true" />
          <h2 id="closing-title" className="closing__title">
            Te esperamos en Bormujos
          </h2>
          <p>Reserva en un minuto y ven a desconectar un rato.</p>
          <div className="closing__actions">
            <BookButton>Pedir cita</BookButton>
            <a className="btn btn--ghost" href={site.phone.href}>
              Llamar
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <p className="wordmark wordmark--footer">
            <span className="wordmark__a">Pura</span>
            <span className="wordmark__b">Bellezza</span>
          </p>
          <p>
            {site.address.street}, {site.address.postal}
          </p>
          <p className="footer__demo">
            Propuesta de diseño no solicitada, sin relación oficial con {site.name}.
            Sin cookies ni analítica.
          </p>
        </div>
      </footer>

      <MobileDock />
    </BookingProvider>
  );
}
