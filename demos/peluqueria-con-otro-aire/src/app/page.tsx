const phoneDisplay = "955 71 75 67";
const phone = "+34955717567";
const maps = "https://www.google.com/maps/search/?api=1&query=Peluquer%C3%ADa%20Con%20Otro%20Aire%20Umbrete";

const services = [
  { n: "01", title: "Corte", sub: "Que te quede bien a ti", text: "Corte de mujer y estilismo pensado para tu pelo, tu rutina y la forma en la que de verdad te gusta llevarlo." },
  { n: "02", title: "Color", sub: "Tinte y coloración", text: "Color para renovar, mantener o darle un giro a tu imagen sin perder de vista lo que te favorece." },
  { n: "03", title: "Peinado", sub: "Acabado que se siente tuyo", text: "Peinado y estilismo para salir del salón sintiéndote arreglada, cómoda y tú misma." },
];

const reviews = [
  "Me cortaron de la manera que yo quería. Salí encantada y volveré seguro.",
  "Corte, peinado y tinte; muy simpáticas y profesionales.",
  "Grandes profesionales y precio estupendo. Muy recomendable.",
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="logo" href="#inicio"><span>CON</span><strong>OTRO AIRE</strong></a>
        <nav aria-label="Principal">
          <a href="#servicios">Servicios</a>
          <a href="#confianza">Por qué venir</a>
          <a href="#opiniones">Opiniones</a>
          <a href="#visita">Visítanos</a>
        </nav>
        <a className="button buttonDark" href={`tel:${phone}`}>Pedir cita</a>
      </header>

      <section className="hero" id="inicio">
        <div className="heroText">
          <p className="kicker">Peluquería en Umbrete</p>
          <h1>Tu pelo.<br />Tu rollo.<br /><em>Otro aire.</em></h1>
          <p className="intro">Una peluquería cercana para cortarte, cambiar de color o simplemente salir sintiéndote mejor que cuando entraste.</p>
          <div className="heroActions">
            <a className="button buttonRed" href={`tel:${phone}`}>Pedir cita · {phoneDisplay}</a>
            <a className="link" href={maps} target="_blank" rel="noreferrer">Cómo llegar ↗</a>
          </div>
        </div>
        <div className="airVisual" aria-hidden="true">
          <div className="mirror m1"><span>CUT</span></div>
          <div className="mirror m2"><span>COLOR</span></div>
          <div className="mirror m3"><span>YOU</span></div>
          <div className="scribble">otro<br/>aire</div>
        </div>
      </section>

      <section className="trustStrip">
        <p><strong>4,5★</strong> en Google</p>
        <p><strong>60</strong> reseñas públicas</p>
        <p><strong>Umbrete</strong> · Paseo 1º de Mayo</p>
      </section>

      <section className="services" id="servicios">
        <div className="sectionLead">
          <p className="kicker blue">Lo esencial, bien hecho</p>
          <h2>No vienes a parecerte a otra persona.<br /><em>Vienes a verte mejor tú.</em></h2>
        </div>
        <div className="serviceGrid">
          {services.map((service) => (
            <article key={service.n}>
              <span className="serviceN">{service.n}</span>
              <p className="serviceSub">{service.sub}</p>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <a href={`tel:${phone}`}>Consultar cita →</a>
            </article>
          ))}
        </div>
      </section>

      <section className="confidence" id="confianza">
        <div className="confidenceTitle">
          <p className="kicker">Peluquería de confianza</p>
          <h2>Escuchar primero.<br /><em>Cortar después.</em></h2>
        </div>
        <div className="confidenceBody">
          <div className="bubble b1">“como yo quería”</div>
          <div className="bubble b2">“volveré”</div>
          <div className="bubble b3">“profesionales”</div>
          <p>En las opiniones públicas se repite una idea: aquí importa entender lo que buscas. Ese trato cercano es justo lo que una buena web debería transmitir antes incluso de entrar por la puerta.</p>
        </div>
      </section>

      <section className="colorStory">
        <div className="palette" aria-hidden="true">
          <i className="tone t1"/><i className="tone t2"/><i className="tone t3"/><i className="tone t4"/><i className="tone t5"/>
        </div>
        <div>
          <p className="kicker blue">Color sin complicarlo</p>
          <h2>Cuando quieres cambiar,<br /><em>pero seguir siendo tú.</em></h2>
          <p>Tinte y coloración aparecen entre los servicios públicos del salón. La propuesta: asesoramiento claro y un resultado que encaje contigo.</p>
          <a className="button buttonDark" href={`tel:${phone}`}>Preguntar por color</a>
        </div>
      </section>

      <section className="reviews" id="opiniones">
        <div className="score"><strong>4,5</strong><span>★★★★★</span><p>60 reseñas públicas en Google</p></div>
        <div className="reviewList">
          {reviews.map((review, i) => <blockquote key={review}><span>0{i+1}</span><p>“{review}”</p></blockquote>)}
        </div>
      </section>

      <section className="visit" id="visita">
        <div className="visitHeadline">
          <p className="kicker">Umbrete · Sevilla</p>
          <h2>Nos vemos<br /><em>en el salón.</em></h2>
        </div>
        <div className="visitInfo">
          <h3>Peluquería Con Otro Aire</h3>
          <p>C. Paseo 1º de Mayo, 23<br />41806 Umbrete, Sevilla</p>
          <dl>
            <div><dt>Lunes — Viernes</dt><dd>09:30 — 20:00</dd></div>
            <div><dt>Sábado</dt><dd>09:30 — 14:00</dd></div>
            <div><dt>Domingo</dt><dd>Cerrado</dd></div>
          </dl>
          <div className="heroActions">
            <a className="button buttonRed" href={`tel:${phone}`}>Llamar · {phoneDisplay}</a>
            <a className="link light" href={maps} target="_blank" rel="noreferrer">Abrir mapa ↗</a>
          </div>
        </div>
      </section>

      <footer>
        <a className="logo" href="#inicio"><span>CON</span><strong>OTRO AIRE</strong></a>
        <p>Demo privada · No es la web oficial · Sin analítica ni seguimiento.</p>
      </footer>

      <div className="mobileDock"><a href={`tel:${phone}`}>Llamar</a><a href={`tel:${phone}`}>Pedir cita</a></div>
    </main>
  );
}
