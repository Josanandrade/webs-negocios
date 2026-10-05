import { business } from "@/business.config";

/** Pareja de acciones principal: reserva online + WhatsApp. */
export default function BookingActions({ className = "" }: { className?: string }) {
  return (
    <div className={`booking-actions ${className}`}>
      <a
        href={business.booking.url}
        className="btn"
        target="_blank"
        rel="noopener"
      >
        {business.booking.label}
        <span className="arrow" aria-hidden="true">→</span>
      </a>
      <a href={business.contact.whatsappUrl} className="btn btn--ghost" target="_blank" rel="noopener">
        <span>
          WhatsApp <span className="tabular booking-actions__num">{business.contact.phoneDisplay}</span>
        </span>
        <span className="arrow" aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
