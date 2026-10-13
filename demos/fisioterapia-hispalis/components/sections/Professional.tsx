import { business, whatsappLink } from "@/business.config";
import { photos } from "@/lib/assets";
import { ArchFrame } from "../ArchFrame";
import { WhatsAppIcon } from "../Icons";
import styles from "./Professional.module.css";

export function Professional() {
  const pro = business.professional;
  return (
    <section id="angelica" className={styles.section} aria-labelledby="pro-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.visual} data-reveal>
          <ArchFrame src={photos.portrait.src} alt={photos.portrait.alt} tone="sand" sizes="(min-width: 960px) 420px, 80vw">
            {!photos.portrait.src && (
              <div className={styles.monogram} aria-hidden="true">
                <span>Angélica</span>
                <span>Argüello</span>
              </div>
            )}
          </ArchFrame>
          <p className={styles.badge}>
            <span>Colegiada</span>
            <strong>nº {pro.collegiateNumber}</strong>
          </p>
        </div>

        <div className={styles.copy}>
          <p className={`eyebrow ${styles.eyebrow}`} data-reveal>
            Quién te atiende
          </p>
          <h2 id="pro-title" className={`display h2 ${styles.title}`} data-reveal>
            Sus manos y {pro.yearsExperience} años de experiencia, <em>a tu servicio.</em>
          </h2>
          <div className={styles.text} data-reveal>
            <p>
              {pro.name} dirige {business.name} y es quien te atiende. Fisioterapeuta colegiada, lleva {pro.yearsExperience}{" "}
              años tratando a pacientes con problemas traumatológicos, reumáticos y neurológicos, y acompañando tanto a
              personas mayores como a niños.
            </p>
            <p>
              Esa amplitud es su mejor herramienta: permite mirar cada caso completo y elegir la técnica adecuada para
              cada persona, no al revés.
            </p>
          </div>

          <ul role="list" className={styles.points} data-reveal>
            <li>
              <strong>Atención personal</strong>
              <span>Te atiende directamente la fisioterapeuta que dirige la clínica.</span>
            </li>
            <li>
              <strong>Experiencia amplia</strong>
              <span>Traumatología, neurología, geriatría y pediatría.</span>
            </li>
            <li>
              <strong>Cerca de ti</strong>
              <span>Clínica en {business.city} y opción de sesiones a domicilio.</span>
            </li>
          </ul>

          <a
            className={`btn btn--light ${styles.cta}`}
            href={whatsappLink("Hola Angélica, te escribo desde la web. Me gustaría hacerte una consulta.")}
            target="_blank"
            rel="noopener"
            data-reveal
          >
            <WhatsAppIcon /> Escribir a {pro.firstName}
          </a>
        </div>
      </div>
    </section>
  );
}
