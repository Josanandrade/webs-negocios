import { Arch } from "@/components/arch";
import { DemoForm } from "@/components/demo-form";
import { SiteHeader } from "@/components/site-header";
import { PhoneIcon, StickyCall } from "@/components/sticky-call";
import { site } from "@/lib/site";

const moments = [
  {
    title: "Cuando algo pesa más de lo que te gustaría",
    text: "Una etapa difícil, una preocupación que no se va, un cambio que todavía no sabes cómo colocar.",
  },
  {
    title: "Cuando quieres entenderte mejor",
    text: "Reacciones que se repiten, decisiones que cuestan, la sensación de no estar del todo bien sin saber explicar por qué.",
  },
  {
    title: "Cuando necesitas un lugar neutral para pensar",
    text: "Fuera de tu entorno, sin opiniones interesadas, con alguien que escucha con atención profesional.",
  },
];

const steps = [
  {
    title: "Llamas para pedir cita",
    text: `En el ${site.phone.display}. Basta con decir que quieres una primera cita: no tienes que explicar el motivo por teléfono.`,
  },
  {
    title: "Una primera sesión para conoceros",
    text: "Cuentas lo que te trae, a tu ritmo y hasta donde quieras. Es también el momento de preguntar cómo se trabaja.",
  },
  {
    title: "Decidir cómo seguir",
    text: "Con lo hablado, se valora conjuntamente si tiene sentido continuar y de qué manera.",
  },
];

const principles = [
  {
    title: "Confidencialidad",
    text: "Lo que se habla en consulta queda protegido por el secreto profesional.",
  },
  {
    title: "Tu ritmo",
    text: "No hay que contarlo todo el primer día. Se avanza a la velocidad que puedas sostener.",
  },
  {
    title: "Claridad",
    text: "Saber cómo se va a trabajar y poder preguntarlo siempre que lo necesites.",
  },
];

const faqs = [
  {
    q: "¿Necesito saber qué me pasa antes de pedir cita?",
    a: "No. Muchas personas llegan sin saber ponerle nombre a lo que sienten. Entenderlo es, precisamente, parte del trabajo de las primeras sesiones.",
  },
  {
    q: "¿Qué tengo que contar al llamar?",
    a: "Solo tu nombre y que quieres una primera cita. Lo demás, si quieres, lo hablas ya en consulta.",
  },
  {
    q: "¿Lo que cuento es confidencial?",
    a: "Sí. La psicóloga está sujeta al secreto profesional. Si tienes dudas concretas sobre la confidencialidad, puedes preguntarlas en la primera sesión.",
  },
  {
    q: "¿Cuánto dura una sesión y qué precio tiene?",
    a: "Te lo explicará Maqui al pedir cita, para que lo sepas con claridad antes de empezar.",
  },
  {
    q: "¿Hay otras modalidades además de la consulta presencial?",
    a: "Pregúntalo al llamar y te informará de las opciones disponibles.",
  },
];

export default function Home() {
  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>

      <aside className="demo-bar" aria-label="Aviso de demo">
        <div className="container demo-bar__inner">
          <span className="demo-bar__tag">Demo privada</span>
          <span>
            Propuesta de web para {site.name}. No es su web oficial ni está publicada.
          </span>
        </div>
      </aside>

      <SiteHeader />

      <main id="contenido">
        {/* ——— Inicio ——— */}
        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <div className="container hero__grid">
            <div className="hero__text">
              <p className="eyebrow">
                {site.role} en {site.city}, {site.province}
              </p>
              <h1 id="hero-title" className="hero__title">
                Un lugar tranquilo para hablar de <em>lo que te está pasando.</em>
              </h1>
              <p className="hero__lead">
                Consulta de psicología de {site.name}. Un espacio confidencial, sin prisas, para entender qué ocurre y
                empezar a trabajarlo.
              </p>
              <div className="hero__actions">
                <a href={site.phone.href} className="btn">
                  <PhoneIcon /> Llamar para pedir cita
                </a>
                <a href="#primera-cita" className="btn btn--ghost">
                  Cómo es la primera cita
                </a>
              </div>
              <p className="hero__meta">
                <span>{site.address.street}</span>
                <span aria-hidden="true">·</span>
                <span>{site.address.locality}</span>
              </p>
            </div>
            <div className="hero__visual">
              <Arch />
              <p className="hero__caption">
                <span className="hero__caption-line" aria-hidden="true" />
                Consulta en {site.city}
              </p>
            </div>
          </div>
        </section>

        {/* ——— Acompañamiento ——— */}
        <section id="acompanamiento" className="section" aria-labelledby="acomp-title">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">Acompañamiento psicológico</p>
              <h2 id="acomp-title" className="section__title">
                Un espacio para comprender qué está pasando <em>y empezar a trabajarlo.</em>
              </h2>
            </div>
            <ol className="moments">
              {moments.map((m, i) => (
                <li key={m.title} className="moment">
                  <span className="moment__num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="moment__title">{m.title}</h3>
                  <p className="moment__text">{m.text}</p>
                </li>
              ))}
            </ol>
            <p className="aside-note">
              No hace falta ponerle nombre a lo que te pasa para pedir cita. Para eso está también la primera
              conversación.
            </p>
          </div>
        </section>

        {/* ——— Primera cita ——— */}
        <section id="primera-cita" className="section section--sand" aria-labelledby="cita-title">
          <div className="container split">
            <div className="split__aside">
              <p className="eyebrow">Primera cita</p>
              <h2 id="cita-title" className="section__title">
                Empezar es <em>más sencillo</em> de lo que parece.
              </h2>
              <a href={site.phone.href} className="btn btn--ghost split__cta">
                <PhoneIcon /> {site.phone.display}
              </a>
            </div>
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={s.title} className="step">
                  <span className="step__num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="step__title">{s.title}</h3>
                    <p className="step__text">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ——— Sobre Maqui ——— */}
        <section id="sobre" className="section" aria-labelledby="sobre-title">
          <div className="container split">
            <div className="split__aside">
              <p className="eyebrow">Sobre Maqui</p>
              <h2 id="sobre-title" className="section__title">
                {site.name}
              </h2>
              <p className="about__lead">
                Psicóloga. Atiende en su consulta de {site.city}, en la calle Luis Ortega Bru.
              </p>
            </div>
            <div>
              <ul className="principles">
                {principles.map((p) => (
                  <li key={p.title} className="principle">
                    <h3 className="principle__title">{p.title}</h3>
                    <p>{p.text}</p>
                  </li>
                ))}
              </ul>
              <aside className="demo-note" aria-label="Nota de la demo">
                <p className="demo-note__tag">Espacio reservado</p>
                <p>
                  En la versión definitiva, Maqui contará aquí con sus propias palabras su formación, su número de
                  colegiada y su forma de trabajar, junto a su retrato. No hemos querido inventar ninguno de esos datos.
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* ——— La consulta ——— */}
        <section id="consulta" className="section section--sand" aria-labelledby="consulta-title">
          <div className="container">
            <div className="section__head">
              <p className="eyebrow">La consulta</p>
              <h2 id="consulta-title" className="section__title">
                En {site.city}, <em>con cita previa.</em>
              </h2>
            </div>
            <div className="place">
              <dl className="place__facts">
                <div>
                  <dt>Dirección</dt>
                  <dd>
                    {site.address.street}
                    <br />
                    {site.address.postalCode} {site.address.locality}
                  </dd>
                </div>
                <div>
                  <dt>Teléfono</dt>
                  <dd>
                    <a href={site.phone.href}>{site.phone.display}</a>
                  </dd>
                </div>
                <div>
                  <dt>Modalidad</dt>
                  <dd>Sesiones en la consulta. Si necesitas otra opción, pregúntalo al llamar.</dd>
                </div>
              </dl>
              <div className="place__card">
                <p className="place__town" aria-hidden="true">
                  Dos
                  <br />
                  Hermanas
                </p>
                <a href={site.mapsHref} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                  Cómo llegar <span className="visually-hidden">(se abre Google Maps en otra pestaña)</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ——— Preguntas ——— */}
        <section id="preguntas" className="section" aria-labelledby="faq-title">
          <div className="container split">
            <div className="split__aside">
              <p className="eyebrow">Preguntas frecuentes</p>
              <h2 id="faq-title" className="section__title">
                Antes de <em>llamar.</em>
              </h2>
            </div>
            <div className="faq">
              {faqs.map((f) => (
                <details key={f.q} className="faq__item">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ——— Contacto ——— */}
        <section id="contacto" className="contact" aria-labelledby="contacto-title">
          <div className="container contact__grid">
            <div>
              <p className="eyebrow eyebrow--light">Pedir cita</p>
              <h2 id="contacto-title" className="contact__title">
                Cuando quieras, se empieza <em>por una conversación.</em>
              </h2>
              <a href={site.phone.href} className="contact__phone">
                <span className="contact__phone-label">Llamar</span>
                {site.phone.display}
              </a>
              <p className="contact__address">
                {site.address.street} · {site.address.postalCode} {site.address.locality}
              </p>
            </div>
            <DemoForm />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__grid">
          <div>
            <p className="footer__name">{site.name}</p>
            <p>
              {site.role} · {site.address.street}, {site.address.postalCode} {site.address.locality}
            </p>
          </div>
          <p className="footer__care">
            Esta consulta no es un servicio de urgencias. Si estás en peligro, llama al <a href="tel:112">112</a>. Si
            tienes pensamientos de suicidio, la <a href="tel:024">Línea 024</a> atiende gratis las 24 horas.
          </p>
          <p className="footer__demo">
            Demo privada preparada como propuesta. Sin analítica, sin cookies y sin envío de datos. Textos legales y
            datos de colegiación pendientes de completar con la profesional.
          </p>
        </div>
      </footer>

      <StickyCall />
    </>
  );
}
