import { business, telLink, whatsappLink } from "@/business.config";
import { ArchFrame } from "../ArchFrame";
import { PhoneIcon, StarIcon, WhatsAppIcon } from "../Icons";
import { photos } from "@/lib/assets";
import styles from "./Hero.module.css";

export function Hero() {
  const { professional: pro, rating } = business;
  return (
    <section id="inicio" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <p className="eyebrow">Fisioterapia en {business.city}</p>
          <h1 id="hero-title" className={`display ${styles.title}`}>
            Vuelve a moverte <em>con confianza.</em>
          </h1>
          <p className={`lead ${styles.lead}`}>
            En {business.name} te atiende {pro.name}, fisioterapeuta colegiada con {pro.yearsExperience} años de
            experiencia. Valoramos tu caso con calma y diseñamos un plan pensado solo para ti.
          </p>

          <div className={styles.ctas}>
            <a
              className="btn btn--primary"
              href={whatsappLink("Hola Angélica, te escribo desde la web. Me gustaría contarte mi caso y pedir cita.")}
              target="_blank"
              rel="noopener"
            >
              <WhatsAppIcon /> Cuéntanos tu caso
            </a>
            <a className="btn btn--ghost" href={telLink}>
              <PhoneIcon /> Llamar · {business.contact.phoneDisplay}
            </a>
          </div>
          <p className={styles.micro}>Por WhatsApp o por teléfono, sin compromiso.</p>

          <dl className={styles.facts}>
            <div>
              <dt>Experiencia</dt>
              <dd>{pro.yearsExperience} años</dd>
            </div>
            <div>
              <dt>Colegiada</dt>
              <dd>Nº {pro.collegiateNumber}</dd>
            </div>
            <div>
              <dt>Pacientes</dt>
              <dd className={styles.rating}>
                <StarIcon /> {rating.value}
                <span className="visually-hidden"> sobre 5 en reseñas públicas</span>
              </dd>
            </div>
          </dl>
        </div>

        <div className={styles.visual}>
          <ArchFrame
            src={photos.hero.src}
            alt={photos.hero.alt}
            tone="olive"
            priority
            sizes="(min-width: 960px) 460px, 86vw"
            className={styles.arch}
          >
            {!photos.hero.src && (
              <div className={styles.archCopy} aria-hidden="true">
                <span className={styles.big}>{pro.yearsExperience}</span>
                <span className={styles.bigLabel}>años de experiencia en fisioterapia y rehabilitación</span>
              </div>
            )}
          </ArchFrame>

          <div className={styles.card}>
            <span className={styles.cardAvatar} aria-hidden="true">
              AA
            </span>
            <span>
              <strong>{pro.name}</strong>
              <span>
                {pro.role} · nº {pro.collegiateNumber}
              </span>
            </span>
          </div>

          <div className={styles.chip}>
            <span className={styles.stars} aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <StarIcon key={i} />
              ))}
            </span>
            <span>
              <strong>{rating.value}</strong> · {rating.count} opiniones
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
