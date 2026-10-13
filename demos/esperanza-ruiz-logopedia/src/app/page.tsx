import { AreaExplorer } from "@/components/AreaExplorer";
import { AudienceCards } from "@/components/AudienceCards";
import { ContactForm } from "@/components/ContactForm";
import { Header } from "@/components/Header";
import { MobileCta } from "@/components/MobileCta";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Wave } from "@/components/Wave";
import { Wordmark } from "@/components/Wordmark";
import { ArrowIcon, BadgeIcon, MailIcon, PhoneIcon, PinIcon, PlusIcon, StarIcon, TrainIcon } from "@/components/icons";
import { photos } from "@/lib/photos";
import { areas, faqs, reviewThemes, site, steps } from "@/lib/site";

function Stars({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 text-albero ${className}`} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} />
      ))}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = "ink",
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  tone?: "ink" | "light";
}) {
  return (
    <div className="max-w-2xl">
      <p className={`eyebrow ${tone === "light" ? "text-albero" : "text-terracotta"}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] ${tone === "light" ? "text-paper" : ""}`}>
        {title}
      </h2>
      {intro && <p className={`mt-5 text-lg ${tone === "light" ? "text-green-ink/85" : "text-ink-soft"}`}>{intro}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
      >
        Saltar al contenido
      </a>
      <Header />

      <main id="contenido">
        {/* ───────────────────────── HERO ───────────────────────── */}
        <section id="inicio" className="relative overflow-hidden pb-16 pt-6 md:pb-24 md:pt-10">
          <div className="container-x grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <p className="rise eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-terracotta">
                <span>Logopedia en Sevilla</span>
                <span aria-hidden className="hidden h-px w-6 bg-terracotta/50 sm:block" />
                <span>{site.address.landmark}</span>
              </p>
              <h1 className="rise rise-1 mt-5 text-[2.6rem] leading-[1.04] sm:text-[3.6rem] lg:text-[4.4rem]">
                Logopedia <span className="accent text-green">cercana</span> para niños, adultos y sus familias
              </h1>
              <p className="rise rise-2 mt-6 max-w-xl text-lg text-ink-soft sm:text-xl">
                Habla, lenguaje, voz, deglución y rehabilitación tras un daño neurológico. Con {site.shortName},
                logopeda colegiada, en pleno centro de Sevilla.
              </p>
              <div className="rise rise-3 mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={site.phoneHref} className="btn btn-primary">
                  <PhoneIcon /> Llamar · {site.phone}
                </a>
                <a href="#contacto" className="btn btn-ghost">
                  Pedir cita por escrito <ArrowIcon className="size-4" />
                </a>
              </div>
              <ul className="rise rise-4 mt-10 grid gap-4 border-t border-ink/10 pt-6 text-[0.95rem] sm:grid-cols-3">
                <li className="flex items-center gap-3">
                  <BadgeIcon className="size-6 shrink-0 text-green" />
                  <span>
                    Logopeda colegiada
                    <br />
                    <span className="text-ink-soft">Nº {site.collegiate}</span>
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <TrainIcon className="size-6 shrink-0 text-green" />
                  <span>
                    Metro, tranvía
                    <br />
                    <span className="text-ink-soft">y parking al lado</span>
                  </span>
                </li>
                <li className="flex flex-col justify-center gap-1">
                  <Stars />
                  <span>
                    {site.rating.toFixed(1).replace(".", ",")} de 5 <span className="text-ink-soft">en reseñas</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="rise rise-2 relative mx-auto w-full max-w-[26rem] lg:max-w-none">
              <PhotoSlot
                photo={photos.retrato}
                variant="portrait"
                priority
                className="aspect-[5/4] w-full sm:aspect-[4/5]"
                words={["Hablar", "Entender", "Expresarse", "Tragar"]}
              />
              <div className="relative mx-4 -mt-10 rounded-3xl bg-paper p-5 shadow-[0_24px_50px_-24px_rgb(29_41_37/0.45)] ring-1 ring-ink/5 sm:absolute sm:-bottom-6 sm:-left-8 sm:mx-0 sm:mt-0 sm:max-w-[15rem]">
                <p className="font-serif text-lg leading-snug">Primero escuchamos. Después, un plan claro.</p>
                <p className="mt-2 text-sm text-ink-soft">Valoración, objetivos y seguimiento contigo.</p>
              </div>
            </div>
          </div>
          <Wave
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full text-sand-deep"
            lines={3}
            amplitude={8}
          />
        </section>

        {/* ───────────────────────── PARA QUIÉN ───────────────────────── */}
        <section id="para-quien" className="bg-sand py-20 md:py-28">
          <div className="container-x">
            <SectionHeading
              eyebrow="¿Para quién buscas logopeda?"
              title={
                <>
                  Cada etapa necesita <span className="accent">otra forma</span> de acompañar
                </>
              }
              intro="Una familia preocupada porque su hijo no se hace entender, una profesora con la voz cansada o un padre que se recupera de un ictus. Empieza por lo que te trae aquí."
            />
            <div className="mt-12">
              <AudienceCards />
            </div>
          </div>
        </section>

        {/* ───────────────────────── QUÉ TRATAMOS ───────────────────────── */}
        <section id="que-tratamos" className="py-20 md:py-28">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <SectionHeading
                eyebrow="Qué tratamos"
                title={
                  <>
                    Explicado <span className="accent">sin tecnicismos</span>
                  </>
                }
                intro="Seis áreas de trabajo. Debajo de cada una, situaciones reconocibles para saber si te puede ayudar."
              />
              <p className="max-w-xs text-sm text-ink-soft lg:text-right">
                ¿No ves tu caso? Llámanos y te orientamos sobre si la logopedia es el camino.
              </p>
            </div>
            <div className="mt-10">
              <AreaExplorer />
            </div>
          </div>
        </section>

        {/* ───────────────────────── ESPERANZA ───────────────────────── */}
        <section id="esperanza" className="grain relative overflow-hidden bg-green-deep py-20 text-paper md:py-28">
          <div className="container-x grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <PhotoSlot
              photo={photos.consulta}
              variant="room"
              shape="rounded"
              className="order-last aspect-[5/4] w-full lg:order-first lg:aspect-[4/5]"
              label="La consulta · Edificio Cristina"
            />
            <div>
              <SectionHeading
                tone="light"
                eyebrow="Quién te atiende"
                title={
                  <>
                    Esperanza Ruiz, <span className="accent text-albero">logopeda</span>
                  </>
                }
              />
              <div className="mt-6 space-y-4 text-lg text-green-ink/85">
                <p>
                  {site.professional} da nombre a este centro de logopedia en el corazón de Sevilla, a un paso de Puerta
                  Jerez. Trabaja con la infancia, con adultos y con personas que han sufrido un daño neurológico.
                </p>
                <p>
                  Cada tratamiento empieza con pruebas y una valoración propia, y continúa con un plan que se explica y
                  se revisa junto al paciente y su familia.
                </p>
              </div>
              <dl className="mt-10 grid gap-px overflow-hidden rounded-3xl bg-paper/15 sm:grid-cols-3">
                {[
                  { k: "Colegiada", v: `Nº ${site.collegiate}` },
                  { k: "Atiende a", v: "Infancia y adultos" },
                  { k: "Áreas", v: `${areas.length} especialidades` },
                ].map((d) => (
                  <div key={d.k} className="bg-green-deep p-5">
                    <dt className="eyebrow text-albero">{d.k}</dt>
                    <dd className="mt-2 font-serif text-xl">{d.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ───────────────────────── CÓMO TRABAJAMOS ───────────────────────── */}
        <section id="como-trabajamos" className="py-20 md:py-28">
          <div className="container-x">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <SectionHeading
                  eyebrow="Cómo trabajamos"
                  title={
                    <>
                      Un proceso <span className="accent">claro</span> desde la primera llamada
                    </>
                  }
                  intro="Sin prisas y sin dudas sobre qué se está haciendo. La familia forma parte del tratamiento."
                />
                <PhotoSlot
                  photo={photos.materiales}
                  variant="detail"
                  shape="rounded"
                  className="mt-10 hidden aspect-[4/3] w-full lg:block"
                />
              </div>
              <ol className="relative space-y-4">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex gap-5 rounded-[28px] bg-sand p-6 md:gap-7 md:p-8">
                    <span
                      aria-hidden
                      className="grid size-12 shrink-0 place-items-center rounded-full bg-paper font-serif text-xl italic text-terracotta"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-[1.5rem]">{s.title}</h3>
                      <p className="mt-2 text-ink-soft">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ───────────────────────── OPINIONES ───────────────────────── */}
        <section id="opiniones" className="bg-sand py-20 md:py-28">
          <div className="container-x">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div>
                <SectionHeading
                  eyebrow="Lo que dicen las familias"
                  title={
                    <>
                      Una reputación construida <span className="accent">paciente a paciente</span>
                    </>
                  }
                />
                <div className="mt-10 flex items-center gap-6 rounded-[28px] bg-paper p-6 ring-1 ring-ink/10 md:p-8">
                  <p className="font-serif text-[4.5rem] leading-none text-green" aria-hidden>
                    {site.rating.toFixed(1).replace(".", ",")}
                  </p>
                  <div>
                    <Stars className="[&_svg]:size-5" />
                    <p className="mt-2 font-bold">
                      <span className="sr-only">{site.rating} de 5 estrellas. </span>
                      Valoración media en las reseñas públicas
                    </p>
                    <a
                      href={site.reviewsUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="link-underline mt-1 inline-block text-sm text-ink-soft"
                    >
                      Leer las reseñas en Google<span className="sr-only"> (se abre en otra pestaña)</span>
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-ink-soft">Lo que más se repite en las valoraciones:</p>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {reviewThemes.map((t) => (
                    <li key={t.title} className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/10">
                      <span aria-hidden className="font-serif text-4xl leading-none text-albero">
                        “
                      </span>
                      <h3 className="mt-1 text-[1.4rem]">{t.title}</h3>
                      <p className="mt-2 text-ink-soft">{t.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────── PREGUNTAS ───────────────────────── */}
        <section id="preguntas" className="py-20 md:py-28">
          <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading
              eyebrow="Antes de la primera cita"
              title={
                <>
                  Preguntas <span className="accent">frecuentes</span>
                </>
              }
              intro="Si te queda alguna duda, lo más rápido es llamar."
            />
            <div className="divide-y divide-ink/10 border-y border-ink/10">
              {faqs.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-serif text-xl [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <PlusIcon className="size-5 shrink-0 text-terracotta transition-transform duration-300 group-open:rotate-45" />
                  </summary>
                  <p className="-mt-1 max-w-2xl pb-6 text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────── CONTACTO ───────────────────────── */}
        <section id="contacto" className="bg-green-deep py-20 text-paper md:py-28">
          <div className="container-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <SectionHeading
                tone="light"
                eyebrow="Contacto y cita"
                title={
                  <>
                    Hablemos de <span className="accent text-albero">tu caso</span>
                  </>
                }
                intro="Llama, escribe o déjanos tus datos. Te orientamos sobre la primera valoración."
              />
              <ul className="mt-10 space-y-3">
                <li>
                  <a
                    href={site.phoneHref}
                    className="flex items-center gap-4 rounded-3xl bg-paper/10 p-5 transition-colors hover:bg-paper/15"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-albero text-ink">
                      <PhoneIcon />
                    </span>
                    <span>
                      <span className="block text-sm text-green-ink/75">Teléfono</span>
                      <span className="font-serif text-2xl">{site.phone}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="flex items-center gap-4 rounded-3xl bg-paper/10 p-5 transition-colors hover:bg-paper/15"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-paper/15">
                      <MailIcon />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm text-green-ink/75">Email</span>
                      <span className="block break-all font-bold">{site.email}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={site.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-3xl bg-paper/10 p-5 transition-colors hover:bg-paper/15"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-paper/15">
                      <PinIcon />
                    </span>
                    <span>
                      <span className="block text-sm text-green-ink/75">Cómo llegar · se abre Google Maps</span>
                      <span className="block font-bold">
                        {site.address.building}, {site.address.street}
                      </span>
                      <span className="block text-green-ink/85">
                        {site.address.postalCode} {site.address.city} · {site.address.landmark}
                      </span>
                    </span>
                  </a>
                </li>
              </ul>
              <p className="mt-6 text-sm text-green-ink/75">Atención privada con cita previa.</p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="bg-ink pb-28 pt-14 text-paper lg:pb-14">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div>
              <Wordmark tone="light" />
              <p className="mt-5 max-w-sm text-sm text-paper/70">
                {site.address.building}, {site.address.street} · {site.address.postalCode} {site.address.city}
                <br />
                {site.professional} · Logopeda colegiada nº {site.collegiate}
              </p>
            </div>
            <nav aria-label="Pie de página">
              <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-paper/80">
                {areas.map((a) => (
                  <li key={a.id}>
                    <a className="link-underline" href={`#area-${a.id}`}>
                      {a.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-paper/15 pt-6 text-xs text-paper/60 md:flex-row md:justify-between">
            <p>
              Propuesta de diseño privada preparada por AvanttAI. No es la web oficial del centro:{" "}
              <a className="link-underline" href={site.officialUrl} rel="noopener noreferrer nofollow">
                esperanzaruizlogopedia.com
              </a>
            </p>
            <p>Demo sin cookies ni analítica.</p>
          </div>
        </div>
      </footer>

      <MobileCta />
    </>
  );
}
