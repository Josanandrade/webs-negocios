import { Booking, BookingTrigger, PhoneIcon } from "@/components/Booking";
import { ColorLab } from "@/components/ColorLab";
import { Strands } from "@/components/Strands";
import { hours, reviewThemes, salon, serviceGroups, techniques } from "@/content/salon";

const heroStrands = techniques.find((t) => t.id === "balayage")!.strands;
const cardStrands = techniques.find((t) => t.id === "mechas")!.strands;
const reviewsHref =
  "https://www.google.com/maps/search/?api=1&query=Peluquer%C3%ADa%20y%20est%C3%A9tica%20Los%20%C3%81ngeles%20Dos%20Hermanas";

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">
        Saltar al contenido
      </a>

      <aside className="demo-bar" aria-label="Aviso">
        Propuesta de diseño · no es la web oficial del salón
      </aside>

      <header className="top">
        <div className="top-inner">
          <a className="mark" href="#main" aria-label="Los Ángeles, inicio">
            <span className="mark-name">Los Ángeles</span>
            <span className="mark-kind">peluquería &amp; estética</span>
          </a>
          <nav className="top-nav" aria-label="Secciones">
            <a href="#servicios">Servicios</a>
            <a href="#color">Color</a>
            <a href="#opiniones">Opiniones</a>
            <a href="#visitanos">Visítanos</a>
          </nav>
          <a className="top-call" href={salon.phone.href}>
            <PhoneIcon />
            <span className="top-call-label">{salon.phone.display}</span>
            <span className="sr-only">Llamar al salón</span>
          </a>
          <BookingTrigger className="btn btn-hot btn-sm top-book">Pedir cita</BookingTrigger>
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              Peluquería y estética · {salon.town}
            </p>
            <h1 id="hero-title" className="hero-title">
              <span className="hero-line">Corte,</span>
              <span className="hero-line">color</span>
              <span className="hero-line">
                y <em>cambio</em>
              </span>
              <span className="hero-line">de look.</span>
            </h1>
            <p className="hero-lead">
              Salón para mujer y hombre en la Avenida de España. Cortes, mechas y balayage,
              tratamientos para el pelo, uñas y depilación, todo en el mismo sitio.
            </p>
            <div className="hero-actions">
              <BookingTrigger className="btn btn-hot">Pedir cita</BookingTrigger>
              <a className="btn btn-line" href={salon.phone.href}>
                <PhoneIcon />
                {salon.phone.display}
              </a>
            </div>
            <a className="rating-chip" href="#opiniones">
              <Stars />
              <span>
                <strong>{salon.rating.value}</strong> en {salon.rating.source} ·{" "}
                {salon.rating.countLabel}
              </span>
            </a>
          </div>
          <div className="hero-art">
            <Strands id="hero" strands={heroStrands} className="strands-hero" />
            <p className="hero-tag" aria-hidden="true">
              Av. de España, 110
            </p>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <p>
            Corte <i>·</i> Color <i>·</i> Mechas <i>·</i> Balayage <i>·</i> Keratina{" "}
            <i>·</i> Extensiones <i>·</i> Manicura <i>·</i> Pedicura <i>·</i> Depilación
          </p>
        </div>

        <section id="servicios" className="services" aria-labelledby="services-title">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow eyebrow-dark">Qué te hacemos</p>
              <h2 id="services-title" className="section-title">
                Cuatro motivos para <em>venir</em>
              </h2>
            </div>
            <ol className="groups">
              {serviceGroups.map((g) => (
                <li key={g.id} className={`group group-${g.id}`}>
                  <span className="group-index" aria-hidden="true">
                    {g.index}
                  </span>
                  <div className="group-body">
                    <p className="group-kicker">{g.kicker}</p>
                    <h3 className="group-title">{g.title}</h3>
                    <p className="group-lead">{g.lead}</p>
                    <ul className="group-items">
                      {g.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                  {g.id === "color" && (
                    <Strands id="card" strands={cardStrands} className="strands-card" />
                  )}
                  <BookingTrigger className="group-cta" preset={g.id}>
                    Pedir cita<span className="sr-only"> para {g.title.toLowerCase()}</span>
                    <Arrow />
                  </BookingTrigger>
                </li>
              ))}
            </ol>
            <p className="services-note">
              ¿Precio o duración de algo en concreto? Llama y te lo dicen según tu pelo.
            </p>
          </div>
        </section>

        <section id="color" className="color" aria-labelledby="color-title">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">Carta de color</p>
              <h2 id="color-title" className="section-title section-title-light">
                ¿Mechas o <em>balayage</em>?
              </h2>
              <p className="section-lead">
                La duda más común en el sillón. Toca cada técnica y mira cómo cambia el pelo de
                raíz a puntas.
              </p>
            </div>
            <ColorLab />
          </div>
        </section>

        <section id="opiniones" className="reviews" aria-labelledby="reviews-title">
          <div className="wrap reviews-grid">
            <div className="score">
              <h2 id="reviews-title" className="sr-only">
                Opiniones
              </h2>
              <p className="score-num" aria-hidden="true">
                {salon.rating.value}
              </p>
              <Stars large />
              <p className="score-meta">
                <span className="sr-only">Valoración de {salon.rating.value} sobre 5 </span>
                en {salon.rating.source}, con {salon.rating.countLabel}
              </p>
              <a className="link" href={reviewsHref} target="_blank" rel="noopener noreferrer">
                Leer las reseñas en Google
                <Arrow />
              </a>
            </div>
            <div className="themes">
              <p className="eyebrow eyebrow-dark">Lo que más se repite</p>
              <ul className="theme-list">
                {reviewThemes.map((t) => (
                  <li key={t.title}>
                    <h3>{t.title}</h3>
                    <p>{t.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="visitanos" className="visit" aria-labelledby="visit-title">
          <div className="wrap visit-grid">
            <div>
              <p className="eyebrow eyebrow-dark">Visítanos</p>
              <h2 id="visit-title" className="visit-title">
                {salon.address.street}
              </h2>
              <p className="visit-town">{salon.address.postal}</p>
              <div className="visit-actions">
                <a className="btn btn-ink" href={salon.phone.href}>
                  <PhoneIcon />
                  Llamar al {salon.phone.display}
                </a>
                <a
                  className="btn btn-line-ink"
                  href={salon.directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cómo llegar
                </a>
              </div>
              <p className="visit-social">
                También en{" "}
                <a href={salon.facebookHref} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </p>
            </div>
            <div className="hours">
              <h3 className="hours-title">Horario</h3>
              <dl>
                {hours.map((h) => (
                  <div key={h.day} className="hours-row">
                    <dt>{h.day}</dt>
                    <dd>
                      {h.time}
                      {h.note && <span>{h.note}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="hours-note">Se trabaja con cita previa. Llama antes de venir.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot-inner">
          <p className="foot-mark">Los Ángeles</p>
          <p>
            {salon.fullName} · {salon.address.street}, {salon.address.postal}
          </p>
          <p className="foot-demo">
            Propuesta de diseño no oficial, sin cookies ni seguimiento. No es la web del salón ni
            está publicada por él.
          </p>
        </div>
      </footer>

      <nav className="dock" aria-label="Contacto rápido">
        <a className="btn btn-line dock-call" href={salon.phone.href}>
          <PhoneIcon />
          Llamar
        </a>
        <BookingTrigger className="btn btn-hot dock-book">Pedir cita</BookingTrigger>
      </nav>

      <Booking />
    </>
  );
}

function Stars({ large }: { large?: boolean }) {
  // 4,6 de 5: cuatro llenas y la quinta al 60 %.
  return (
    <span className={large ? "stars stars-lg" : "stars"} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24">
          <defs>
            {i === 4 && (
              <linearGradient id={`part-${large ? "l" : "s"}`}>
                <stop offset="0.6" stopColor="currentColor" />
                <stop offset="0.6" stopColor="currentColor" stopOpacity="0.25" />
              </linearGradient>
            )}
          </defs>
          <path
            d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
            fill={i === 4 ? `url(#part-${large ? "l" : "s"})` : "currentColor"}
          />
        </svg>
      ))}
    </span>
  );
}

function Arrow() {
  return (
    <svg className="icon arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}
