import Link from "next/link";
import { RoundSeal, Seal, Wordmark } from "@/components/Brand";
import { Dock } from "@/components/Dock";
import { Header } from "@/components/Header";
import { Photo } from "@/components/Photo";
import { Planner } from "@/components/Planner";
import { Reveal } from "@/components/Reveal";
import { TreatmentMenu } from "@/components/TreatmentMenu";
import { areas, pillars, reviewThemes, signatureSteps, site, visitSteps } from "@/content/jalis";

const ext = { target: "_blank", rel: "noopener noreferrer nofollow" } as const;

export default function Home() {
  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <aside className="demobar" aria-label="Aviso de demo">
        <span>
          Propuesta privada<span className="demobar__long"> de diseño</span> · no es la web oficial
        </span>
        <Link href="/propuesta">Ver propuesta</Link>
      </aside>

      <Header />

      <main id="contenido">
        {/* ---------- Portada ---------- */}
        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <div className="wrap hero__grid">
            <div className="hero__copy">
              <p className="eyebrow eyebrow--light">
                Castilleja de la Cuesta <span className="eyebrow__sep" aria-hidden="true" /> Aljarafe
              </p>
              <h1 id="hero-title" className="hero__title">
                Más de {site.years} años
                <br />
                cuidando <em>de ti</em>
                <br />
                con oficio.
              </h1>
              <p className="hero__lede">
                Tratamientos faciales y corporales, depilación láser, manos y mirada en un centro de belleza y
                bienestar con trayectoria, técnica actual y un trato que destacan sus reseñas.
              </p>
              <div className="hero__actions">
                <a href="#reservar" className="btn btn--light">
                  Reservar cita
                </a>
                <a href="#tratamientos" className="btn btn--line-light">
                  Ver tratamientos
                </a>
              </div>
              <dl className="hero__facts">
                <div>
                  <dt>Trayectoria</dt>
                  <dd>+{site.years} años</dd>
                </div>
                <div>
                  <dt>Booksy</dt>
                  <dd>
                    5,0 <span>· 141 reseñas</span>
                  </dd>
                </div>
                <div>
                  <dt>Carta</dt>
                  <dd>{areas.length} áreas</dd>
                </div>
              </dl>
            </div>
            <div className="hero__visual">
              <Photo slot="hero" className="hero__photo" priority sizes="(min-width: 960px) 42vw, 100vw" />
              <div className="hero__seal">
                <RoundSeal years={site.years} />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Trayectoria ---------- */}
        <section className="section story" aria-labelledby="story-title">
          <div className="wrap story__grid">
            <Reveal className="story__figure">
              <p className="story__big" aria-hidden="true">
                {site.years}
                <sup>+</sup>
              </p>
              <p className="story__caption">años abiertos en la calle Zambra</p>
            </Reveal>
            <Reveal className="story__copy" delay={60}>
              <p className="eyebrow">La experiencia</p>
              <h2 id="story-title" className="h2">
                La experiencia no se anuncia. <em>Se nota.</em>
              </h2>
              <p className="lead">
                Jalis lleva más de dieciocho años abierto en Castilleja. En ese tiempo ha incorporado
                radiofrecuencia, dermapen o láser sin perder lo que lo hizo crecer: hacer bien lo básico y
                tratar a cada persona como si fuera la única de la agenda.
              </p>
            </Reveal>
          </div>
          <div className="wrap">
            <ol className="pillars">
              {pillars.map((p, i) => (
                <Reveal as="li" key={p.title} className="pillar" delay={i * 70}>
                  <span className="pillar__n">0{i + 1}</span>
                  <h3 className="pillar__title">{p.title}</h3>
                  <p>{p.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Carta de tratamientos ---------- */}
        <section id="tratamientos" className="section treatments" aria-labelledby="treat-title">
          <div className="wrap">
            <Reveal as="header" className="section__head">
              <p className="eyebrow">Carta de tratamientos</p>
              <h2 id="treat-title" className="h2">
                Cinco áreas, <em>un mismo criterio.</em>
              </h2>
              <p className="section__intro">
                Ordenada como la consultarías en el centro: elige un área y ve qué incluye, cuánto dura y su precio
                de referencia.
              </p>
            </Reveal>
            <TreatmentMenu areas={areas} />
          </div>
        </section>

        {/* ---------- Tratamiento firma ---------- */}
        <section className="section signature" aria-labelledby="sig-title">
          <div className="wrap signature__grid">
            <Reveal className="signature__copy">
              <p className="eyebrow eyebrow--light">Tratamiento estrella</p>
              <h2 id="sig-title" className="h2 h2--light">
                Una sesión. <em>Cinco técnicas.</em>
              </h2>
              <p className="lead lead--light">
                El facial más completo de la casa reúne en una sola cita lo mejor de su cabina: de la higiene a la
                aparatología, con un masaje para cerrar.
              </p>
              <p className="signature__price">
                <span>Sesión</span> 80 €
              </p>
              <a href="#reservar" className="btn btn--light">
                Quiero probarlo
              </a>
            </Reveal>
            <ol className="steps">
              {signatureSteps.map((s, i) => (
                <Reveal as="li" key={s.name} className="step" delay={i * 60}>
                  <span className="step__n">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="step__name">{s.name}</h3>
                    <p className="step__text">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- El centro ---------- */}
        <section id="centro" className="section center" aria-labelledby="center-title">
          <div className="wrap center__grid">
            <Reveal className="center__copy">
              <p className="eyebrow">El centro</p>
              <h2 id="center-title" className="h2">
                Un lugar cuidado, <em>un equipo que se queda.</em>
              </h2>
              <p className="lead">
                Dos locales en la calle Zambra, cabinas preparadas para cada tipo de tratamiento y profesionales a
                las que sus clientas llaman por su nombre.
              </p>
              <ul className="ticks">
                <li>Aparatología facial y corporal en cabina propia</li>
                <li>Depilación láser, cera e hilo</li>
                <li>Bonos para tratamientos por sesiones</li>
                <li>Reserva online las 24 horas</li>
              </ul>
            </Reveal>
            <div className="center__photos">
              <Photo slot="centro" className="center__p1" tone="light" sizes="(min-width: 960px) 34vw, 100vw" />
              <Photo slot="facial" className="center__p2" sizes="(min-width: 960px) 22vw, 50vw" />
              <Photo slot="equipo" className="center__p3" tone="light" sizes="(min-width: 960px) 22vw, 50vw" />
            </div>
          </div>
        </section>

        {/* ---------- Tu cita ---------- */}
        <section id="cita" className="section visit" aria-labelledby="visit-title">
          <div className="wrap">
            <Reveal as="header" className="section__head section__head--row">
              <div>
                <p className="eyebrow">Tu cita</p>
                <h2 id="visit-title" className="h2">
                  Fácil de reservar, <em>sin prisas en cabina.</em>
                </h2>
              </div>
              <a href="#reservar" className="btn btn--dark section__cta">
                Reservar cita
              </a>
            </Reveal>
            <ol className="timeline">
              {visitSteps.map((s, i) => (
                <Reveal as="li" key={s.title} className="timeline__item" delay={i * 60}>
                  <span className="timeline__n">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Opiniones ---------- */}
        <section id="opiniones" className="section reviews" aria-labelledby="rev-title">
          <div className="wrap reviews__grid">
            <Reveal className="reviews__score">
              <p className="eyebrow">Opiniones</p>
              <h2 id="rev-title" className="h2">
                La confianza <em>se gana cita a cita.</em>
              </h2>
              <div className="scores">
                {site.ratings.map((r) => (
                  <div key={r.source} className="score">
                    <p className="score__value">{r.value}</p>
                    <p className="score__stars" aria-hidden="true">
                      ★★★★★
                    </p>
                    <p className="score__src">
                      {r.source} <span>· {r.detail}</span>
                    </p>
                  </div>
                ))}
              </div>
              <a className="link" href={site.booksyUrl} {...ext}>
                Leer todas las reseñas
              </a>
            </Reveal>
            <ul className="themes">
              {reviewThemes.map((t, i) => (
                <Reveal as="li" key={t.title} className="theme" delay={i * 70}>
                  <h3 className="theme__title">{t.title}</h3>
                  <p className="theme__text">{t.text}</p>
                  {t.quote && (
                    <figure className="theme__quote">
                      <blockquote>“{t.quote}”</blockquote>
                      <figcaption>{t.source}</figcaption>
                    </figure>
                  )}
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Reserva ---------- */}
        <section id="reservar" className="section booking" aria-labelledby="book-title">
          <div className="wrap booking__grid">
            <Reveal className="booking__copy">
              <p className="eyebrow eyebrow--light">Reservar</p>
              <h2 id="book-title" className="h2 h2--light">
                Tu próxima cita, <em>en un minuto.</em>
              </h2>
              <p className="lead lead--light">
                Dinos qué te interesa y cuándo te viene bien. Te dejamos el mensaje listo para reservar online o
                por teléfono.
              </p>
              <Seal size={72} className="booking__seal" />
            </Reveal>
            <Planner />
          </div>
        </section>

        {/* ---------- Visítanos ---------- */}
        <section id="visitanos" className="section place" aria-labelledby="place-title">
          <div className="wrap place__grid">
            <Reveal className="place__info">
              <p className="eyebrow">Visítanos</p>
              <h2 id="place-title" className="h2">
                En el corazón <em>de Castilleja.</em>
              </h2>
              <address className="place__address">
                {site.address.street}
                <br />
                {site.address.postal}
                <span className="place__corner">{site.address.corner}</span>
              </address>
              <dl className="hours">
                {site.hours.map((h) => (
                  <div key={h.days} className={h.time === "Cerrado" ? "is-closed" : undefined}>
                    <dt>{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
              <p className="hours__note">Horario publicado en directorios; pendiente de confirmar con el centro.</p>
              <div className="place__contact">
                <a href={site.phone.href}>{site.phone.display}</a>
                <a href={site.landline.href}>{site.landline.display}</a>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </div>
              <div className="place__actions">
                <a className="btn btn--dark" href={site.address.mapsUrl} {...ext}>
                  Cómo llegar
                </a>
                <a className="btn btn--outline" href={site.phone.href}>
                  Llamar
                </a>
              </div>
            </Reveal>
            <div className="place__visual">
              <Photo slot="fachada" className="place__photo" tone="light" sizes="(min-width: 960px) 46vw, 100vw" />
              <div className="place__plaque" aria-hidden="true">
                <span>C/ Zambra</span>
                <span className="place__plaque-x">·</span>
                <span>Locales 6 y 7</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__grid">
          <div>
            <Wordmark />
            <p className="footer__line">
              Centro de belleza y bienestar en {site.town} desde hace más de {site.years} años.
            </p>
          </div>
          <nav className="footer__links" aria-label="Enlaces">
            <a href="#tratamientos">Tratamientos</a>
            <a href="#reservar">Reservar</a>
            <a href={site.facebookUrl} {...ext}>
              Facebook
            </a>
            <a href={site.booksyUrl} {...ext}>
              Booksy
            </a>
          </nav>
        </div>
        <div className="wrap footer__legal">
          <p>
            Propuesta de diseño privada y no solicitada, preparada como demostración. No es la web oficial de Jalis
            ni está publicada por el centro. Datos tomados de fuentes públicas en octubre de 2026; pendientes de
            validar con el negocio.
          </p>
        </div>
      </footer>

      <Dock />
    </>
  );
}
