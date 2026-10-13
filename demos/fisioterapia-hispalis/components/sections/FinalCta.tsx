import { business, telLink, whatsappLink } from "@/business.config";
import { PhoneIcon, WhatsAppIcon } from "../Icons";
import styles from "./FinalCta.module.css";

export function FinalCta() {
  return (
    <section id="contacto" className={styles.section} aria-labelledby="cta-title">
      <div className={`container ${styles.inner}`} data-reveal>
        <svg className={styles.arch} viewBox="0 0 200 240" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${20 + i * 18} 240 V${100 + i * 4} A${80 - i * 18} ${80 - i * 18} 0 0 1 ${180 - i * 18} ${100 + i * 4} V240`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          ))}
        </svg>
        <p className={`eyebrow ${styles.eyebrow}`}>Pide tu cita</p>
        <h2 id="cta-title" className={`display ${styles.title}`}>
          ¿Hablamos de <em>tu caso?</em>
        </h2>
        <p className={styles.text}>
          Escríbenos por WhatsApp o llámanos. Te escuchamos, resolvemos tus dudas y buscamos el mejor momento para tu
          primera sesión.
        </p>
        <div className={styles.ctas}>
          <a
            className="btn btn--light"
            href={whatsappLink("Hola Angélica, te escribo desde la web. Me gustaría pedir cita.")}
            target="_blank"
            rel="noopener"
          >
            <WhatsAppIcon /> Pedir cita por WhatsApp
          </a>
          <a className="btn btn--outline-light" href={telLink}>
            <PhoneIcon /> {business.contact.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
