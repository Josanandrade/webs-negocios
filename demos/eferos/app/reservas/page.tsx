import type { Metadata } from "next";
import { business } from "@/business.config";
import BookingFlow from "@/lib/avanttai-booking/BookingFlow";
import { formatRange, isOpenRow } from "@/lib/hours";
import { baseOpenGraph, ogImage, telHref } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Reservar cita",
  description: `Reserva tu cita en ${business.name} (${business.address.locality}): elige servicio, día y hora con la disponibilidad real de la agenda.`,
  alternates: { canonical: "/reservas" },
  openGraph: { ...baseOpenGraph, title: `Reservar cita · ${business.name}`, url: "/reservas", images: [ogImage] },
};

export default function ReservasPage() {
  const { contact, address } = business;
  const openRows = business.hours.filter(isOpenRow);

  const contactLinks = (
    <div className={styles.contactLinks}>
      <a href={contact.whatsappUrl} className="btn btn--ghost" target="_blank" rel="noopener">
        <span>
          WhatsApp <span className="tabular booking-actions__num">{contact.phoneDisplay}</span>
        </span>
        <span className="arrow" aria-hidden="true">↗</span>
      </a>
      <a href={telHref} className="btn btn--ghost">
        <span>
          Llamar <span className="tabular booking-actions__num">{contact.phoneDisplay}</span>
        </span>
        <span className="arrow" aria-hidden="true">→</span>
      </a>
    </div>
  );

  return (
    <section className={styles.page} aria-labelledby="reservas-title">
      <div className={`wrap grid ${styles.head}`}>
        <div className={styles.heading}>
          <p className="label mark">Reserva online</p>
          <h1 id="reservas-title" className={styles.title}>
            Reserva tu cita
          </h1>
        </div>
        <p className={`muted ${styles.intro}`}>
          Elige el tratamiento, el día y la hora. Ves la disponibilidad real de nuestra agenda y la cita queda registrada al
          momento.
        </p>
      </div>

      <div className="wrap">
        <BookingFlow
          theme={business.booking.theme}
          consentText={`Acepto que ${business.name} use mis datos para gestionar esta cita y contactar conmigo sobre ella.`}
          fallback={
            <>
              <p className="muted">Puedes pedir tu cita por WhatsApp o por teléfono.</p>
              {contactLinks}
            </>
          }
          aside={
            <div className={styles.aside}>
              <div className={styles.asideBlock}>
                <p className="label mark">¿Prefieres hablar con nosotros?</p>
                {contactLinks}
              </div>
              <div className={styles.asideBlock}>
                <p className="label mark">Dónde</p>
                <p>
                  {address.street}
                  <br />
                  {address.postalCode} {address.locality}
                </p>
                <p className="muted">{address.landmark}.</p>
              </div>
              {openRows.length > 0 && (
                <div className={styles.asideBlock}>
                  <p className="label mark">Horario</p>
                  <ul role="list" className={`tabular ${styles.hours}`}>
                    {openRows.map((row) => (
                      <li key={row.days}>
                        <span>{row.days}</span>
                        <span>{formatRange(row, true)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          }
        />
      </div>
    </section>
  );
}
