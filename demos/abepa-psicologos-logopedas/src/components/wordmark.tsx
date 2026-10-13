// Logotipo provisional: el centro no tiene un logo localizable en buena calidad.
// Se sustituye por el oficial en cuanto lo facilite (ver README_ASSETS.md).
export function Wordmark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`wordmark${inverted ? " wordmark--inverted" : ""}`}>
      <svg viewBox="0 0 28 28" className="wordmark__mark" aria-hidden="true" focusable="false">
        <rect x="1" y="1" width="12" height="26" rx="4" className="wordmark__psi" />
        <rect x="15" y="1" width="12" height="12" rx="4" className="wordmark__logo" />
        <rect x="15" y="15" width="12" height="12" rx="4" className="wordmark__ped" />
      </svg>
      <span className="wordmark__text">
        <span className="wordmark__name">abepa</span>
        <span className="wordmark__sub">Psicólogos y logopedas</span>
      </span>
    </span>
  );
}
