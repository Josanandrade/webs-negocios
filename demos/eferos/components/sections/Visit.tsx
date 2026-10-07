import { business } from "@/business.config";
import { mailHref, telHref } from "@/lib/site";
import HoursTable from "@/components/HoursTable";
import styles from "./Visit.module.css";

export default function Visit() {
  const { address, contact, booking } = business;

  const channels = [
    { label: "Reserva online", value: "Elige día y hora", href: booking.url, external: false, icon: "→" },
    { label: "WhatsApp", value: contact.phoneDisplay, href: contact.whatsappUrl, external: true, icon: "↗︎" },
    { label: "Teléfono", value: contact.phoneDisplay, href: telHref, external: false, icon: "→" },
    { label: "Email", value: contact.email, href: mailHref, external: false, icon: "→" },
  ];

  return (
    <section id="contacto" className={`section on-pine ${styles.section}`} aria-labelledby="contacto-title">
      <div className="wrap grid">
        <div className={styles.main}>
          <h2 id="contacto-title" className={styles.title}>
            Pide tu cita
          </h2>
          <ul role="list" className={styles.channels}>
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  className={styles.channel}
                  {...(c.external ? { target: "_blank", rel: "noopener" } : {})}
                >
                  <span className="label">{c.label}</span>
                  <span className={`${styles.value} ${c.label === "Email" ? styles.email : ""}`}>{c.value}</span>
                  <span className={styles.icon} aria-hidden="true">
                    {c.icon}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <aside className={styles.aside} aria-label="Dirección y horario">
          <div className={styles.block}>
            <p className="label mark">Dirección</p>
            <address className={styles.address}>
              {address.street}
              <br />
              {address.postalCode} {address.locality}, {address.region}
            </address>
            <p className="muted">{address.landmark}.</p>
            <a href={address.mapsUrl} className="link" target="_blank" rel="noopener">
              Cómo llegar en Google Maps
            </a>
          </div>

          <div className={styles.block}>
            <p className="label mark">Horario</p>
            <HoursTable />
            <p className={`muted ${styles.note}`}>Tratamientos a domicilio con cita previa.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
