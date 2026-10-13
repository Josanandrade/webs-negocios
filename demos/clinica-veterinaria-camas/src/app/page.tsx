import { Dock } from "@/components/Dock";
import { HoursTable } from "@/components/HoursTable";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { OpenStatus } from "@/components/OpenStatus";
import { Photo } from "@/components/Photo";
import { WhatsAppComposer } from "@/components/WhatsAppComposer";
import { areas, clinic, everyday, faqs, firstVisit, whatsappHref, whenToCome } from "@/content/clinic";

const nav = [
  { href: "#servicios", label: "Servicios" },
  { href: "#primera-visita", label: "Primera visita" },
  { href: "#equipo", label: "La clínica" },
  { href: "#contacto", label: "Horario y contacto" },
];

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">
        Saltar al contenido
      </a>

      <header className="header">
        <div className="header__inner">
          <a href="#inicio" className="header__brand" aria-label="Clínica Veterinaria Camas, inicio">
            <Logo />
          </a>
          <nav className="header__nav" aria-label="Principal">
            {nav.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <a className="btn btn--primary btn--sm header__call" href={clinic.phone.href}>
            <Icon name="phone" />
            <span className="header__call-label">{clinic.phone.label}</span>
            <span className="sr-only header__call-sr">Llamar</span>
          </a>
        </div>
      </header>

      <main id="main">
        {/* ---------- Hero ---------- */}
        <section id="inicio" className="hero">
          <div className="wrap hero__grid">
            <div className="hero__copy">
              <p className="eyebrow hero__in" style={{ "--i": 0 } as React.CSSProperties}>
                Clínica veterinaria · Camas, Sevilla
              </p>
              <h1 className="hero__title hero__in" style={{ "--i": 1 } as React.CSSProperties}>
                Cuidamos de tu perro y de tu gato <span className="mark">aquí, en Camas.</span>
              </h1>
              <p className="hero__lead hero__in" style={{ "--i": 2 } as React.CSSProperties}>
                Consulta, vacunas, cirugía, especialidades y peluquería en la calle Santa Paula. Te
                escuchamos, te explicamos cada paso y estamos a una llamada.
              </p>
              <div className="hero__ctas hero__in" style={{ "--i": 3 } as React.CSSProperties}>
                <a className="btn btn--primary btn--lg" href={clinic.phone.href}>
                  <Icon name="phone" />
                  Llamar al {clinic.phone.label}
                </a>
                <a
                  className="btn btn--ghost btn--lg"
                  href={whatsappHref("Hola, quería pedir cita.")}
                  {...ext}
                >
                  <Icon name="whatsapp" />
                  Cita por WhatsApp
                </a>
              </div>
              <div className="hero__meta hero__in" style={{ "--i": 4 } as React.CSSProperties}>
                <OpenStatus />
                <a className="hero__addr" href={clinic.maps} {...ext}>
                  <Icon name="pin" />
                  {clinic.address.street}, {clinic.address.city}
                </a>
              </div>
            </div>

            <div className="hero__visual hero__in" style={{ "--i": 2 } as React.CSSProperties}>
              <Photo slot="hero" eager sizes="(min-width: 960px) 44vw, 92vw" className="hero__photo" />
              <div className="float float--rating">
                <span className="float__stars" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Icon key={i} name="star" />
                  ))}
                </span>
                <p>
                  <strong>{clinic.rating.value} en Google</strong>
                  <span>{clinic.rating.count} opiniones</span>
                </p>
              </div>
              <div className="float float--care">
                <span className="float__icon" aria-hidden="true">
                  <Icon name="plus" />
                </span>
                <p>
                  <strong>Perros y gatos</strong>
                  <span>Medicina, cirugía y peluquería</span>
                </p>
              </div>
            </div>
          </div>

          <div className="wrap">
            <ul className="facts" aria-label="Datos rápidos">
              <li>
                <a className="fact" href="#contacto">
                  <Icon name="clock" />
                  <span>
                    <strong>Horario</strong>
                    L–V 10:00–13:30 · 17:00–20:00
                    <br />
                    Sábados 10:00–13:00
                  </span>
                </a>
              </li>
              <li>
                <a className="fact" href={clinic.maps} {...ext}>
                  <Icon name="pin" />
                  <span>
                    <strong>Dónde estamos</strong>
                    {clinic.address.street} · {clinic.address.postal} {clinic.address.city}
                  </span>
                </a>
              </li>
              <li>
                <a className="fact" href={clinic.phone.href}>
                  <Icon name="phone" />
                  <span>
                    <strong>Teléfono</strong>
                    {clinic.phone.label} · WhatsApp {clinic.whatsapp.label}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* ---------- Servicios ---------- */}
        <section id="servicios" className="section" aria-labelledby="servicios-title">
          <div className="wrap">
            <header className="section__head" data-reveal>
              <p className="eyebrow">Servicios</p>
              <h2 id="servicios-title" className="section__title">
                Todo lo que necesita, en un mismo sitio.
              </h2>
              <p className="section__lead">
                Desde la primera vacuna hasta una cirugía, con el mismo equipo que ya conoce su historia.
              </p>
            </header>

            <div className="services">
              <div className="services__everyday">
                <h3 className="services__label" data-reveal>
                  Día a día
                </h3>
                <ul className="cards">
                  {everyday.map((s, i) => (
                    <li key={s.id} className="card" data-reveal style={{ "--d": i } as React.CSSProperties}>
                      <span className="card__num" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h4 className="card__title">{s.title}</h4>
                      <p>{s.text}</p>
                    </li>
                  ))}
                </ul>
                <div className="services__photos" data-reveal>
                  <Photo slot="consulta" sizes="(min-width: 960px) 22vw, 46vw" />
                  <Photo slot="peluqueria" sizes="(min-width: 960px) 22vw, 46vw" />
                </div>
              </div>

              <div className="services__areas" data-reveal>
                <h3 className="services__label services__label--light">Consultas por área</h3>
                <ul className="areas">
                  {areas.map((a) => (
                    <li key={a.id} className="area">
                      <h4 className="area__title">{a.title}</h4>
                      <p>{a.text}</p>
                      {a.points ? (
                        <ul className="area__points" aria-label={`Pruebas de ${a.title.toLowerCase()}`}>
                          {a.points.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <a className="btn btn--sun btn--block" href={clinic.phone.href}>
                  <Icon name="phone" />
                  Consultar por un caso concreto
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Cuándo venir ---------- */}
        <section id="cuando" className="section section--tint" aria-labelledby="cuando-title">
          <div className="wrap">
            <header className="section__head" data-reveal>
              <p className="eyebrow">Cuándo venir</p>
              <h2 id="cuando-title" className="section__title">
                ¿Le notas algo distinto? Mejor míralo pronto.
              </h2>
              <p className="section__lead">
                Los animales disimulan bien las molestias. Estas son señales por las que merece la pena pedir
                cita, sin alarmarse.
              </p>
            </header>

            <ul className="signs">
              {whenToCome.map((s, i) => (
                <li
                  key={s.title}
                  className="sign"
                  data-reveal
                  style={{ "--d": i % 3 } as React.CSSProperties}
                >
                  <span className="sign__check" aria-hidden="true">
                    <Icon name="check" />
                  </span>
                  <div>
                    <h3 className="sign__title">{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="urgent" data-reveal>
              <div className="urgent__icon" aria-hidden="true">
                <Icon name="alert" />
              </div>
              <div className="urgent__body">
                <h3>Si crees que es urgente, llama sin esperar</h3>
                <p>
                  Dificultad para respirar, un golpe o atropello, convulsiones, sangrado que no para o si ha
                  comido algo tóxico. En horario de clínica, llámanos y te decimos cómo actuar. Fuera de
                  horario, acude a un servicio de urgencias veterinarias 24 horas.
                </p>
              </div>
              <a className="btn btn--white" href={clinic.phone.href}>
                <Icon name="phone" />
                {clinic.phone.label}
              </a>
            </div>

            <p className="tip" data-reveal>
              <Icon name="sun" />
              <span>
                <strong>En verano, ojo con el calor.</strong> Paseos a primera hora o al caer la tarde, agua
                siempre a mano y nunca dentro del coche, ni un momento.
              </span>
            </p>
          </div>
        </section>

        {/* ---------- Primera visita ---------- */}
        <section id="primera-visita" className="section" aria-labelledby="visita-title">
          <div className="wrap visit">
            <header className="section__head visit__head" data-reveal>
              <p className="eyebrow">Primera visita</p>
              <h2 id="visita-title" className="section__title">
                Venir por primera vez es fácil.
              </h2>
              <p className="section__lead">
                Si es tu primera vez con nosotros, así será. Sin prisas y con todas las preguntas que quieras
                hacer.
              </p>
              <div className="puppy" data-reveal>
                <p className="puppy__tag">¿Cachorro o gatito nuevo?</p>
                <p>
                  En su primera revisión le exploramos a fondo, empezamos su plan de vacunas y desparasitación
                  y te aconsejamos sobre alimentación y educación básica.
                </p>
              </div>
            </header>

            <ol className="steps">
              {firstVisit.map((s, i) => (
                <li key={s.title} className="step" data-reveal style={{ "--d": i } as React.CSSProperties}>
                  <span className="step__num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="step__title">{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- La clínica / equipo ---------- */}
        <section id="equipo" className="section section--ink" aria-labelledby="equipo-title">
          <div className="wrap team">
            <div className="team__photo" data-reveal>
              <Photo slot="equipo" sizes="(min-width: 960px) 50vw, 92vw" />
            </div>
            <div className="team__copy" data-reveal>
              <p className="eyebrow eyebrow--light">La clínica</p>
              <h2 id="equipo-title" className="section__title">
                Cercanos, tranquilos y con mano para los nerviosos.
              </h2>
              <p>
                Somos una clínica veterinaria en pleno Camas. Nos gusta conocer a cada paciente por su nombre,
                saber cómo es en casa y explicarte las cosas sin tecnicismos, para que decidas con toda la
                información.
              </p>
              <p>
                Además de la medicina del día a día, el equipo tiene amplia experiencia en comportamiento
                animal. Se nota en algo muy concreto: en cómo tratamos a los que llegan con miedo.
              </p>
              <ul className="values">
                <li>
                  <Icon name="check" />
                  Tiempo para escucharte
                </li>
                <li>
                  <Icon name="check" />
                  Opciones claras, sin sorpresas
                </li>
                <li>
                  <Icon name="check" />
                  Trato suave en cada visita
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- Opiniones ---------- */}
        <section className="section" aria-labelledby="opiniones-title">
          <div className="wrap reviews">
            <div className="reviews__score" data-reveal>
              <p className="eyebrow">Opiniones</p>
              <h2 id="opiniones-title" className="reviews__big">
                {clinic.rating.value}
                <span>/5</span>
              </h2>
              <p className="reviews__stars" role="img" aria-label={`${clinic.rating.value} de 5 estrellas`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Icon key={i} name="star" />
                ))}
              </p>
              <p className="reviews__count">
                Valoración en Google, con {clinic.rating.count} opiniones de familias de Camas y alrededores.
              </p>
              <a className="link-arrow" href={clinic.maps} {...ext}>
                Leer las opiniones en Google
                <Icon name="arrow" />
              </a>
            </div>
            <div className="reviews__themes">
              <h3 className="services__label" data-reveal>
                Lo que más se repite
              </h3>
              <ul className="themes">
                <li className="theme" data-reveal style={{ "--d": 0 } as React.CSSProperties}>
                  <h4>Trato cercano y cariñoso</h4>
                  <p>Con los animales y con las personas que los traen, también cuando están preocupadas.</p>
                </li>
                <li className="theme" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
                  <h4>Profesionalidad</h4>
                  <p>
                    En consultas y en intervenciones como las esterilizaciones, resolviendo dudas antes y
                    después.
                  </p>
                </li>
                <li className="theme" data-reveal style={{ "--d": 2 } as React.CSSProperties}>
                  <h4>Atención cuando hace falta</h4>
                  <p>Familias que destacan haber sido atendidas el mismo día al ver a su animal mal.</p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- Preguntas ---------- */}
        <section className="section section--tint" aria-labelledby="faq-title">
          <div className="wrap faq">
            <header className="section__head" data-reveal>
              <p className="eyebrow">Preguntas frecuentes</p>
              <h2 id="faq-title" className="section__title">
                Lo que suele preguntarse antes de venir.
              </h2>
            </header>
            <div className="faq__list" data-reveal>
              {faqs.map((f) => (
                <details key={f.q} className="faq__item">
                  <summary>
                    <span>{f.q}</span>
                    <span className="faq__icon" aria-hidden="true">
                      <Icon name="plus" />
                    </span>
                  </summary>
                  <div className="faq__answer">
                    <p>{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Horario y contacto ---------- */}
        <section id="contacto" className="section" aria-labelledby="contacto-title">
          <div className="wrap">
            <header className="section__head" data-reveal>
              <p className="eyebrow">Horario y contacto</p>
              <h2 id="contacto-title" className="section__title">
                Te esperamos en la calle Santa Paula.
              </h2>
            </header>

            <div className="contact">
              <div className="contact__info" data-reveal>
                <div className="panel">
                  <div className="panel__row">
                    <h3 className="panel__title">Horario</h3>
                    <OpenStatus className="status--sm" />
                  </div>
                  <HoursTable />
                  <p className="panel__note">Te recomendamos pedir cita antes de venir.</p>
                </div>

                <div className="panel panel--place">
                  <Photo slot="fachada" sizes="(min-width: 960px) 30vw, 92vw" className="panel__photo" />
                  <address className="place">
                    <strong>{clinic.name}</strong>
                    {clinic.address.street}
                    <br />
                    {clinic.address.postal} {clinic.address.city}, {clinic.address.province}
                  </address>
                  <div className="place__actions">
                    <a className="btn btn--primary" href={clinic.maps} {...ext}>
                      <Icon name="pin" />
                      Google Maps
                    </a>
                    <a className="btn btn--ghost" href={clinic.appleMaps} {...ext}>
                      Apple Maps
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact__book" data-reveal>
                <div className="panel panel--book">
                  <h3 className="panel__title">Pide cita</h3>
                  <div className="lines">
                    <a className="line" href={clinic.phone.href}>
                      <span className="line__icon" aria-hidden="true">
                        <Icon name="phone" />
                      </span>
                      <span>
                        <span className="line__label">Teléfono</span>
                        <strong>{clinic.phone.label}</strong>
                      </span>
                      <Icon name="arrow" className="icon line__arrow" />
                    </a>
                    <a className="line" href={whatsappHref()} {...ext}>
                      <span className="line__icon line__icon--wa" aria-hidden="true">
                        <Icon name="whatsapp" />
                      </span>
                      <span>
                        <span className="line__label">WhatsApp · cita previa</span>
                        <strong>{clinic.whatsapp.label}</strong>
                      </span>
                      <Icon name="arrow" className="icon line__arrow" />
                    </a>
                  </div>
                  <div className="divider">
                    <span>o prepara tu mensaje</span>
                  </div>
                  <WhatsAppComposer />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer__inner">
          <div className="footer__brand">
            <Logo />
            <p>
              {clinic.address.street} · {clinic.address.postal} {clinic.address.city} (Sevilla)
              <br />
              <a href={clinic.phone.href}>{clinic.phone.label}</a> · WhatsApp{" "}
              <a href={whatsappHref()} {...ext}>
                {clinic.whatsapp.label}
              </a>
            </p>
          </div>
          <div className="footer__social">
            <a href={clinic.instagram} {...ext} aria-label="Instagram de Clínica Veterinaria Camas">
              <Icon name="instagram" />
            </a>
            <a href={clinic.facebook} {...ext} aria-label="Facebook de Clínica Veterinaria Camas">
              <Icon name="facebook" />
            </a>
          </div>
        </div>
        <div className="wrap">
          <p className="footer__demo">
            Diseño de demostración. No es la web oficial de la clínica. Sin cookies ni analítica.
          </p>
        </div>
      </footer>

      <Dock />
    </>
  );
}
