/* Dibujos a mano alzada: decoran, no informan (siempre aria-hidden). */
const doodles = {
  scissors: (
    <>
      <circle cx="14" cy="44" r="8" />
      <circle cx="34" cy="46" r="8" />
      <path d="M19 38 46 6M29 40 12 8" />
      <path d="M24 26.5l1.5 1" />
    </>
  ),
  comb: (
    <>
      <path d="M6 16c12-3 26-4 40-2l-1 8c-13-2-26-1-38 2Z" />
      <path d="M10 23v12M15 22v13M20 21.5v13M25 21v13M30 21v13M35 21.5v12.5M40 22v12" />
    </>
  ),
  dryer: (
    <>
      <path d="M8 14c0-5 4-8 9-8h18c4 0 7 3 7 7s-3 7-7 7H23" />
      <circle cx="17" cy="14" r="4" />
      <path d="M21 20l2 22c.2 2-1 3-3 3h-1c-2 0-3-1-3-3l-1-21" />
      <path d="M45 9c2 1 3 3 3 4s-1 3-3 4" />
    </>
  ),
  sparkle: <path d="M24 4c1 12 4 16 16 18-12 2-15 6-16 18-1-12-4-16-16-18 12-2 15-6 16-18Z" />,
  heart: <path d="M24 41S6 30 6 17c0-6 4-10 9-10 4 0 7 2 9 6 2-4 5-6 9-6 5 0 9 4 9 10 0 13-18 24-18 24Z" />,
  drop: <path d="M24 5c7 10 13 17 13 24a13 13 0 0 1-26 0c0-7 6-14 13-24Z M18 30c0 4 2 6 5 7" />,
  brush: (
    <>
      <path d="M30 6l12 12-16 16-12-12Z" />
      <path d="M14 22c-4 2-6 6-6 10 0 4-2 7-5 9 7 1 15-1 19-6 2-2 2-5 2-7" />
    </>
  ),
} as const;

export type DoodleName = keyof typeof doodles;

export function Doodle({ name, className = "" }: { name: DoodleName; className?: string }) {
  return (
    <svg
      className={`doodle ${className}`}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {doodles[name]}
    </svg>
  );
}

/* Subrayado a mano para palabras clave del titular. */
export function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg className={`scribble ${className}`} viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path
        d="M4 15c40-7 92-10 146-9 46 1 92 4 142 1M18 20c50-4 104-5 160-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        pathLength={1}
      />
    </svg>
  );
}
