import { Booking } from "@/components/Booking";
import { DemoBar, Wordmark } from "@/components/Brand";
import { Photo } from "@/components/Photo";
import { business, treatments, visitSteps } from "@/content/mgi";

const signature = treatments.slice(0, 1)[0];
const featured = treatments.slice(2, 4);

export default function Home() {
  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <DemoBar />

      <header className="header">
        <a href="#inicio" className="header__brand" aria-label="MG&I, inicio">
          <Wordmark />
          <span className="header__place">Sevilla</span>
        </a>
        <nav className="header__nav" aria-label="Principal">
          <a href="#tratamientos">Tratamientos</a>
          <a href="#experiencia">La visita</a>
          <a href="#centro">El centro</a>
          <a href="#ubicacion">Dónde estamos</a>
        </nav>
        <a className="btn btn--solid btn--sm" href="#reservar">
          Reservar
        </a>
      </header>

      <main id="contenido">
        {/* HERO */}
        <section id="inicio" className="hero">
          <div className="hero__text">
            <p className="eyebrow">Boutique de belleza · Sevilla</p>
            <h1 className="hero__title">
              <span className="line">
                La precisión <span className="it">del hilo.</span>
              </span>
              <span className="line">
                El cuidado <span className="it">de tu piel.</span>
              </span>
            </h1>
            <p className="hero__lead">
              Cejas y depilación facial con hilo, tratamientos faciales y maquillaje. Con calma, con
              criterio y a tu medida.
            </p>
            <div className="hero__ctas">
              <a className="btn btn--solid" href="#reservar">
                Reservar cita
              </a>
              <a className="btn btn--line" href="#tratamientos">
                Ver tratamientos
              </a>
            </div>
          </div>
          <div className="hero__visual">
            <Photo slot="hero" sizes="(min-width: 960px) 46vw, 100vw" eager />
            <p className="hero__address">
              <span>{business.street}</span>
              <span>
                {business.postalCode} {business.city}
              </span>
            </p>
          </div>
          <svg className="hero__thread" viewBox="0 0 1440 220" aria-hidden="true" preserveAspectRatio="none">
            <path d="M0 160 C 240 40, 420 210, 720 120 S 1200 30, 1440 110" />
          </svg>
        </section>

        {/* CINTA DE SERVICIOS */}
        <div className="ribbon" aria-hidden="true">
          <div className="ribbon__track">
            {[0, 1].map((k) => (
              <span key={k}>
                {treatments.map((t) => (
                  <span key={t.id}>
                    {t.name} <em>&amp;</em>{" "}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* FIRMA: CEJAS CON HILO */}
        <section className="signature" aria-labelledby="firma-title">
          <div className="signature__photo">
            <Photo slot="detalle01" sizes="(min-width: 960px) 40vw, 100vw" />
          </div>
          <div className="signature__text">
            <p className="eyebrow">{signature.kicker}</p>
            <h2 id="firma-title" className="display">
              {signature.name}
            </h2>
            <p className="lead">{signature.body}</p>
            <ul className="ticks">
              {signature.includes.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <dl className="facts">
              <div>
                <dt>Técnica</dt>
                <dd>Hilo, sin cera sobre el rostro</dd>
              </div>
              <div>
                <dt>Para quién</dt>
                <dd>Quien quiere definir sin perder naturalidad</dd>
              </div>
            </dl>
            <a className="btn btn--solid" href="#reservar">
              Reservar cejas
            </a>
          </div>
        </section>

        {/* TRATAMIENTOS */}
        <section id="tratamientos" className="section treatments" aria-labelledby="trat-title">
          <div className="section__head">
            <p className="eyebrow">Tratamientos</p>
            <h2 id="trat-title" className="display">
              Pocos tratamientos, <span className="it">bien hechos.</span>
            </h2>
            <p className="section__intro">
              Precio y duración se confirman al reservar, según lo que necesites.
            </p>
          </div>

          <div className="featured" role="region" tabIndex={0} aria-label="Tratamientos destacados">
            {featured.map((t, i) => (
              <article key={t.id} className="feature">
                <Photo
                  slot={i === 0 ? "facial" : "detalle02"}
                  sizes="(min-width: 960px) 30vw, 88vw"
                />
                <p className="eyebrow">{t.kicker}</p>
                <h3 className="feature__title">{t.name}</h3>
                <p>{t.body}</p>
              </article>
            ))}
          </div>

          <ol className="menu">
            {treatments.map((t, i) => (
              <li key={t.id}>
                <details name="tratamiento">
                  <summary>
                    <span className="menu__num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="menu__name">{t.name}</span>
                    <span className="menu__kicker">{t.kicker}</span>
                    <span className="menu__icon" aria-hidden="true" />
                  </summary>
                  <div className="menu__body">
                    <p>{t.body}</p>
                    <ul className="ticks">
                      {t.includes.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                    <a className="link" href="#reservar">
                      Pedir cita para {t.name.toLowerCase()} →
                    </a>
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </section>

        {/* EXPERIENCIA */}
        <section id="experiencia" className="section visit" aria-labelledby="visit-title">
          <div className="section__head">
            <p className="eyebrow">La visita</p>
            <h2 id="visit-title" className="display">
              Así es una cita <span className="it">en MG&amp;I.</span>
            </h2>
          </div>
          <ol className="steps">
            {visitSteps.map((s, i) => (
              <li key={s.title}>
                <span className="steps__num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* RESULTADOS */}
        <section className="results" aria-labelledby="res-title">
          <div className="results__text">
            <p className="eyebrow">Resultados</p>
            <h2 id="res-title" className="display">
              Lo que se ve <span className="it">es lo que hacemos.</span>
            </h2>
            <p className="lead">
              Fotografías reales de clientas, siempre con su permiso. Sin filtros que prometan lo que
              una cita no puede dar.
            </p>
            <a className="btn btn--light" href="#reservar">
              Quiero mi cita
            </a>
          </div>
          <div className="results__photo">
            <Photo slot="resultado01" sizes="(min-width: 960px) 44vw, 100vw" />
          </div>
        </section>

        {/* EL CENTRO */}
        <section id="centro" className="section studio" aria-labelledby="centro-title">
          <div className="section__head">
            <p className="eyebrow">El centro</p>
            <h2 id="centro-title" className="display">
              Un espacio cuidado, <span className="it">con tiempo para ti.</span>
            </h2>
            <p className="section__intro">
              Cada cita, sin prisas y con atención personal.
            </p>
          </div>
          <div className="gallery" role="region" tabIndex={0} aria-label="Fotografías del centro">
            <Photo slot="profesional" sizes="(min-width: 960px) 34vw, 78vw" />
            <Photo slot="instalaciones01" sizes="(min-width: 960px) 56vw, 92vw" />
          </div>
        </section>

        {/* RESERVA */}
        <section id="reservar" className="section reserve" aria-labelledby="res-cita-title">
          <div className="section__head">
            <p className="eyebrow">Reservar cita</p>
            <h2 id="res-cita-title" className="display">
              Tu cita, <span className="it">en dos toques.</span>
            </h2>
            <p className="section__intro">
              Dinos qué te apetece y te dejamos el mensaje listo para llamar.
            </p>
          </div>
          <Booking />
        </section>

        {/* UBICACIÓN */}
        <section id="ubicacion" className="section location" aria-labelledby="ubi-title">
          <div className="location__card">
            <p className="eyebrow">Dónde estamos</p>
            <h2 id="ubi-title" className="display">
              {business.street.split(",")[0]}
            </h2>
            <address>
              {business.street}
              <br />
              {business.postalCode} {business.city}
            </address>
            <div className="location__actions">
              <a className="btn btn--solid" href={business.mapsHref} target="_blank" rel="noopener noreferrer">
                Cómo llegar
              </a>
              <a className="btn btn--line" href={business.phoneHref}>
                {business.phoneDisplay}
              </a>
            </div>
            <p className="location__note">Horario: confírmalo por teléfono al reservar.</p>
          </div>
          <div className="location__map" aria-hidden="true">
            <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
              <path className="map__street" d="M-20 210 L 420 120" />
              <path className="map__street map__street--thin" d="M120 -20 L 180 320" />
              <path className="map__street map__street--thin" d="M300 -20 L 260 320" />
              <path className="map__thread" d="M40 280 C 120 230, 150 190, 205 168" />
              <circle className="map__pin" cx="205" cy="168" r="9" />
            </svg>
            <span className="map__label">MG&amp;I</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <Wordmark className="footer__mark" />
        <div className="footer__cols">
          <p>
            {business.legalLabel}
            <br />
            {business.street} · {business.postalCode} {business.city}
          </p>
          <p>
            <a href={business.phoneHref}>{business.phoneDisplay}</a>
          </p>
        </div>
        <p className="footer__legal">
          Demo de propuesta de diseño elaborada por AvanttAI. No es la web oficial del negocio ni
          está afiliada a él. Contenido pendiente de validación.
        </p>
      </footer>

      {/* Barra fija móvil: los dos gestos que importan */}
      <nav className="dock" aria-label="Acciones rápidas">
        <a href={business.phoneHref} className="dock__call">
          Llamar
        </a>
        <a href="#reservar" className="dock__book">
          Reservar cita
        </a>
      </nav>
    </>
  );
}
