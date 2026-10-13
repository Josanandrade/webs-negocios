import { clinic, whatsappHref } from "@/content/clinic";
import { Icon } from "./Icon";

// Barra de acciones fija en móvil: llamar, WhatsApp y cómo llegar a un toque.
export function Dock() {
  return (
    <nav className="dock" aria-label="Acciones rápidas">
      <a className="dock__btn dock__btn--primary" href={clinic.phone.href}>
        <Icon name="phone" />
        Llamar
      </a>
      <a className="dock__btn" href={whatsappHref()} target="_blank" rel="noopener noreferrer">
        <Icon name="whatsapp" />
        WhatsApp
      </a>
      <a className="dock__btn" href={clinic.maps} target="_blank" rel="noopener noreferrer">
        <Icon name="pin" />
        Cómo llegar
      </a>
    </nav>
  );
}
