// Marca provisional de la demo: cruz sanitaria redondeada con un punto de sol.
// Se sustituye por el logotipo real de la clínica cuando lo tengamos.
export function Logo() {
  return (
    <span className="logo">
      <svg
        className="logo__mark"
        viewBox="0 0 40 40"
        width="40"
        height="40"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="40" height="40" rx="12" fill="var(--cobalt)" />
        <path d="M20 11v18M11 20h18" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="31" cy="9" r="4" fill="var(--sun)" />
      </svg>
      <span className="logo__text">
        <span className="logo__name">Clínica Veterinaria</span>
        <span className="logo__place">Camas</span>
      </span>
    </span>
  );
}
