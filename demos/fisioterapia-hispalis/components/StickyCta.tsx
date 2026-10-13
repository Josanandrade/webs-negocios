"use client";

import { useEffect, useState } from "react";
import { business, telLink, whatsappLink } from "@/business.config";
import { PhoneIcon, WhatsAppIcon } from "./Icons";
import styles from "./StickyCta.module.css";

/**
 * Barra de contacto fija en móvil. Aparece al dejar atrás el hero y se oculta
 * cuando el CTA final está en pantalla (no duplicar botones).
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const final = document.getElementById("contacto");
    let pastHero = false;
    let finalInView = false;
    const update = () => setVisible(pastHero && !finalInView);

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
        if (e.target === final) finalInView = e.isIntersecting;
      }
      update();
    });
    if (hero) io.observe(hero);
    if (final) io.observe(final);
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.bar} data-visible={visible} aria-hidden={!visible} inert={!visible}>
      <a
        className={`btn btn--primary ${styles.primary}`}
        href={whatsappLink("Hola Angélica, te escribo desde la web. Me gustaría pedir cita.")}
        target="_blank"
        rel="noopener"
      >
        <WhatsAppIcon /> Pedir cita
      </a>
      <a className={`btn btn--ghost ${styles.call}`} href={telLink} aria-label={`Llamar al ${business.contact.phoneDisplay}`}>
        <PhoneIcon /> Llamar
      </a>
    </div>
  );
}
