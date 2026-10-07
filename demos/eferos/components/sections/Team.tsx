import Image from "next/image";
import { business } from "@/business.config";
import styles from "./Team.module.css";

export default function Team() {
  return (
    <section id="equipo" className={`section ${styles.section}`} aria-labelledby="equipo-title">
      <div className={`wrap grid ${styles.head}`}>
        <p className="label mark">Equipo</p>
        <h2 id="equipo-title" className={styles.title}>
          Quién te va a tratar
        </h2>
      </div>

      <div className={`wrap ${styles.people}`}>
        {business.team.map((m, i) => (
          <article key={m.slug} className={styles.person} data-reveal style={{ ["--delay" as string]: `${i * 120}ms` }}>
            <div className={styles.portrait}>
              {m.photo ? (
                <Image src={m.photo} alt={`Retrato de ${m.name}`} fill sizes="(max-width: 640px) 15rem, (max-width: 1100px) 17rem, 26rem" />
              ) : (
                <span className={styles.initials} aria-hidden="true">
                  {m.initials}
                </span>
              )}
            </div>

            <div className={styles.info}>
              <header>
                <h3 className={styles.name}>{m.name}</h3>
                <p className={`label tabular ${styles.role}`}>
                  {m.role} · {m.license}
                </p>
              </header>
              <p className={styles.summary}>{m.summary}</p>
              <ul role="list" className={styles.credentials}>
                {m.credentials.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              {m.mentors && m.mentors.length > 0 && (
                <div className={styles.mentors}>
                  <p className="label">Formación directa con referentes internacionales</p>
                  <ul role="list" className={styles.mentorList}>
                    {m.mentors.map((name) => (
                      <li key={name} className="serif">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
