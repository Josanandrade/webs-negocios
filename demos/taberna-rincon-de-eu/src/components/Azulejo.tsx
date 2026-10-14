// Cenefa de azulejo dibujada en SVG: un motivo de cuatro pétalos repetido.
// Sin imágenes externas.
export default function Azulejo({ id, className }: { id: string; className?: string }) {
  return (
    <svg className={className} aria-hidden="true" width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <rect width="56" height="56" fill="var(--tile-bg)" />
          <rect x="1" y="1" width="54" height="54" fill="none" stroke="var(--tile-line)" strokeWidth="1" opacity=".5" />
          <g fill="var(--tile-ink)">
            <path d="M28 6c5 8 5 14 0 22-5-8-5-14 0-22Z" />
            <path d="M28 50c5-8 5-14 0-22-5 8-5 14 0 22Z" />
            <path d="M6 28c8-5 14-5 22 0-8 5-14 5-22 0Z" />
            <path d="M50 28c-8-5-14-5-22 0 8 5 14 5 22 0Z" />
          </g>
          <circle cx="28" cy="28" r="3.2" fill="var(--tile-accent)" />
          <g fill="var(--tile-accent)">
            <path d="M0 0h7a7 7 0 0 1-7 7Z" />
            <path d="M56 0h-7a7 7 0 0 0 7 7Z" />
            <path d="M0 56h7a7 7 0 0 0-7-7Z" />
            <path d="M56 56h-7a7 7 0 0 1 7-7Z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
