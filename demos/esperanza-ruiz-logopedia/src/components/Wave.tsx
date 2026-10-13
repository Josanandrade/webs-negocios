/** Motivo de identidad: ondas sonoras suaves (la voz) en lugar de bocas o cerebros. */
export function Wave({
  className = "",
  lines = 4,
  stroke = "currentColor",
  amplitude = 14,
}: {
  className?: string;
  lines?: number;
  stroke?: string;
  amplitude?: number;
}) {
  const w = 1200;
  const segment = 150;
  const paths = Array.from({ length: lines }, (_, i) => {
    const y = 30 + i * 18;
    const a = amplitude * (1 - i * 0.16);
    let d = `M0 ${y}`;
    for (let x = 0; x < w * 2; x += segment) {
      d += ` q${segment / 4} ${-a} ${segment / 2} 0 t${segment / 2} 0`;
    }
    return { d, opacity: 1 - i * 0.18 };
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${40 + lines * 18}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
      focusable={false}
    >
      <g className="wave-drift">
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={stroke}
            strokeWidth="1.6"
            opacity={p.opacity}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}
