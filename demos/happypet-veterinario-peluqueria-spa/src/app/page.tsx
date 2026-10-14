import Chooser from "@/components/Chooser";
import Dock from "@/components/Dock";
import HoursTable from "@/components/HoursTable";
import Icon from "@/components/Icon";
import OpenNow from "@/components/OpenNow";
import { areas, business, faqs, reviews, visitSteps, type Area } from "@/content/site";

const doorCopy: Record<Area, string> = {
  salud: "Consulta, vacunas, revisiones y tratamiento",
  cuidado: "Baño, corte, higiene y spa",
};

function Door({ area }: { area: Area }) {
  const a = areas[area];
  return (
    <a className="door" data-area={area} href={`#${area}`}>
      <span className="door__icon">
        <Icon name={area} />
      </span>
      <span className="door__kicker">{a.kicker}</span>
      <span className="door__label">{a.label}</span>
      <span className="door__copy">{doorCopy[area]}</span>
      <span className="door__go" aria-hidden="true">
        <Icon name="arrow" />
      </span>
    </a>
  );
}

function AreaSection({ area }: { area: Area }) {
  const a = areas[area];
  return (
    <section id={area} className="area" data-area={area} aria-labelledby={`${area}-title`}>
      <div className="wrap area__grid">
        <header className="area__head">
          <p className="tag">
            <Icon name={area} />
            {a.kicker} · {a.label}
          </p>
          <h2 id={`${area}-title`} className="area__title">
            {a.title}
          </h2>
          <p className="area__intro">{a.intro}</p>
          <p className="area__note">{a.note}</p>
          <a className="btn btn--solid" href={business.phoneHref}>
            <Icon name="phone" />
            Pedir cita de {a.label.toLowerCase()}
          </a>
        </header>
        <ul className="area__list">
          {a.services.map((s, i) => (
            <li key={s.name} className="service">
              <span className="service__num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="service__name">{s.name}</h3>
              <p className="service__text">{s.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>

      <header className="top">
        <div className="wrap top__inner">
          <a className="brand" href="#inicio" aria-label={`${business.name}, inicio`}>
            <span className="brand__mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="brand__text">
              <span className="brand__name">{business.name}</span>
              <span className="brand__sub">
                Veterinaria <span aria-hidden="true">·</span> Peluquería & Spa
              </span>
            </span>
          </a>
          <nav className="top__nav" aria-label="Secciones">
            <a href="#salud" data-area="salud">
              Veterinaria
            </a>
            <a href="#cuidado" data-area="cuidado">
              Peluquería & Spa
            </a>
            <a href="#visita">La visita</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <a className="btn btn--small btn--solid top__call" href={business.phoneHref}>
            <Icon name="phone" />
            <span className="top__call-text">{business.phone}</span>
            <span className="top__call-short">Llamar</span>
          </a>
        </div>
      </header>

      <main id="contenido">
        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <div className="wrap hero__grid">
            <div className="hero__copy">
              <p className="hero__place">
                <Icon name="pin" />
                {business.town}
              </p>
              <h1 id="hero-title" className="hero__title">
                Su salud y su cuidado, <em>bajo el mismo techo.</em>
              </h1>
              <p className="hero__lead">
                Centro veterinario y peluquería & spa para perros y gatos. Dos servicios bien diferenciados, un
                mismo equipo que conoce a tu animal y lo trata con cariño.
              </p>
            </div>
            <div className="hero__doors">
              <Door area="salud" />
              <Door area="cuidado" />
            </div>
            <div className="hero__cta">
              <div className="hero__actions">
                <a className="btn btn--solid btn--big" href={business.phoneHref}>
                  <Icon name="phone" />
                  Llamar y pedir cita
                </a>
                <a className="btn btn--ghost btn--big" href="#elige">
                  ¿Qué servicio necesito?
                </a>
              </div>
              <OpenNow className="hero__open" />
            </div>
          </div>
        </section>

        <section id="elige" className="choose" aria-labelledby="elige-title">
          <div className="wrap choose__grid">
            <div className="choose__head">
              <p className="eyebrow">Para empezar</p>
              <h2 id="elige-title" className="section-title">
                ¿Qué le pasa hoy?
              </h2>
              <p className="section-lead">
                Elige lo que más se parece a tu caso y te decimos si es para la veterinaria o para la peluquería, y
                qué contarnos al llamar.
              </p>
            </div>
            <Chooser />
          </div>
        </section>

        <AreaSection area="salud" />
        <AreaSection area="cuidado" />

        <section id="visita" className="visit" aria-labelledby="visita-title">
          <div className="wrap">
            <p className="eyebrow">Cómo trabajamos</p>
            <h2 id="visita-title" className="section-title">
              Así es una visita
            </h2>
            <ol className="steps">
              {visitSteps.map((s, i) => (
                <li key={s.title} className="step">
                  <span className="step__num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="step__title">{s.title}</h3>
                  <p className="step__text">{s.text}</p>
                </li>
              ))}
            </ol>
            <div className="team">
              <p className="team__text">
                Somos un centro pequeño, de trato cercano y llevado por mujeres. Aquí tu animal no es un número:
                lo conocemos por su nombre, sabemos cómo reacciona y adaptamos cada visita a él.
              </p>
            </div>
          </div>
        </section>

        <section id="opiniones" className="reviews" aria-labelledby="opiniones-title">
          <div className="wrap">
            <p className="eyebrow">Opiniones en Google</p>
            <h2 id="opiniones-title" className="section-title">
              Lo que cuentan quienes ya vienen
            </h2>
            <ul className="reviews__list">
              {reviews.map((r, i) => (
                <li key={r.author} className={`review${i === 0 ? " review--lead" : ""}`}>
                  <figure>
                    <blockquote>
                      <p>{r.text}</p>
                    </blockquote>
                    <figcaption>{r.author}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="preguntas" className="faq" aria-labelledby="preguntas-title">
          <div className="wrap faq__grid">
            <div>
              <p className="eyebrow">Dudas frecuentes</p>
              <h2 id="preguntas-title" className="section-title">
                Antes de venir
              </h2>
            </div>
            <div className="faq__list">
              {faqs.map((f) => (
                <details key={f.q} className="qa">
                  <summary>
                    <span>{f.q}</span>
                    <span className="qa__sign" aria-hidden="true" />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="contact" aria-labelledby="contacto-title">
          <div className="wrap contact__grid">
            <div className="contact__main">
              <p className="eyebrow eyebrow--light">Contacto</p>
              <h2 id="contacto-title" className="section-title">
                Te esperamos en Bollullos
              </h2>
              <address className="contact__address">
                {business.address}
                <br />
                {business.postal}
              </address>
              <div className="contact__actions">
                <a className="btn btn--light btn--big" href={business.phoneHref}>
                  <Icon name="phone" />
                  {business.phone}
                </a>
                <a className="btn btn--outline-light btn--big" href={business.mapsHref} target="_blank" rel="noopener noreferrer">
                  <Icon name="pin" />
                  Cómo llegar
                </a>
              </div>
              <p className="contact__small">
                Atendemos con cita previa, en veterinaria y en peluquería. También estamos en{" "}
                <a href={business.facebookHref} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
                .
              </p>
            </div>
            <div className="contact__hours">
              <h3 className="contact__hours-title">Horario</h3>
              <OpenNow className="contact__open" />
              <HoursTable />
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot__inner">
          <p>
            {business.name} · {business.tagline} · {business.town}
          </p>
          <p className="foot__demo">Web de demostración: no es la web oficial del negocio.</p>
        </div>
      </footer>

      <Dock />
    </>
  );
}
