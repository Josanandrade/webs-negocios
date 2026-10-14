const phone = "+34665856574";
const whatsapp = "https://wa.me/34665856574?text=Hola%2C%20quer%C3%ADa%20informaci%C3%B3n%20sobre%20CLS%20PoleSport";
const maps = "https://www.google.com/maps/search/?api=1&query=CLS%20PoleSport%20Bormujos";
const email = "mailto:clspolesport@gmail.com";

const proof = [
  ["4,9", "valoración en Google"],
  ["26", "reseñas públicas"],
  ["9", "poles en el estudio"],
];

const reasons = [
  {
    n: "01",
    title: "Empieza desde donde estás",
    text: "No necesitas llegar con experiencia. La idea es avanzar con técnica, constancia y acompañamiento real.",
  },
  {
    n: "02",
    title: "Grupos reducidos",
    text: "Las reseñas destacan la atención cercana y el seguimiento durante las clases, con espacio para aprender a tu ritmo.",
  },
  {
    n: "03",
    title: "Fuerza que se nota",
    text: "Pole sport mezcla coordinación, control corporal y fuerza en una disciplina que engancha por el progreso visible.",
  },
  {
    n: "04",
    title: "Buen ambiente",
    text: "Quienes entrenan aquí hablan de compañerismo, paciencia y un equipo implicado en ayudarte a mejorar.",
  },
];

const reviews = [
  "Clases reducidas para una mayor atención por parte de los profesores.",
  "Buen rollo y muchas clases donde elegir. Se preocupan siempre por ayudarte a avanzar.",
  "Muy recomendable si te gustan los retos y quieres ponerte en forma.",
];

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="#inicio" aria-label="CLS PoleSport, inicio">
          <span className="brandMark">CLS</span>
          <span>POLESPORT</span>
        </a>
        <nav aria-label="Principal">
          <a href="#empieza">Empieza</a>
          <a href="#por-que">La escuela</a>
          <a href="#opiniones">Opiniones</a>
          <a href="#visitanos">Visítanos</a>
        </nav>
        <a className="pill pillLight" href={whatsapp} target="_blank" rel="noreferrer">Primera toma de contacto</a>
      </header>

      <section className="hero" id="inicio">
        <div className="heroGrid" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i />
        </div>
        <div className="heroCopy">
          <p className="eyebrow">Bormujos · Sevilla</p>
          <h1>Sube.<br /><em>Más de lo que imaginas.</em></h1>
          <p className="heroLead">Pole sport con grupos reducidos, profes que acompañan y un ambiente donde empezar desde cero no da miedo.</p>
          <div className="actions">
            <a className="pill pillAccent" href={whatsapp} target="_blank" rel="noreferrer">Quiero probar</a>
            <a className="pill pillGhost" href={`tel:${phone}`}>Llamar</a>
          </div>
        </div>
        <div className="heroStamp" aria-hidden="true">
          <span>MOVE</span><span>TRUST</span><span>CLIMB</span>
        </div>
      </section>

      <section className="ticker" aria-label="Valores de CLS PoleSport">
        <div>POLE SPORT · FUERZA · TÉCNICA · PROGRESO · COMUNIDAD · POLE SPORT · FUERZA · TÉCNICA · PROGRESO · COMUNIDAD</div>
      </section>

      <section className="proof" aria-label="Datos públicos">
        {proof.map(([value, label]) => (
          <div key={label}><strong>{value}</strong><span>{label}</span></div>
        ))}
      </section>

      <section className="start" id="empieza">
        <div className="sectionHead">
          <p className="eyebrow dark">Tu primer día</p>
          <h2>No tienes que saber.<br /><em>Tienes que empezar.</em></h2>
        </div>
        <div className="steps">
          <article><span>01</span><h3>Escríbenos</h3><p>Cuéntanos si partes de cero y qué horario te viene mejor.</p></article>
          <article><span>02</span><h3>Encuentra tu grupo</h3><p>Te orientamos para que empieces en un nivel cómodo y con atención suficiente.</p></article>
          <article><span>03</span><h3>Aprende progresivo</h3><p>Técnica, fuerza y confianza. Paso a paso, sin compararte con quien lleva años.</p></article>
        </div>
      </section>

      <section className="why" id="por-que">
        <div className="whyIntro">
          <p className="eyebrow">Por qué CLS</p>
          <h2>Una escuela pequeña<br />con <em>mucho dentro.</em></h2>
          <p>La mejor parte no cabe en una ficha de Google: el acompañamiento, la paciencia y esa sensación de estar avanzando de verdad.</p>
        </div>
        <div className="reasonList">
          {reasons.map((reason) => (
            <article key={reason.n}>
              <span>{reason.n}</span>
              <div><h3>{reason.title}</h3><p>{reason.text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="studio">
        <div className="studioVisual" aria-hidden="true">
          <div className="miniPole p1" /><div className="miniPole p2" /><div className="miniPole p3" /><div className="miniPole p4" />
          <span>9 POLES</span>
        </div>
        <div className="studioCopy">
          <p className="eyebrow dark">El espacio</p>
          <h2>Hecho para entrenar.<br /><em>No para intimidar.</em></h2>
          <p>El estudio de CLS PoleSport cuenta con nueve poles. Las opiniones públicas destacan el ambiente acogedor y el formato de clases reducidas.</p>
          <a className="textLink" href={maps} target="_blank" rel="noreferrer">Ver cómo llegar ↗</a>
        </div>
      </section>

      <section className="voices" id="opiniones">
        <div className="voiceScore">
          <strong>4,9</strong><span>★★★★★</span><p>26 reseñas públicas en Google</p>
        </div>
        <div className="reviewStack">
          {reviews.map((review) => <blockquote key={review}>“{review}”</blockquote>)}
        </div>
      </section>

      <section className="visit" id="visitanos">
        <div>
          <p className="eyebrow">Bormujos</p>
          <h2>Tu próximo reto<br /><em>empieza aquí.</em></h2>
        </div>
        <div className="visitCard">
          <h3>CLS PoleSport</h3>
          <p>Av. del Aljarafe · Edificio C. Cerro Colarte, 65 · Local 11-A<br />41930 Bormujos, Sevilla</p>
          <dl>
            <div><dt>Lunes — Viernes</dt><dd>09:00 — 22:30</dd></div>
            <div><dt>Sábado — Domingo</dt><dd>Cerrado</dd></div>
          </dl>
          <div className="actions">
            <a className="pill pillAccent" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
            <a className="pill pillGhost" href={`tel:${phone}`}>665 85 65 74</a>
          </div>
          <a className="mail" href={email}>clspolesport@gmail.com</a>
        </div>
      </section>

      <footer>
        <a className="brand" href="#inicio"><span className="brandMark">CLS</span><span>POLESPORT</span></a>
        <p>Demo privada · No es la web oficial · Sin analítica ni seguimiento.</p>
      </footer>

      <div className="mobileDock">
        <a href={`tel:${phone}`}>Llamar</a>
        <a href={whatsapp} target="_blank" rel="noreferrer">Quiero probar</a>
      </div>
    </main>
  );
}
