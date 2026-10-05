import Link from "next/link";
import { business } from "@/business.config";
import { getService } from "@/lib/site";
import styles from "./Conditions.module.css";

/** Lesiones frecuentes: el visitante se reconoce antes de leer técnicas. */
export default function Conditions() {
  const epi = getService("epi");
  const items = epi?.indications ?? [];

  return (
    <section className={`section on-pine ${styles.section}`} aria-labelledby="lesiones-title">
      <div className="wrap grid">
        <div className={styles.side}>
          <h2 id="lesiones-title" className={styles.title}>
            ¿Te suena <em className="serif">alguna</em>?
          </h2>
          <p className="muted">
            Lesiones que tratamos, también con EPI® ecoguiada. Atendemos dolor agudo y dolor
            crónico en adultos.
          </p>
        </div>

        <ul role="list" className={styles.list}>
          {items.map((item, i) => (
            <li key={item} data-reveal style={{ ["--delay" as string]: `${i * 50}ms` }}>
              {item}
            </li>
          ))}
        </ul>

        <div className={styles.foot}>
          <p>¿No ves la tuya? Cuéntanos qué te pasa y te decimos si podemos ayudarte.</p>
          <div className={styles.footLinks}>
            <a href={business.contact.whatsappUrl} className="btn btn--light" target="_blank" rel="noopener">
              Escribir por WhatsApp
              <span className="arrow" aria-hidden="true">↗</span>
            </a>
            {epi && (
              <Link href={`/especialidades/${epi.slug}`} className="link">
                Qué es la EPI®
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
