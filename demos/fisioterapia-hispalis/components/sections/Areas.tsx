import type { CSSProperties } from "react";
import { whatsappLink } from "@/business.config";
import { areas } from "@/lib/content";
import { ArrowIcon } from "../Icons";
import styles from "./Areas.module.css";

export function Areas() {
  return (
    <section id="tratamientos" className="section" aria-labelledby="areas-title">
      <div className="container">
        <header className={styles.head} data-reveal>
          <div>
            <p className="eyebrow">Tratamientos</p>
            <h2 id="areas-title" className="display h2">
              Cuatro áreas, <em>un mismo cuidado.</em>
            </h2>
          </div>
          <p className="lead">
            Desde un dolor de espalda que no se va hasta la recuperación tras un ictus o el desarrollo motor de un bebé.
            Cada tratamiento empieza por una valoración y se adapta a la persona.
          </p>
        </header>

        <ol role="list" className={styles.list}>
          {areas.map((area, i) => (
            <li
              key={area.id}
              id={area.id}
              className={styles.card}
              data-reveal
              style={{ "--reveal-delay": `${(i % 2) * 90}ms` } as CSSProperties}
            >
              <div className={styles.top}>
                <span className={styles.num} aria-hidden="true">
                  {area.number}
                </span>
                <h3 className={styles.title}>{area.title}</h3>
                <p className={styles.lead}>{area.lead}</p>
              </div>
              <div className={styles.body}>
                <p className={styles.label}>Para quién</p>
                <ul role="list" className={styles.tags}>
                  {area.forWhom.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className={styles.approach}>{area.approach}</p>
                <a
                  className={styles.link}
                  href={whatsappLink(`Hola Angélica, te escribo desde la web. Quería información sobre ${area.topic}.`)}
                  target="_blank"
                  rel="noopener"
                >
                  Consultar este tratamiento <ArrowIcon />
                  <span className="visually-hidden"> (abre WhatsApp)</span>
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
