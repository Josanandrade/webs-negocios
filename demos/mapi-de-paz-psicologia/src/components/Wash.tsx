// Manchas de acuarela en SVG puro: guiño a la arteterapia, sin imágenes.
export function Wash({ className = "", seed = 4 }: { className?: string; seed?: number }) {
  const id = `wash-${seed}`;
  return (
    <svg className={`wash ${className}`} viewBox="0 0 400 440" aria-hidden="true" focusable="false">
      <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed={seed} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="38" xChannelSelector="R" yChannelSelector="G" result="warp" />
          <feGaussianBlur in="warp" stdDeviation="5" />
        </filter>
      </defs>
      <g filter={`url(#${id})`} style={{ mixBlendMode: "multiply" }}>
        <ellipse cx="170" cy="190" rx="132" ry="148" fill="var(--sage)" fillOpacity="0.42" />
        <ellipse cx="250" cy="260" rx="118" ry="112" fill="var(--plum)" fillOpacity="0.32" />
        <ellipse cx="236" cy="140" rx="72" ry="66" fill="var(--ochre)" fillOpacity="0.45" />
        <ellipse cx="140" cy="318" rx="58" ry="44" fill="var(--ochre)" fillOpacity="0.25" />
      </g>
    </svg>
  );
}
