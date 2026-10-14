// Abanico de mechones tipo carta de color, dibujado en SVG.
// Los colores de cada mechón son paradas de raíz a puntas; al cambiarlas,
// `stop-color` transiciona en CSS con un pequeño escalonado por mechón.

type Props = {
  strands: string[][];
  id: string;
  className?: string;
};

const W = 30;
const GAP = 8;
const TOP = 34;
const BOTTOM = 480;
// Largos y ondas ligeramente distintos para que el abanico no parezca una cortina.
const TRIM = [10, 42, 0, 30, 58, 14, 36, 6, 48];
const SWAY = [8, -6, 10, -9, 5, -7, 9, -5, 7];

function strandPath(i: number) {
  const x = i * (W + GAP) + 10;
  const sway = SWAY[i % SWAY.length];
  const bottom = BOTTOM - TRIM[i % TRIM.length];
  const mid = (TOP + bottom) / 2;
  return [
    `M${x},${TOP}`,
    `C${x - 2},${mid - 80} ${x + sway},${mid + 40} ${x + 4 + sway},${bottom - 40}`,
    `Q${x + W / 2 + sway * 1.4},${bottom + 34} ${x + W - 4 + sway},${bottom - 40}`,
    `C${x + W + sway},${mid + 40} ${x + W + 2},${mid - 80} ${x + W},${TOP}`,
    "Z",
  ].join(" ");
}

export function Strands({ strands, id, className }: Props) {
  const width = strands.length * (W + GAP) + 12;
  return (
    <svg
      className={className ? `strands ${className}` : "strands"}
      viewBox={`-20 0 ${width + 40} 530`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {strands.map((stops, i) => (
          <linearGradient key={i} id={`${id}-g${i}`} x1="0" y1="0" x2="0" y2="1">
            {stops.map((c, s) => (
              <stop
                key={s}
                offset={s === 0 ? "0" : s === 1 ? "0.42" : "1"}
                style={{ stopColor: c, transitionDelay: `${i * 22}ms` }}
              />
            ))}
          </linearGradient>
        ))}
      </defs>
      {strands.map((_, i) => {
        // Abanico: cada mechón gira un poco alrededor de la pinza.
        const cx = i * (W + GAP) + 10 + W / 2;
        const angle = (i - (strands.length - 1) / 2) * 1.4;
        return (
          <g key={i} transform={`rotate(${angle} ${cx} ${TOP})`}>
            <g className="strand" style={{ ["--i" as string]: i }}>
              <path d={strandPath(i)} fill={`url(#${id}-g${i})`} />
              <path d={strandPath(i)} className="strand-sheen" />
            </g>
          </g>
        );
      })}
      <rect className="strands-clip" x="-6" y="14" width={width + 12} height="30" rx="15" />
    </svg>
  );
}
