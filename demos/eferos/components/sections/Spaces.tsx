"use client";

import { useEffect, useRef, useState } from "react";
import { business } from "@/business.config";
import PhotoFrame from "@/components/PhotoFrame";
import styles from "./Spaces.module.css";

/**
 * "Dónde te tratamos". En escritorio, la imagen queda fija a la izquierda y
 * cambia según el espacio que se está leyendo. En móvil cada espacio lleva su foto.
 */
export default function Spaces() {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="centro" className={`section ${styles.section}`} aria-labelledby="centro-title">
      <div className="wrap grid">
        <div className={styles.stage} aria-hidden="true">
          <div className={styles.sticky}>
            {business.spaces.map((space, i) => (
              <div key={space.id} className={styles.slide} data-active={i === active}>
                <PhotoFrame src={space.photo} alt="" label={space.photoLabel} ratio="4 / 5" sizes="45vw" />
              </div>
            ))}
            <p className={`label tabular ${styles.counter}`}>
              {String(active + 1).padStart(2, "0")} / {String(business.spaces.length).padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <header className={styles.header}>
            <p className="label mark">El centro</p>
            <h2 id="centro-title" className={styles.title}>
              Dónde te tratamos
            </h2>
            <p className="muted">
              En el corazón de {business.address.locality}, {business.address.landmark.toLowerCase()}.
              Y cuando no puedes venir, vamos nosotros.
            </p>
          </header>

          <ol role="list" className={styles.list}>
            {business.spaces.map((space, i) => (
              <li
                key={space.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                data-index={i}
                className={styles.item}
                data-active={i === active}
              >
                <PhotoFrame
                  src={space.photo}
                  alt={space.photoLabel}
                  label={space.photoLabel}
                  ratio="3 / 2"
                  sizes="100vw"
                  className={styles.inlinePhoto}
                />
                <p className="label">{space.where}</p>
                <h3 className={styles.itemTitle}>{space.title}</h3>
                <p className={styles.itemText}>{space.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
