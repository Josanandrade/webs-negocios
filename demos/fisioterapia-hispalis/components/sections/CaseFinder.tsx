"use client";

import { useId, useRef, useState, type CSSProperties } from "react";
import { whatsappLink } from "@/business.config";
import { caseOptions } from "@/lib/content";
import { ArrowIcon, WhatsAppIcon } from "../Icons";
import styles from "./CaseFinder.module.css";

/**
 * «¿Qué te trae por aquí?»: el paciente elige su situación y obtiene una
 * respuesta breve + un WhatsApp con el mensaje ya escrito. Reduce la fricción
 * de «no sé cómo explicarlo» antes de pedir cita.
 */
export function CaseFinder() {
  const [active, setActive] = useState(caseOptions[0].id);
  const current = caseOptions.find((c) => c.id === active) ?? caseOptions[0];
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const choose = (id: string) => {
    setActive(id);
    // En móvil el panel puede quedar por debajo del pliegue: lo acercamos.
    const panel = panelRef.current;
    if (!panel) return;
    const { top, bottom } = panel.getBoundingClientRect();
    if (top > window.innerHeight * 0.6 || bottom < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
  };

  return (
    <section className={styles.band} aria-labelledby="case-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.head} data-reveal>
          <p className="eyebrow">Empieza por aquí</p>
          <h2 id="case-title" className={`display ${styles.title}`}>
            ¿Qué te trae <em>por aquí?</em>
          </h2>
          <p className={styles.sub}>Elige lo que más se parece a tu situación. Te lo ponemos fácil para escribirnos.</p>
        </div>

        <div className={styles.picker} data-reveal style={{ "--reveal-delay": "80ms" } as CSSProperties}>
          <div className={styles.options} role="group" aria-label="Tu situación">
            {caseOptions.map((c) => (
              <button
                key={c.id}
                type="button"
                className={styles.option}
                aria-pressed={c.id === active}
                aria-controls={panelId}
                onClick={() => choose(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div id={panelId} ref={panelRef} className={styles.panel} aria-live="polite">
            <div key={current.id} className={styles.panelInner}>
              <h3 className={styles.panelTitle}>{current.title}</h3>
              <p>{current.body}</p>
              <div className={styles.panelCtas}>
                <a className="btn btn--primary" href={whatsappLink(current.message)} target="_blank" rel="noopener">
                  <WhatsAppIcon /> Escribir con este mensaje
                </a>
                <a className={styles.more} href="#tratamientos">
                  Ver tratamientos <ArrowIcon />
                </a>
              </div>
              <p className={styles.preview}>
                <span>Mensaje que se enviará:</span> «{current.message}»
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
