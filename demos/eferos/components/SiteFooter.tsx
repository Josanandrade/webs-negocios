import Link from "next/link";
import { business } from "@/business.config";
import { activeSocial, mailHref, telHref } from "@/lib/site";
import Logo from "./Logo";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={`on-pine ${styles.footer}`}>
      <div className={`wrap ${styles.top}`}>
        <div className={styles.brand}>
          <Link href="/" aria-label={`${business.name}, ir al inicio`}>
            <Logo tone="light" />
          </Link>
          <p className="muted">{business.tagline}.</p>
        </div>

        <nav aria-label="Tratamientos" className={styles.col}>
          <p className="label">Tratamientos</p>
          <ul role="list">
            {business.services.map((s) => (
              <li key={s.slug}>
                <Link href={`/especialidades/${s.slug}`} className="link">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.col}>
          <p className="label">Contacto</p>
          <ul role="list">
            <li>
              <a href={telHref} className="link tabular">
                {business.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={business.contact.whatsappUrl} className="link" target="_blank" rel="noopener">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={mailHref} className={`link ${styles.mail}`}>
                {business.contact.email}
              </a>
            </li>
            {activeSocial.map((s) => (
              <li key={s.label}>
                <a href={s.url} className="link" target="_blank" rel="noopener">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <p className="label">Centro</p>
          <address>
            {business.address.street}
            <br />
            {business.address.postalCode} {business.address.locality}
          </address>
        </div>
      </div>

      <div className={`wrap ${styles.legal}`}>
        <ul role="list" className={styles.regs}>
          {business.registrations.map((r) => (
            <li key={r.value}>
              <span className="label">{r.label}</span> {r.value}
              {r.detail && <span className={styles.regDetail}> · {r.detail}</span>}
            </li>
          ))}
        </ul>
        <p className={styles.copy}>
          © {year} {business.name}
        </p>
      </div>

    </footer>
  );
}
