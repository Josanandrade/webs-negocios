import { business, mailLink, telLink } from "@/business.config";
import { Logo } from "./Logo";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const { address, contact, professional: pro } = business;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo tone="light" />
          <p>
            {business.legalTagline} en {address.city}. Dirigida por {pro.name}, fisioterapeuta colegiada nº{" "}
            {pro.collegiateNumber}.
          </p>
        </div>

        <nav aria-label="Pie de página" className={styles.col}>
          <p className={styles.heading}>Tratamientos</p>
          <ul role="list">
            <li><a href="#dolor-y-lesiones">Dolor y lesiones</a></li>
            <li><a href="#neurologica">Rehabilitación neurológica</a></li>
            <li><a href="#mayores">Personas mayores</a></li>
            <li><a href="#pediatrica">Fisioterapia pediátrica</a></li>
          </ul>
        </nav>

        <div className={styles.col}>
          <p className={styles.heading}>Contacto</p>
          <ul role="list">
            <li><a href={telLink}>{contact.phoneDisplay}</a></li>
            <li><a href={mailLink}>{contact.email}</a></li>
            <li>
              {address.street}
              <br />
              {address.postalCode} {address.city}
            </li>
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>
          <strong>Propuesta de diseño · demo privada.</strong> Esta página es un prototipo elaborado por AvanttAI para
          presentar una nueva web a {business.name}. No es la web oficial del negocio ni está indexada en buscadores.
        </p>
        <p>© {business.name}</p>
      </div>
    </footer>
  );
}
