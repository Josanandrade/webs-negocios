import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { business } from "@/business.config";
import { getService } from "@/lib/site";
import BookingActions from "@/components/BookingActions";
import BrandName from "@/components/BrandName";
import styles from "./page.module.css";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return business.services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  const title = service.fullName ? `${service.name} · ${service.fullName}` : service.name;
  const description = `${service.summary} En ${business.name}, ${business.address.locality}.`;
  return {
    title,
    description,
    alternates: { canonical: `/especialidades/${service.slug}` },
    openGraph: { title, description, url: `/especialidades/${service.slug}` },
  };
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const index = business.services.findIndex((s) => s.slug === service.slug);
  const next = business.services[(index + 1) % business.services.length];
  const others = business.services.filter((s) => s.slug !== service.slug);

  return (
    <article className={styles.page}>
      <header className={`wrap grid ${styles.head}`}>
        <nav aria-label="Ruta de navegación" className={styles.crumbs}>
          <ol role="list">
            <li>
              <Link href="/" className="link">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/#tratamientos" className="link">
                Tratamientos
              </Link>
            </li>
            <li aria-current="page">{service.name}</li>
          </ol>
        </nav>

        <p className={`label mark ${styles.kind}`}>{service.kind}</p>
        <h1 className={styles.title}>
          <BrandName name={service.name} />
        </h1>
        {service.fullName && <p className={styles.fullName}>{service.fullName}</p>}
        <p className={`lead ${styles.summary}`}>{service.summary}</p>
      </header>

      <div className={`wrap grid ${styles.body}`}>
        <div className={styles.text}>
          <p className={styles.intro}>{service.intro}</p>

          {service.sections.map((sec) => (
            <section key={sec.title} className={styles.block} data-reveal>
              <h2 className={styles.blockTitle}>{sec.title}</h2>
              <p>{sec.body}</p>
            </section>
          ))}

          {service.indications.length > 0 && (
            <section className={styles.block} data-reveal>
              <h2 className={styles.blockTitle}>Cuándo se aplica</h2>
              <ul role="list" className={styles.indications}>
                {service.indications.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className={styles.aside} aria-label="Reservar">
          <div className={styles.card}>
            <p className="label">¿Es lo que necesitas?</p>
            <p>
              Si no lo tienes claro, escríbenos: te orientamos antes de reservar.
            </p>
            <BookingActions />
          </div>
          <div className={styles.others}>
            <p className="label">Otros tratamientos</p>
            <ul role="list">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/especialidades/${o.slug}`} className="link">
                    {o.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <Link href={`/especialidades/${next.slug}`} className={styles.next}>
        <span className="wrap">
          <span className="label">Siguiente tratamiento</span>
          <span className={styles.nextName}>
            <BrandName name={next.name} /> <span aria-hidden="true">→</span>
          </span>
        </span>
      </Link>
    </article>
  );
}
