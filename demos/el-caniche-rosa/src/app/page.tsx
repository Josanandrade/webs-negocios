import { CoatFinder } from "@/components/CoatFinder";
import { Mark } from "@/components/Mark";
import { Pompom } from "@/components/Pompom";
import { Stamp } from "@/components/Stamp";
import { photos } from "@/content/photos";
import { faqs, included, promises, services, site } from "@/content/site";

const external = { target: "_blank", rel: "noopener" } as const;
const newTab = <span className="sr-only"> (se abre en otra pestaña)</span>;

export default function Home() {
  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>

      <header className="header">
        <div className="header__inner wrap">
          <a className="brand" href="#inicio" aria-label="El Caniche Rosa, inicio">
            <Mark className="brand__mark" />
            <span className="brand__name">
              El Caniche <em>Rosa</em>
            </span>
          </a>
          <nav className="nav" aria-label="Secciones">
            <a href="#servicios">Servicios</a>
            <a href="#como">Cómo trabajamos</a>
            <a href="#donde">Dónde y cuándo</a>
            <a href="#preguntas">Preguntas</a>
          </nav>
          <a className="btn btn--ink btn--sm header__cta" href={site.booksy} {...external}>
            Pedir cita{newTab}
          </a>
        </div>
      </header>

      <main id="contenido">
        {/* ---------- Hero ---------- */}
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <div className="hero__inner wrap">
            <div className="hero__copy">
              <p className="eyebrow hero__in" style={{ "--i": 0 } as React.CSSProperties}>
                Peluquería y estética canina · {site.town}
              </p>
              <h1 id="hero-title" className="hero__title">
                <span className="hero__line hero__in" style={{ "--i": 1 } as React.CSSProperties}>
                  Sale guapo.
                </span>
                <span className="hero__line hero__in" style={{ "--i": 2 } as React.CSSProperties}>
                  Y sale <span className="hl">tranquilo.</span>
                </span>
              </h1>
              <p className="hero__lede hero__in" style={{ "--i": 3 } as React.CSSProperties}>
                Baño, corte y cuidados para tu perro en Tomares. Con paciencia, buena
                mano y el trato cariñoso que destacan quienes ya nos conocen.
              </p>
              <div className="hero__actions hero__in" style={{ "--i": 4 } as React.CSSProperties}>
                <a className="btn btn--ink btn--lg" href={site.booksy} {...external}>
                  Reservar en Booksy{newTab}
                  <Arrow />
                </a>
                <a className="btn btn--line btn--lg" href={site.phone.href}>
                  <Phone />
                  Llamar al {site.phone.display}
                </a>
              </div>
              <p className="rating hero__in" style={{ "--i": 5 } as React.CSSProperties}>
                <span className="rating__score">
                  <Star /> {site.rating.score}
                </span>
                <span>
                  en {site.rating.source} · {site.rating.count}
                </span>
              </p>
            </div>

            <div className="hero__art" aria-hidden={photos.hero.src ? undefined : true}>
              <Pompom photo={photos.hero} sizes="(min-width: 900px) 520px, 80vw" priority className="hero__pompom" />
              <span className="dot dot--a" />
              <span className="dot dot--b" />
              <span className="dot dot--c" />
              <Stamp className="hero__stamp" />
            </div>
          </div>
        </section>

        {/* ---------- Servicios ---------- */}
        <section className="section" id="servicios" aria-labelledby="servicios-title">
          <div className="wrap">
            <div className="section__head">
              <p className="eyebrow">Servicios</p>
              <h2 id="servicios-title" className="h2">
                Lo que hacemos, <span className="hl">sin rodeos.</span>
              </h2>
              <p className="section__lede">
                Cuatro servicios, adaptados al tamaño y al pelo de cada perro. El precio
                orientativo de cada uno está en Booksy.
              </p>
            </div>

            <ol className="services">
              {services.map((s, i) => (
                <li key={s.id} className="service">
                  <span className="service__num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="service__name">{s.name}</h3>
                  <p className="service__short">{s.short}</p>
                  <p className="service__body">{s.body}</p>
                  <p className="service__for">
                    <strong>Para:</strong> {s.forWho}
                  </p>
                </li>
              ))}
            </ol>

            <div className="included">
              <h3 className="included__title">Todos los baños incluyen</h3>
              <ul className="included__list">
                {included.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- ¿Qué le toca? ---------- */}
        <section className="section section--mist" id="que-le-toca" aria-labelledby="toca-title">
          <div className="wrap">
            <div className="section__head">
              <p className="eyebrow">¿No sabes qué pedir?</p>
              <h2 id="toca-title" className="h2">
                Dinos cómo es su pelo. <span className="hl">Te decimos qué le toca.</span>
              </h2>
            </div>
            <CoatFinder />
          </div>
        </section>

        {/* ---------- Cómo trabajamos ---------- */}
        <section className="section" id="como" aria-labelledby="como-title">
          <div className="wrap how">
            <div className="section__head how__head">
              <p className="eyebrow">Cómo trabajamos</p>
              <h2 id="como-title" className="h2">
                Aquí tu perro <span className="hl">está en buenas manos.</span>
              </h2>
              <p className="section__lede">
                Una peluquería de barrio, con tiempo para cada perro. Lo de estar guapo
                viene después de estar a gusto.
              </p>
            </div>
            <ul className="promises">
              {promises.map((p, i) => (
                <li key={p.title} className="promise">
                  <span className={`promise__pom promise__pom--${i}`} aria-hidden="true" />
                  <h3 className="promise__title">{p.title}</h3>
                  <p>{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Opiniones + looks ---------- */}
        <section className="section section--ink" id="opiniones" aria-labelledby="opiniones-title">
          <div className="wrap voices">
            <div className="voices__score">
              <p className="eyebrow eyebrow--pink">Lo que dicen</p>
              <h2 id="opiniones-title" className="voices__big">
                {site.rating.score}
                <span className="voices__stars" aria-hidden="true">
                  <Star />
                  <Star />
                  <Star />
                  <Star />
                  <Star />
                </span>
              </h2>
              <p className="voices__meta">
                de 5 en {site.rating.source}, con {site.rating.count} de clientes que ya han
                pasado por aquí.
              </p>
              <p className="voices__themes">
                Las palabras que más se repiten: <span className="hl hl--ink">trato cariñoso</span>{" "}
                y <span className="hl hl--ink">mucha profesionalidad</span>.
              </p>
              <a className="btn btn--pink" href={site.booksy} {...external}>
                Leer opiniones en Booksy{newTab}
                <Arrow />
              </a>
            </div>

            <div className="looks">
              <div className="looks__cluster">
                <Pompom photo={photos.look1} sizes="(min-width: 900px) 312px, 55vw" className="looks__a" />
                <Pompom photo={photos.look2} sizes="(min-width: 900px) 230px, 40vw" className="looks__b" />
                <Pompom photo={photos.look3} sizes="(min-width: 900px) 180px, 32vw" className="looks__c" />
              </div>
              <p className="looks__cta">
                Los cambios de look de cada semana, en{" "}
                <a href={site.social[0].href} {...external}>
                  Instagram {site.social[0].handle}
                  {newTab}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Dónde y cuándo ---------- */}
        <section className="section" id="donde" aria-labelledby="donde-title">
          <div className="wrap visit">
            <div className="visit__card">
              <p className="eyebrow">Dónde y cuándo</p>
              <h2 id="donde-title" className="h2">
                En {site.town.split(",")[0]}, <span className="hl">a un paseo.</span>
              </h2>
              <p className="section__lede">
                Estamos en {site.town}. Al reservar, Booksy te indica la dirección exacta y te la
                guarda en la cita.
              </p>
              <div className="visit__actions">
                <a className="btn btn--ink" href={site.maps} {...external}>
                  Cómo llegar{newTab}
                  <Arrow />
                </a>
                <a className="btn btn--line" href={site.phone.href}>
                  <Phone />
                  {site.phone.display}
                </a>
              </div>
            </div>

            <div className="hours">
              <h3 className="hours__title">Horario</h3>
              <dl className="hours__list">
                {site.hours.map((h) => (
                  <div key={h.days} className={h.when === "Cerrado" ? "is-closed" : undefined}>
                    <dt>{h.days}</dt>
                    <dd>{h.when}</dd>
                  </div>
                ))}
              </dl>
              <p className="hours__note">
                Las horas exactas y los huecos libres, siempre al día en{" "}
                <a href={site.booksy} {...external}>
                  Booksy{newTab}
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Preguntas ---------- */}
        <section className="section section--mist" id="preguntas" aria-labelledby="faq-title">
          <div className="wrap faq">
            <div className="section__head">
              <p className="eyebrow">Preguntas</p>
              <h2 id="faq-title" className="h2">
                Lo que nos <span className="hl">preguntáis siempre.</span>
              </h2>
            </div>
            <div className="faq__list">
              {faqs.map((f) => (
                <details key={f.q} className="qa">
                  <summary>
                    <span>{f.q}</span>
                    <span className="qa__icon" aria-hidden="true" />
                  </summary>
                  <div className="qa__body">
                    <p>{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Cierre ---------- */}
        <section className="closing" aria-labelledby="closing-title">
          <div className="wrap closing__inner">
            <Mark className="closing__mark" ear="var(--paper)" cut="var(--pink)" />
            <h2 id="closing-title" className="closing__title">
              ¿Le toca peluquería?
            </h2>
            <p className="closing__lede">Elige hueco en un minuto o llámanos y lo vemos juntos.</p>
            <div className="closing__actions">
              <a className="btn btn--ink btn--lg" href={site.booksy} {...external}>
                Reservar en Booksy{newTab}
                <Arrow />
              </a>
              <a className="btn btn--paper btn--lg" href={site.phone.href}>
                <Phone />
                {site.phone.display}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__inner">
          <div className="footer__brand">
            <Mark className="footer__mark" cut="var(--ink)" />
            <p>
              <strong>{site.name}</strong>
              <br />
              {site.tagline} · {site.town}
            </p>
          </div>
          <ul className="footer__social">
            {site.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} {...external}>
                  {s.label}
                  <span className="footer__handle">{s.handle}</span>
                  {newTab}
                </a>
              </li>
            ))}
          </ul>
          <p className="footer__legal">
            Web de demostración. No es la web oficial del negocio ni gestiona citas: las
            reservas se hacen en Booksy o por teléfono.
          </p>
        </div>
      </footer>

      <nav className="dock" aria-label="Contacto rápido">
        <a className="dock__btn dock__btn--line" href={site.phone.href}>
          <Phone />
          Llamar
        </a>
        <a className="dock__btn" href={site.booksy} {...external}>
          Pedir cita{newTab}
        </a>
      </nav>
    </>
  );
}

function Arrow() {
  return (
    <svg className="icon icon--arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function Phone() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.6 3.5h2.6l1.4 4.1-1.9 1.3a11 11 0 0 0 6.4 6.4l1.3-1.9 4.1 1.4v2.6a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
    </svg>
  );
}

function Star() {
  return (
    <svg className="star" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
    </svg>
  );
}
