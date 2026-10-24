// Marca de la demo: el arco del pie en un solo trazo y un punto de
// "cita confirmada". Mismo dibujo que public/icon.svg.
export default function Mark({ size = 36 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="14" fill="var(--ink)" />
      <path
        d="M14 44c6-2 9-8 13-17s9-13 16-13c5 0 8 3 8 7"
        fill="none"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="46" cy="44" r="5" fill="var(--ok)" />
    </svg>
  );
}
