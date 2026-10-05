/**
 * Logotipo provisional (wordmark tipográfico + retícula de medición).
 * Sustituir por el logotipo oficial de Eferos cuando esté disponible.
 */
export default function Logo({ tone = "ink" }: { tone?: "ink" | "light" }) {
  return (
    <span className={`logo logo--${tone}`}>
      <svg className="logo__mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="1.6" className="logo__dot" />
      </svg>
      <span className="logo__word">eferos</span>
    </span>
  );
}
