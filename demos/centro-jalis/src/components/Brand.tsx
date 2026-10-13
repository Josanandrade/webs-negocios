// Identidad: sello circular con la J en Bodoni cursiva + logotipo en versalitas.
// Es una propuesta de marca para la demo, no el logotipo oficial del centro.

export function Seal({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="31" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="32" cy="32" r="27.5" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.55" />
      <text
        x="32"
        y="44.5"
        textAnchor="middle"
        fontFamily="var(--font-serif), Didot, Georgia, serif"
        fontStyle="italic"
        fontSize="34"
        fill="currentColor"
      >
        J
      </text>
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="wordmark">
      <Seal size={compact ? 36 : 42} className="wordmark__seal" />
      <span className="wordmark__text">
        <span className="wordmark__name">Jalis</span>
        <span className="wordmark__tag">Belleza y bienestar</span>
      </span>
    </span>
  );
}

/** Sello grande con texto en círculo para la portada. Estático a propósito. */
export function RoundSeal({ years }: { years: number }) {
  const text = "CENTRO DE BELLEZA Y BIENESTAR · CASTILLEJA DE LA CUESTA · ";
  return (
    <svg className="round-seal" viewBox="0 0 200 200" role="img" aria-label={`Más de ${years} años de trayectoria`}>
      <defs>
        <path id="seal-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
      </defs>
      <circle cx="100" cy="100" r="98" fill="var(--ivory)" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="var(--ink)" strokeWidth="0.8" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="var(--ink)" strokeWidth="0.6" opacity="0.5" />
      <text fontSize="10.6" letterSpacing="2.1" fill="var(--ink)" fontFamily="var(--font-sans), sans-serif" fontWeight="600">
        <textPath href="#seal-circle">{text}</textPath>
      </text>
      <text x="100" y="104" textAnchor="middle" fontFamily="var(--font-serif), Georgia, serif" fontSize="50" fill="var(--wine)" fontStyle="italic">
        +{years}
      </text>
      <text x="100" y="126" textAnchor="middle" fontFamily="var(--font-sans), sans-serif" fontSize="10" letterSpacing="3" fill="var(--ink)" fontWeight="600">
        AÑOS
      </text>
    </svg>
  );
}
