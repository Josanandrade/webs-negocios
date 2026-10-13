// Arco de luz: elemento visual de la marca. Funciona sin retrato y, cuando
// haya fotografía real (ver public/assets/maqui-martin-psicologia/README_ASSETS.md),
// la imagen se recorta dentro del mismo arco.

type ArchProps = {
  /** Ruta a una fotografía real y autorizada. Si falta, se muestra la luz abstracta. */
  src?: string;
  alt?: string;
  className?: string;
};

export function Arch({ src, alt = "", className }: ArchProps) {
  return (
    <figure className={`arch ${className ?? ""}`}>
      <div className="arch__frame">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- recorte simple, sin optimizador para la demo
          <img src={src} alt={alt} className="arch__photo" />
        ) : (
          <svg className="arch__light" viewBox="0 0 400 560" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="arch-sky" x1="0" y1="0" x2="0.35" y2="1">
                <stop offset="0" stopColor="#f6dcc8" />
                <stop offset="0.55" stopColor="#e7b89d" />
                <stop offset="1" stopColor="#b9765a" />
              </linearGradient>
              <linearGradient id="arch-beam" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff7ee" stopOpacity="0.75" />
                <stop offset="1" stopColor="#fff7ee" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="arch-sun" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#fffaf3" />
                <stop offset="0.6" stopColor="#fbe6d4" stopOpacity="0.9" />
                <stop offset="1" stopColor="#fbe6d4" stopOpacity="0" />
              </radialGradient>
              <filter id="arch-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
                <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.17  0 0 0 0 0.12  0 0 0 0.16 0" />
              </filter>
            </defs>
            <rect width="400" height="560" fill="url(#arch-sky)" />
            <circle cx="268" cy="170" r="120" fill="url(#arch-sun)" />
            <path d="M-40 40 L210 -20 L460 520 L240 600 Z" fill="url(#arch-beam)" opacity="0.55" />
            <path d="M-60 210 L60 170 L330 640 L170 660 Z" fill="url(#arch-beam)" opacity="0.35" />
            <path d="M0 470 C 90 440, 170 452, 250 440 S 360 420, 400 428 L400 560 L0 560 Z" fill="#8f5640" opacity="0.55" />
            <path d="M0 505 C 110 488, 220 500, 400 478 L400 560 L0 560 Z" fill="#6f3f2d" opacity="0.6" />
            <rect width="400" height="560" filter="url(#arch-grain)" />
          </svg>
        )}
      </div>
      <span className="arch__outline" aria-hidden="true" />
    </figure>
  );
}
