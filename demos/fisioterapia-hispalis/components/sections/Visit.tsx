import { business, mailLink, telLink, whatsappLink } from "@/business.config";
import { ArrowIcon, FacebookIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "../Icons";
import styles from "./Visit.module.css";

export function Visit() {
  const { address, contact } = business;
  return (
    <section id="ubicacion" className="section" aria-labelledby="visit-title">
      <div className="container">
        <div className={styles.card} data-reveal>
          <div className={styles.info}>
            <p className="eyebrow">Dónde estamos</p>
            <h2 id="visit-title" className={`display ${styles.title}`}>
              Te esperamos en <em>{address.city}.</em>
            </h2>

            <address className={styles.address}>
              <span className={styles.street}>{address.street}</span>
              <span>
                {address.postalCode} {address.city} ({address.province})
              </span>
              <span className={styles.landmark}>{address.landmark}</span>
            </address>

            <a className="btn btn--primary" href={address.mapsUrl} target="_blank" rel="noopener">
              <PinIcon /> Cómo llegar
            </a>

            <ul role="list" className={styles.contact}>
              <li>
                <a href={whatsappLink("Hola Angélica, te escribo desde la web.")} target="_blank" rel="noopener">
                  <WhatsAppIcon />
                  <span>
                    <small>WhatsApp</small>
                    {contact.phoneDisplay}
                  </span>
                  <ArrowIcon className={styles.arrow} />
                </a>
              </li>
              <li>
                <a href={telLink}>
                  <PhoneIcon />
                  <span>
                    <small>Teléfono</small>
                    {contact.phoneDisplay}
                  </span>
                  <ArrowIcon className={styles.arrow} />
                </a>
              </li>
              <li>
                <a href={mailLink}>
                  <MailIcon />
                  <span>
                    <small>Email</small>
                    {contact.email}
                  </span>
                  <ArrowIcon className={styles.arrow} />
                </a>
              </li>
              <li>
                <a href={business.social.facebook} target="_blank" rel="noopener">
                  <FacebookIcon />
                  <span>
                    <small>Facebook</small>
                    /fisioterapiahispalis
                  </span>
                  <ArrowIcon className={styles.arrow} />
                </a>
              </li>
            </ul>

            {business.hours ? (
              <dl className={styles.hours}>
                {business.hours.map((h) => (
                  <div key={h.days}>
                    <dt>{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className={styles.note}>Consúltanos horario y disponibilidad por WhatsApp o por teléfono.</p>
            )}
          </div>

          <div className={styles.map} aria-hidden="true">
            <svg viewBox="0 0 600 640" preserveAspectRatio="xMidYMid slice">
              <rect width="600" height="640" fill="#e9dfcc" />
              <g fill="#efe7da">
                <rect x="30" y="40" width="160" height="120" rx="10" />
                <rect x="220" y="40" width="130" height="190" rx="10" />
                <rect x="380" y="40" width="200" height="110" rx="10" />
                <rect x="30" y="190" width="160" height="170" rx="10" />
                <rect x="380" y="180" width="200" height="160" rx="10" />
                <rect x="30" y="390" width="250" height="110" rx="10" />
                <rect x="310" y="370" width="270" height="130" rx="10" />
                <rect x="30" y="530" width="180" height="90" rx="10" />
                <rect x="240" y="530" width="340" height="90" rx="10" />
              </g>
              <rect x="220" y="260" width="130" height="80" rx="10" fill="#d4dccb" />
              <path d="M0 365 C160 350 420 372 600 355" stroke="#f7f2ea" strokeWidth="22" fill="none" />
              <path d="M205 0 V640" stroke="#f7f2ea" strokeWidth="16" />
              <path d="M365 0 C360 220 372 420 365 640" stroke="#f7f2ea" strokeWidth="14" fill="none" />
              <path d="M0 515 H600" stroke="#f7f2ea" strokeWidth="14" />
              <g transform="translate(285 300)">
                <circle r="56" fill="#a4502c" opacity="0.14" />
                <circle r="30" fill="#a4502c" opacity="0.22" />
                <path d="M0 8s-18-15.7-18-29.5a18 18 0 1 1 36 0C18-7.7 0 8 0 8Z" fill="#2f4a3a" />
                <circle cy="-22" r="6.5" fill="#f7f2ea" />
                <rect x="-66" y="22" width="132" height="34" rx="17" fill="#f7f2ea" />
                <text y="44" textAnchor="middle" fontSize="15" fontWeight="600" fill="#1d2721" fontFamily="system-ui, sans-serif">
                  Calle Betis, 7
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
