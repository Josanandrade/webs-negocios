import { Header } from "@/components/Header";
import { MobileBar } from "@/components/MobileBar";
import { LightPanel } from "@/components/LightPanel";
import { HoursTable, OpenStatus } from "@/components/hours";
import { business, photos, treatmentGroups } from "@/content/site";

function PhoneIcon() {
  return (
    <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M6.6 2.5H4.2A1.7 1.7 0 0 0 2.5 4.3c.3 7.1 6 12.9 13.2 13.2a1.7 1.7 0 0 0 1.8-1.7v-2.4l-3.6-1.5-1.8 1.8a10 10 0 0 1-5.8-5.8l1.8-1.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg className="icon icon--sm" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M7 4h9v9M16 4 4.5 15.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function External({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
      <ExternalIcon />
      <span className="visually-hidden"> (se abre en otra pestaña)</span>
    </a>
  );
}

const totalTreatments = treatmentGroups.reduce((n, g) => n + g.treatments.length, 0);

export default function Home() {
  const { address } = business;
  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <Header />

      <main id="contenido" tabIndex={-1}>
        {/* Portada */}
        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <div className="hero__text">
            <p className="hero__place">
              Estética en {business.neighbourhood}, {business.city}
            </p>
            <h1 id="hero-title" className="hero__title">
              <span className="line"><span>Cuidar la piel</span></span>
              <span className="line"><span>es cuestión</span></span>
              <span className="line"><span>de detalle.</span></span>
            </h1>
            <p className="hero__lead">
              Tratamientos faciales, peeling, dermaplaning, depilación con hilo, masaje y maquillaje, a un paso
              de casa en {business.neighbourhood}.
            </p>
            <div className="hero__actions" data-hero-actions>
              <a className="btn btn--accent" href="#cita">
                Pedir cita
              </a>
              <a className="btn btn--ghost" href={business.phone.href}>
                <PhoneIcon />
                {business.phone.display}
              </a>
            </div>
          </div>

          <LightPanel variant="hero" photo={photos.hero} className="hero__panel" mark="Evelyn" priority sizes="(min-width: 960px) 45vw, 100vw">
            <span className="chip">
              <OpenStatus />
            </span>
          </LightPanel>
        </section>

        {/* Índice de tratamientos */}
        <nav className="index" aria-label="Tratamientos por área">
          <ul>
            {treatmentGroups.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`}>
                  <span className="index__name">{g.title}</span>
                  <span className="index__count">
                    {g.treatments.length} {g.treatments.length === 1 ? "servicio" : "servicios"}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Tratamientos */}
        <section id="tratamientos" className="section treatments" aria-labelledby="treatments-title">
          <header className="section__head">
            <h2 id="treatments-title" className="section__title">
              Tratamientos
            </h2>
            <p className="section__lead">
              {totalTreatments} servicios en cuatro áreas. Si no sabes cuál elegir, llámanos y te orientamos antes de
              reservar.
            </p>
          </header>

          <div className="groups">
            {treatmentGroups.map((g) => (
              <article key={g.id} id={g.id} className="group" aria-labelledby={`${g.id}-title`}>
                <div className="group__head">
                  <h3 id={`${g.id}-title`} className="group__title">
                    {g.title}
                  </h3>
                  <p className="group__intro">{g.intro}</p>
                </div>
                <ul className="group__list">
                  {g.treatments.map((t) => (
                    <li key={t.name} className="treatment">
                      <h4 className="treatment__name">{t.name}</h4>
                      <p className="treatment__desc">{t.description}</p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Rostro */}
        <section className="section feature" aria-labelledby="feature-title">
          <LightPanel variant="facial" photo={photos.facial} className="feature__panel" sizes="(min-width: 960px) 50vw, 100vw" />
          <div className="feature__text">
            <h2 id="feature-title" className="section__title">
              El rostro, primero.
            </h2>
            <p>
              Seis de nuestros servicios están dedicados a la piel de la cara: limpieza con extracciones, peeling
              químico, dermaplaning, un protocolo para piel con tendencia acneica y un facial pensado para hombre.
            </p>
            <p>
              Cada piel es distinta. Si es tu primera vez, cuéntanos cómo es la tuya al reservar y te ayudamos a
              elegir por dónde empezar.
            </p>
            <a className="link" href="#facial">
              Ver tratamientos faciales
            </a>
          </div>
        </section>

        {/* Visítanos */}
        <section id="visitanos" className="section visit" aria-labelledby="visit-title">
          <header className="section__head">
            <h2 id="visit-title" className="section__title">
              Visítanos
            </h2>
            <p className="section__lead">En el corazón de {business.neighbourhood}, al norte de Sevilla.</p>
          </header>

          <div className="visit__grid">
            <div className="visit__card">
              <h3 className="visit__label">Dirección</h3>
              <address className="visit__address">
                {address.street}
                <br />
                {address.postalCode} {address.locality}
              </address>
              <div className="visit__maps">
                <External href={business.maps.google} className="link">
                  Google Maps
                </External>
                <External href={business.maps.apple} className="link">
                  Apple Maps
                </External>
              </div>

              <h3 className="visit__label">Teléfono</h3>
              <a className="visit__phone" href={business.phone.href}>
                {business.phone.display}
              </a>
            </div>

            <div className="visit__card">
              <h3 className="visit__label">Horario</h3>
              <HoursTable />
            </div>

            <LightPanel variant="space" photo={photos.space} className="visit__panel" sizes="(min-width: 960px) 33vw, 100vw" />
          </div>
        </section>

        {/* Cita */}
        <section id="cita" className="cta" aria-labelledby="cta-title">
          <h2 id="cta-title" className="cta__title">
            Reserva tu cita.
          </h2>
          <p className="cta__lead">Elige el canal que te resulte más cómodo.</p>
          <div className="cta__options">
            <External href={business.booking.href} className="option">
              <span className="option__title">En línea</span>
              <span className="option__text">Escoge tratamiento, día y hora desde el móvil.</span>
            </External>
            <a href={business.phone.href} className="option">
              <span className="option__title">Por teléfono</span>
              <span className="option__text">
                Llámanos al {business.phone.display} y resolvemos tus dudas.
              </span>
              <PhoneIcon />
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <p className="footer__brand">
            <span className="wordmark__name">Evelyn</span>
            <span className="wordmark__sub">Centro de Estética</span>
          </p>
          <p>
            {address.street}, {address.postalCode} {address.locality}
            <br />
            <a href={business.phone.href}>{business.phone.display}</a>
          </p>
          <p className="footer__legal">© {new Date().getFullYear()} {business.name}</p>
        </div>
      </footer>

      <MobileBar phoneHref={business.phone.href} />
    </>
  );
}
