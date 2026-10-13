import { faqs } from "@/lib/content";
import styles from "./Faq.module.css";

export function Faq() {
  return (
    <section id="preguntas" className="section" aria-labelledby="faq-title">
      <div className={`container ${styles.grid}`}>
        <header data-reveal>
          <p className="eyebrow">Antes de pedir cita</p>
          <h2 id="faq-title" className="display h2">
            Preguntas <em>frecuentes.</em>
          </h2>
          <p className={styles.sub}>Si tu duda no está aquí, pregúntanos por WhatsApp: es lo más rápido.</p>
        </header>

        <div className={styles.list} data-reveal>
          {faqs.map((f, i) => (
            <details key={f.q} className={styles.item} open={i === 0}>
              <summary>
                <span>{f.q}</span>
                <span className={styles.icon} aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
