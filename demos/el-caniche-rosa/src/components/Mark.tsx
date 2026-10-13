/*
  El caniche de la marca, construido solo con pompones (círculos) y barras
  redondeadas. Hereda el color del texto; la oreja lleva el acento rosa.
  `cut` es el color de los recortes (ojo y filo de la oreja): el del fondo.
*/
type MarkProps = {
  className?: string;
  title?: string;
  ear?: string;
  cut?: string;
};

export function Mark({
  className,
  title,
  ear = "var(--pink)",
  cut = "var(--paper)",
}: MarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <g fill="currentColor">
        <path
          d="M24 50 Q17 42 16 32"
          stroke="currentColor"
          strokeWidth="4.2"
          fill="none"
          strokeLinecap="round"
        />
        <circle className="pom pom--tail" cx="15.5" cy="26" r="8" />
        <rect x="24" y="45" width="42" height="11" rx="5.5" />
        <circle cx="29" cy="50" r="11.5" />
        <rect x="27" y="52" width="5" height="32" rx="2.5" />
        <rect x="64" y="52" width="5" height="32" rx="2.5" />
        <circle cx="29.5" cy="82" r="6.5" />
        <circle cx="66.5" cy="82" r="6.5" />
        <circle cx="66" cy="45" r="15" />
        <path d="M68 44 L74 22 L83 24.5 L78 47 Z" />
        <circle cx="80" cy="21" r="8.5" />
        <circle className="pom pom--top" cx="78" cy="10.5" r="8" />
        <rect x="82" y="18" width="14" height="7.6" rx="3.8" />
      </g>
      <ellipse cx="74" cy="30" rx="5.6" ry="10.5" fill={ear} stroke={cut} strokeWidth="2" />
      <circle cx="84" cy="18" r="1.5" fill={cut} />
    </svg>
  );
}
