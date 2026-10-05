import styles from "./Approach.module.css";

/** Forma de trabajar: sinceridad clínica + manos y tecnología. */
export default function Approach() {
  return (
    <section className={`section ${styles.approach}`} aria-labelledby="enfoque-title">
      <div className="wrap grid">
        <h2 className={`label mark ${styles.kicker}`} id="enfoque-title">
          Cómo trabajamos
        </h2>

        <div className={styles.body}>
          <p className={styles.statement} data-reveal>
            Antes de empezar te explicamos, con <em className="serif">sinceridad</em>, qué
            posibilidades reales de recuperación tiene tu caso. Y a partir de ahí, nos
            comprometemos a resolverlo.
          </p>

          <div className={styles.pair}>
            <div className={styles.pairItem} data-reveal style={{ ["--delay" as string]: "80ms" }}>
              <h3 className={styles.pairTitle}>Las manos</h3>
              <p className="muted">
                Para explorar, localizar qué estructura está implicada y tratar articulaciones,
                músculo y tejido nervioso con terapia manual ortopédica.
              </p>
            </div>
            <div className={styles.pairItem} data-reveal style={{ ["--delay" as string]: "160ms" }}>
              <h3 className={styles.pairTitle}>La tecnología</h3>
              <p className="muted">
                Para llegar donde las manos no llegan: ver el tejido en el ecógrafo, aplicar la
                aguja con precisión y trabajar el calor en profundidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
