import { AreaMark } from "@/components/area-mark";
import { AudienceTabs } from "@/components/audience-tabs";
import { DemoForm } from "@/components/demo-form";
import { ArrowIcon, MailIcon, PhoneIcon, PinIcon, PlusIcon } from "@/components/icons";
import { PhotoSlot } from "@/components/photo-slot";
import { SiteHeader } from "@/components/site-header";
import { StickyCall } from "@/components/sticky-call";
import { Wordmark } from "@/components/wordmark";
import { photos } from "@/lib/photos";
import { areas, faqs, primaryPhone, site, steps, team } from "@/lib/site";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export default function Home() {
  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>

      <aside className="demo-bar" aria-label="Aviso">
        <p>
          <span>Propuesta de diseño · demo privada.</span> <span>No es la web oficial del centro.</span>
        </p>
      </aside>

      <SiteHeader />

      <main id="contenido">
        {/* ───────── Hero ───────── */}
        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <div className="container hero__grid">
            <div className="hero__copy">
              <p className="eyebrow">
                {site.city} · {site.years.toLowerCase()} de trayectoria
              </p>
              <h1 id="hero-title">
                Psicología, logopedia y aprendizaje, <span className="hero__soft">bajo el mismo techo.</span>
              </h1>
              <p className="hero__lead">
                Un equipo de psicología, logopedia y pedagogía que acompaña a niños, adolescentes, adultos y
                familias. Nos cuentas qué os preocupa y te orientamos hacia quien mejor puede ayudar.
              </p>
              <div className="hero__actions">
                <a href={primaryPhone.href} className="btn btn--solid">
                  <PhoneIcon className="btn__icon" />
                  Llamar al {primaryPhone.display}
                </a>
                <a href="#primera-cita" className="btn btn--ghost">
                  Cómo es la primera cita
                </a>
              </div>
            </div>

            {/* El «plano» del centro: tres áreas y una recepción común. */}
            <nav className="plan" aria-label="Áreas del centro">
              {areas.map((a) => (
                <a key={a.id} href={`#area-${a.id}`} className={`plan__room plan__room--${a.id}`} data-area={a.id}>
                  <AreaMark area={a.id} className="plan__mark" />
                  <span className="plan__name">{a.name}</span>
                  <span className="plan__short">{a.short}</span>
                </a>
              ))}
              <a href="#contacto" className="plan__room plan__room--hall">
                <span className="plan__hall-label">Recepción</span>
                <span className="plan__hall-text">
                  {site.address.street}
                  <br />
                  {site.city}
                </span>
                <ArrowIcon className="plan__arrow" />
              </a>
            </nav>
          </div>

          <div className="container">
            <ul className="facts" aria-label="El centro en breve">
              <li>
                <strong>3 áreas</strong> psicología, logopedia y pedagogía
              </li>
              <li>
                <strong>Todas las edades</strong> infancia, adolescencia y adultos
              </li>
              <li>
                <strong>Profesionales colegiados</strong> en psicología y logopedia
              </li>
            </ul>
          </div>
        </section>

        {/* ───────── A quién ayudamos ───────── */}
        <section id="para-quien" className="section" aria-labelledby="para-quien-title">
          <div className="container">
            <header className="section__head">
              <p className="eyebrow">A quién ayudamos</p>
              <h2 id="para-quien-title">¿Para quién buscas ayuda?</h2>
              <p className="section__lead">
                Elige y te contamos qué solemos ver y qué áreas del centro pueden intervenir.
              </p>
            </header>
            <AudienceTabs />
          </div>
        </section>

        {/* ───────── Áreas ───────── */}
        <section id="areas" className="section section--stone" aria-labelledby="areas-title">
          <div className="container">
            <header className="section__head">
              <p className="eyebrow">Áreas del centro</p>
              <h2 id="areas-title">Tres áreas, un mismo equipo</h2>
              <p className="section__lead">
                Muchas dificultades no caben en una sola etiqueta: el lenguaje influye en el colegio, el colegio
                en cómo te sientes. Por eso trabajamos en el mismo sitio.
              </p>
            </header>

            <div className="areas">
              {areas.map((a) => (
                <article key={a.id} id={`area-${a.id}`} className="area reveal" data-area={a.id} aria-labelledby={`area-${a.id}-title`}>
                  <div className="area__head">
                    <AreaMark area={a.id} className="area__mark" />
                    <div>
                      <h3 id={`area-${a.id}-title`}>{a.name}</h3>
                      <p className="area__ages">{a.ages}</p>
                    </div>
                  </div>
                  <p className="area__lead">{a.lead}</p>
                  <ul className="area__topics">
                    {a.topics.map((t) => (
                      <li key={t.title}>
                        <strong>{t.title}</strong>
                        <span>{t.detail}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Por qué un centro ───────── */}
        <section className="section section--ink" aria-labelledby="porque-title">
          <div className="container why">
            <div className="why__copy">
              <p className="eyebrow eyebrow--light">Por qué un centro</p>
              <h2 id="porque-title">Una sola puerta para no ir de consulta en consulta.</h2>
              <p>
                Cuando algo preocupa, lo último que necesita una familia es averiguar sola a qué especialista acudir.
                En Abepa llamas a un único sitio, te escuchamos y te orientamos dentro del equipo.
              </p>
            </div>
            <ul className="why__list">
              <li className="reveal">
                <span className="why__num">01</span>
                <div>
                  <h3>Una entrada, varias miradas</h3>
                  <p>Psicología, logopedia y pedagogía comparten centro y forma de trabajar.</p>
                </div>
              </li>
              <li className="reveal">
                <span className="why__num">02</span>
                <div>
                  <h3>{site.years} en {site.city}</h3>
                  <p>Un centro con recorrido, cerca de casa y del colegio.</p>
                </div>
              </li>
              <li className="reveal">
                <span className="why__num">03</span>
                <div>
                  <h3>De la infancia a la edad adulta</h3>
                  <p>No hace falta cambiar de centro cuando los hijos crecen, ni venir solo por ellos.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* ───────── Primera cita ───────── */}
        <section id="primera-cita" className="section" aria-labelledby="cita-title">
          <div className="container cita">
            <header className="section__head cita__head">
              <p className="eyebrow">Primera cita</p>
              <h2 id="cita-title">Empezar es más sencillo de lo que parece</h2>
              <p className="section__lead">
                No necesitas tener claro el problema ni traer un diagnóstico. Solo ganas de entender qué pasa.
              </p>
              <PhotoSlot photo={photos.sala} label="una sala del centro" className="cita__photo" sizes="(min-width: 60em) 40vw, 100vw" />
            </header>

            <ol className="steps">
              {steps.map((s, i) => (
                <li key={s.title} className="step reveal">
                  <span className="step__num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
              <li className="step step--cta">
                <a href={primaryPhone.href} className="btn btn--solid">
                  <PhoneIcon className="btn__icon" />
                  Llamar para pedir cita
                </a>
                <a href="#contacto" className="link-arrow">
                  O déjanos tu teléfono <ArrowIcon className="link-arrow__icon" />
                </a>
              </li>
            </ol>
          </div>
        </section>

        {/* ───────── Equipo ───────── */}
        <section id="equipo" className="section section--stone" aria-labelledby="equipo-title">
          <div className="container">
            <header className="section__head">
              <p className="eyebrow">Equipo</p>
              <h2 id="equipo-title">Las personas que vas a conocer</h2>
              <p className="section__lead">
                Un equipo pequeño, de los que se saben tu nombre. Cada área tiene su profesional de referencia.
              </p>
            </header>

            <ul className="team">
              {team.map((p) => {
                const area = areas.find((a) => a.id === p.area)!;
                return (
                  <li key={p.name} className="person reveal" data-area={p.area}>
                    <span className="person__avatar" aria-hidden="true">
                      {initials(p.name)}
                    </span>
                    <div>
                      <h3>{p.name}</h3>
                      <p className="person__role">{p.role}</p>
                      <p className="person__area">
                        <AreaMark area={p.area} className="person__mark" />
                        {area.name}
                      </p>
                    </div>
                  </li>
                );
              })}
              <li className="team__photo">
                <PhotoSlot photo={photos.centro} label="el equipo en el centro" sizes="(min-width: 60em) 33vw, 100vw" />
              </li>
            </ul>
          </div>
        </section>

        {/* ───────── Confianza ───────── */}
        <section className="section" aria-labelledby="confianza-title">
          <div className="container trust">
            <header className="section__head">
              <p className="eyebrow">Confianza</p>
              <h2 id="confianza-title">Un centro con recorrido en Tomares</h2>
            </header>
            <div className="trust__grid">
              <figure className="trust__stat">
                <strong>+20</strong>
                <figcaption>años atendiendo en {site.city}</figcaption>
              </figure>
              <figure className="trust__stat">
                <strong>5</strong>
                <figcaption>profesionales en tres áreas</figcaption>
              </figure>
              <div className="trust__reserved">
                <p className="trust__reserved-tag">Espacio reservado · demo</p>
                <p>
                  Aquí irían 2 o 3 opiniones reales de familias y pacientes, enlazadas a la ficha de Google, con su
                  permiso. No mostramos reseñas inventadas ni copiadas de directorios.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Preguntas ───────── */}
        <section id="preguntas" className="section section--stone" aria-labelledby="preguntas-title">
          <div className="container faq">
            <header className="section__head">
              <p className="eyebrow">Preguntas frecuentes</p>
              <h2 id="preguntas-title">Dudas habituales antes de llamar</h2>
            </header>
            <div className="faq__list">
              {faqs.map((f) => (
                <details key={f.q} className="faq__item">
                  <summary>
                    <span>{f.q}</span>
                    <PlusIcon className="faq__icon" />
                  </summary>
                  <div className="faq__answer">
                    <p>{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Contacto ───────── */}
        <section id="contacto" className="section contact" aria-labelledby="contacto-title">
          <div className="container contact__grid">
            <div className="contact__info">
              <p className="eyebrow">Contacto</p>
              <h2 id="contacto-title">Pide tu primera cita</h2>
              <p className="section__lead">
                La forma más rápida es llamar. Si no puedes hablar ahora, escríbenos y te devolvemos la llamada.
              </p>

              <ul className="contact__list">
                {site.phones.map((p) => (
                  <li key={p.href}>
                    <PhoneIcon className="contact__icon" />
                    <div>
                      <span className="contact__label">{p.label}</span>
                      <a href={p.href}>{p.display}</a>
                    </div>
                  </li>
                ))}
                <li>
                  <MailIcon className="contact__icon" />
                  <div>
                    <span className="contact__label">Correo</span>
                    <a href={`mailto:${site.email}`}>{site.email}</a>
                  </div>
                </li>
                <li>
                  <PinIcon className="contact__icon" />
                  <div>
                    <span className="contact__label">Dirección</span>
                    <a href={site.mapsHref} target="_blank" rel="noopener noreferrer nofollow">
                      {site.address.street}, {site.address.postalCode} {site.address.locality}
                      <span className="visually-hidden"> (abre Google Maps en otra pestaña)</span>
                    </a>
                  </div>
                </li>
              </ul>

              <p className="contact__hours">
                <strong>Horario:</strong> de lunes a viernes. <span className="demo-inline">Franjas exactas pendientes de confirmar con el centro.</span>
              </p>
            </div>

            <DemoForm />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__grid">
          <Wordmark inverted />
          <p>
            {site.legalName}
            <br />
            {site.address.street} · {site.address.postalCode} {site.address.locality}
          </p>
          <p className="footer__demo">
            Propuesta de diseño privada y no solicitada, preparada como demostración. No es la web oficial del centro
            ni recoge datos. Textos redactados para la demo a partir de información pública; pendientes de revisión
            por el centro.
          </p>
        </div>
      </footer>

      <StickyCall />
    </>
  );
}
