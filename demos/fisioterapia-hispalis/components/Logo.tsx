import styles from "./Logo.module.css";

/**
 * Logotipo provisional (tipográfico). No se ha podido obtener el logotipo
 * original en alta calidad: ver public/assets/fisioterapia-hispalis/README_ASSETS.md.
 */
export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className={`${styles.logo} ${tone === "light" ? styles.light : ""}`}>
      <svg className={styles.mark} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <path d="M10 34V19a10 10 0 0 1 20 0v15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="20" cy="19.5" r="3" className={styles.dot} />
      </svg>
      <span className={styles.text}>
        <span className={styles.top}>Fisioterapia</span>
        <span className={styles.name}>Híspalis</span>
      </span>
    </span>
  );
}
