import Booking from "@/components/Booking";
import Faq from "@/components/Faq";
import { business, nav } from "@/content/site";

export default function Home() {
  return (
    <>
      <header className="top">
        <div className="wrap top__inner">
          <a href="#inicio" className="mark" aria-label={`${business.brand}, inicio`}>
            <span className="mark__name">{business.name}</span>
            <span className="mark__bar" aria-hidden="true" />
            <span className="mark__disc">{business.discipline}</span>
          </a>
          <nav className="top__nav" aria-label="Secciones">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <a href="#cita" className="btn btn--small">
            Pedir cita
          </a>
        </div>
      </header>

      <main id="inicio">
        {/* PORTADA: el nombre manda; a la derecha, la lámina de retrato */}
        <section className="hero">
          <div className="wrap hero__grid">
            <div className="hero__text">
              <p className="kicker">
                Psicología <span aria-hidden="true">·</span> {business.town}, {business.province}
              </p>
              <h1 className="hero__title">
                <span className="hero__first">Pablo</span>
                <span className="hero__last">San Juan</span>
              </h1>
              <p className="hero__lede">
                Una consulta de psicología con nombre propio en {business.town}. Aquí puedes saber con quién vas a
                hablar, cómo es el proceso y <mark>pedir tu cita eligiendo día y hora</mark>, sin intercambiar
                mensajes para encontrar un hueco.
              </p>
              <div className="hero__actions">
                <a href="#cita" className="btn">
                  Elegir día y hora
                </a>
                <a href={business.phoneHref} className="link-call">
                  o llama al <strong>{business.phoneDisplay}</strong>
                </a>
              </div>
            </div>

            <figure className="plate" aria-label={`${business.name}, ${business.discipline}`}>
              <div className="plate__field" aria-hidden="true">
                <span className="plate__glyph">P</span>
                <span className="plate__glyph plate__glyph--sj">SJ</span>
              </div>
              <figcaption className="plate__caption">
                <span>{business.name}</span>
                <span>
                  {business.discipline} · {business.town}
                </span>
              </figcaption>
              <p className="plate__vertical" aria-hidden="true">
                {business.town} — {business.province}
              </p>
            </figure>
          </div>
        </section>

        {/* PRESENTACIÓN */}
        <section className="intro" id="pablo" aria-labelledby="pablo-t">
          <div className="wrap intro__grid">
            <p className="label">Pablo</p>
            <div className="intro__body">
              <h2 id="pablo-t" className="pull">
                Antes de contar nada, ayuda saber <em>con quién</em> vas a hablar.
              </h2>
              <div className="intro__cols">
                <p>
                  {business.name} atiende su consulta de psicología en {business.town} ({business.province}). Esta
                  página es su sitio propio: sin directorios de por medio, sin anuncios alrededor, con lo necesario
                  para conocerle y dar el primer paso con calma.
                </p>
                <p>
                  Aquí no hay promesas ni listas interminables. Hay una persona, una forma clara de pedir cita y un
                  teléfono al que llamar si prefieres hablar antes de decidir.
                </p>
              </div>
              <dl className="sheet">
                <div>
                  <dt>Quién te atiende</dt>
                  <dd>{business.name}</dd>
                </div>
                <div>
                  <dt>Disciplina</dt>
                  <dd>{business.discipline}</dd>
                </div>
                <div>
                  <dt>Consulta</dt>
                  <dd>
                    {business.town}, {business.province}
                  </dd>
                </div>
                <div>
                  <dt>Teléfono</dt>
                  <dd>
                    <a href={business.phoneHref}>{business.phoneDisplay}</a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* FORMA DE TRABAJAR: el recorrido práctico, no técnicas */}
        <section className="path" id="forma" aria-labelledby="forma-t">
          <div className="wrap">
            <div className="path__head">
              <p className="label">Cómo trabaja</p>
              <h2 id="forma-t" className="h2">
                Del primer contacto a la primera conversación, <em>sin rodeos</em>.
              </h2>
            </div>
            <ol className="path__line">
              <li>
                <span className="path__n">uno</span>
                <h3>Eliges un hueco</h3>
                <p>
                  Ves los días y horas disponibles y marcas el que mejor te encaja. Sin llamadas de ida y vuelta para
                  cuadrar agendas.
                </p>
              </li>
              <li>
                <span className="path__n">dos</span>
                <h3>Pablo te confirma</h3>
                <p>
                  Revisa tu solicitud y te llama para confirmarla. Es el momento de resolver cualquier duda práctica
                  antes de ir.
                </p>
              </li>
              <li>
                <span className="path__n">tres</span>
                <h3>Primera conversación</h3>
                <p>
                  En la primera cita hablas de lo que te ha llevado a pedirla, a tu ritmo, y resuelves tus dudas
                  sobre cómo continuar.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <Booking />

        {/* UBICACIÓN */}
        <section className="where" id="donde" aria-labelledby="donde-t">
          <div className="wrap where__grid">
            <div>
              <p className="label label--light">Dónde</p>
              <h2 id="donde-t" className="where__town">
                {business.town}
                <span>{business.province}</span>
              </h2>
            </div>
            <div className="where__info">
              <p>
                La consulta está en {business.town}. Al confirmar tu cita por teléfono, Pablo te indica la dirección y
                cómo llegar.
              </p>
              <div className="where__actions">
                <a href={business.phoneHref} className="btn btn--light">
                  Llamar al {business.phoneDisplay}
                </a>
                <a href={business.mapsHref} className="link-light" target="_blank" rel="noopener noreferrer">
                  Ver {business.town} en el mapa ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        <Faq />
      </main>

      <footer className="foot">
        <div className="wrap">
          <p className="foot__brand">
            {business.name}
            <span>{business.discipline}</span>
          </p>
          <div className="foot__row">
            <p>
              {business.town}, {business.province} · <a href={business.phoneHref}>{business.phoneDisplay}</a>
            </p>
            <p className="foot__note">
              Web de demostración. El formulario de cita es una simulación: no envía, no reserva y no guarda ningún
              dato.
            </p>
          </div>
        </div>
      </footer>

      <div className="dock" role="navigation" aria-label="Acciones rápidas">
        <a href={business.phoneHref}>Llamar</a>
        <a href="#cita" className="dock__main">
          Pedir cita
        </a>
      </div>
    </>
  );
}
