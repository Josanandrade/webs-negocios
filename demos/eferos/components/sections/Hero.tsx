import { business } from "@/business.config";
import BookingActions from "@/components/BookingActions";
import { formatRange, isOpenRow } from "@/lib/hours";
import ScanPanel from "@/components/ScanPanel";
import styles from "./Hero.module.css";

export default function Hero() {
  // Resumen compacto: primera fila abierta destacada, la siguiente como nota
  const [main, second] = business.hours.filter(isOpenRow);

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`wrap grid ${styles.grid}`}>
        <div className={styles.copy}>
          <p className={`label mark ${styles.eyebrow}`}>
            Centro de fisioterapia ·{" "}
            <span className={styles.nowrap}>{business.address.locality}</span>
          </p>
          <h1 id="hero-title" className={styles.title}>
            <span className={styles.line}>
              <span className={styles.lineInner}>Tratamos la lesión</span>
            </span>{" "}
            <span className={styles.line}>
              <span className={styles.lineInner}>
                desde su <em className="serif">origen</em>.
              </span>
            </span>
          </h1>
          <p className={`lead ${styles.lead}`}>
            Terapia manual y tecnología en el mismo plan: EPI® guiada por ecografía, punción seca,
            diatermia y ejercicio terapéutico, ajustados a lo que de verdad le pasa a tu cuerpo.
          </p>
          <BookingActions className={styles.actions} />
        </div>

        <div className={styles.visual}>
          <ScanPanel />
        </div>
      </div>

      <div className="wrap">
        <dl className={styles.facts}>
          <div>
            <dt className="label">Centro sanitario</dt>
            <dd>NICA 57826 · Junta de Andalucía</dd>
          </div>
          <div>
            <dt className="label">Dónde</dt>
            <dd>
              {business.address.street}
              <span className={styles.factNote}>{business.address.landmark}</span>
            </dd>
          </div>
          <div>
            <dt className="label">Horario</dt>
            <dd className="tabular">
              {main && `${main.days} ${formatRange(main, true)}`}
              {second && (
                <span className={styles.factNote}>
                  {second.days} {formatRange(second, true)}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="label">También</dt>
            <dd>Fisioterapia a domicilio</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
