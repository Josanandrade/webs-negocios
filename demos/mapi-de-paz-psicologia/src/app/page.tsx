import { Booking } from "@/components/Booking";
import { Dock } from "@/components/Dock";
import { Masthead } from "@/components/Masthead";
import { Wash } from "@/components/Wash";
import { ages, approach, areas, business, formats, ownWords, voices } from "@/content/site";

export default function Home() {
  return (
    <>
      <Masthead />
      <main id="inicio">
        {/* Portada editorial */}
        <section className="cover">
          <p className="cover__run">
            <span>{business.role} · Bollullos de la Mitación</span>
            <span>Presencial y online</span>
          </p>
          <div className="cover__grid">
            <h1 className="cover__title">
              Acompañarte <em>con cuidado</em> en tu proceso.
            </h1>
            <figure className="cover__art">
              <Wash seed={7} />
              <figcaption>Gestalt, sistémica, arteterapia y psicodrama: recursos de un enfoque integrador.</figcaption>
            </figure>
            <div className="cover__aside">
              <p>
                Soy Mapi de Paz, psicóloga. Atiendo en mi consulta de Bollullos de la Mitación y también online: terapia
                individual, de pareja, de familia y en grupo.
              </p>
              <div className="cover__actions">
                <a href="#cita" className="btn">Pedir cita</a>
                <a href={business.phoneHref} className="link">o llamar al {business.phone}</a>
              </div>
            </div>
          </div>
        </section>

        {/* Enfoque */}
        <section id="enfoque" className="essay">
          <p className="label">Enfoque</p>
          <div className="essay__body">
            <p className="essay__lead">{approach.lead}</p>
            <div className="essay__cols">
              <p>
                Cada proceso es distinto, y por eso no trabajo con una única receta. Con {approach.experience} y una
                amplia formación en técnicas de psicoterapia, elijo con cada persona los recursos que mejor encajan con lo
                que está viviendo.
              </p>
              <p>
                Además de la consulta, soy formadora y supervisora de otros profesionales de la psicología. Estoy
                colegiada en el Colegio Oficial de la Psicología de Andalucía Occidental.
              </p>
            </div>
            <ul className="essay__tags" aria-label="Recursos terapéuticos">
              {approach.resources.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </section>

        <blockquote className="pull">
          <p>“{ownWords}”</p>
          <cite>Mapi de Paz</cite>
        </blockquote>

        {/* Formatos de sesión */}
        <section id="sesiones" className="index">
          <div className="index__head">
            <p className="label">Sesiones</p>
            <h2>Cuatro maneras de empezar</h2>
            <p className="index__note">En consulta, en Calle Larga, o por videollamada.</p>
          </div>
          <ol className="index__list">
            {formats.map((f) => (
              <li key={f.id}>
                <span className="index__num">{f.numeral}</span>
                <h3>{f.title}</h3>
                <p>{f.line}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Áreas de acompañamiento */}
        <section id="acompanamiento" className="areas">
          <Wash seed={11} className="areas__wash" />
          <div className="areas__inner">
            <p className="label">Acompañamiento</p>
            <h2>Algunas de las situaciones con las que trabajo</h2>
            <p className="areas__flow">
              {areas.map((a, i) => (
                <span key={a}>
                  {a}
                  {i < areas.length - 1 && <span className="areas__dot" aria-hidden="true"> · </span>}
                </span>
              ))}
            </p>
            <p className="areas__ages">{ages}</p>
            <p className="areas__aside">Si lo que te pasa no aparece aquí, pregunta igualmente. A veces no hace falta ponerle nombre para pedir ayuda.</p>
          </div>
        </section>

        {/* Voces */}
        <section className="voices" aria-labelledby="voces-t">
          <p className="label" id="voces-t">Lo que cuentan quienes han venido</p>
          <div className="voices__row">
            {voices.map((v) => (
              <figure key={v.who}>
                <blockquote>{v.text}</blockquote>
                <figcaption>{v.who} · reseña en Google</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Información práctica */}
        <section id="consulta" className="practical">
          <div className="practical__head">
            <p className="label">La consulta</p>
            <h2>Información práctica</h2>
          </div>
          <dl className="practical__list">
            <div>
              <dt>Dónde</dt>
              <dd>
                {business.street}
                <br />
                {business.town}
                <br />
                <a className="link" href={business.mapsHref} target="_blank" rel="noopener noreferrer">Cómo llegar</a>
              </dd>
            </div>
            <div>
              <dt>Modalidad</dt>
              <dd>Presencial en Bollullos de la Mitación u online por videollamada.</dd>
            </div>
            <div>
              <dt>Horario</dt>
              <dd>Variedad de horarios. Se acuerda al pedir cita.</dd>
            </div>
            <div>
              <dt>Idiomas</dt>
              <dd>{business.languages}</dd>
            </div>
            <div>
              <dt>Teléfono</dt>
              <dd>
                <a className="link" href={business.phoneHref}>{business.phone}</a>
              </dd>
            </div>
          </dl>
        </section>

        {/* Cita */}
        <section id="cita" className="appointment">
          <div className="appointment__intro">
            <p className="label">Pedir cita</p>
            <h2>
              Sin llamadas, <em>sin prisa.</em>
            </h2>
            <p>
              Elige el tipo de sesión, la modalidad y el hueco que mejor te venga. Solo te pediremos lo justo para
              confirmarte.
            </p>
          </div>
          <Booking />
        </section>
      </main>

      <footer className="colophon">
        <div className="colophon__grid">
          <div>
            <p className="colophon__name">Mapi de Paz</p>
            <p>Consulta de Psicología</p>
            <p>{business.street} · {business.town}</p>
          </div>
          <p className="colophon__care">
            Si estás pasando por un momento de crisis y necesitas ayuda inmediata, llama al <a href="tel:024">024</a> o al{" "}
            <a href="tel:112">112</a>.
          </p>
        </div>
        <p className="colophon__demo">Web de demostración: no es la web oficial de la consulta. Las solicitudes de cita son simuladas.</p>
      </footer>

      <Dock />
    </>
  );
}
