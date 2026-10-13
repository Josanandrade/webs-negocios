import type { CSSProperties } from "react";
import { methodSteps, techniques } from "@/lib/content";
import styles from "./Method.module.css";

export function Method() {
  return (
    <section id="como-trabajamos" className="section" aria-labelledby="method-title">
      <div className="container">
        <header className={styles.head} data-reveal>
          <p className="eyebrow">Cómo trabajamos</p>
          <h2 id="method-title" className="display h2">
            Primero entender. <em>Después, tratar.</em>
          </h2>
        </header>

        <ol role="list" className={styles.steps}>
          {methodSteps.map((step, i) => (
            <li key={step.title} className={styles.step} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}>
              <span className={styles.index} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>

        <div className={styles.techniques} data-reveal>
          <div>
            <h3 className={styles.techTitle}>Técnicas que utilizamos</h3>
            <p className={styles.techNote}>
              Las técnicas son herramientas, no el objetivo. Elegimos las que tienen sentido para tu caso.
            </p>
          </div>
          <ul role="list" className={styles.techList}>
            {techniques.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
