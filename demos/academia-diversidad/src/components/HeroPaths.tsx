// Ilustración de portada: cuatro puntos de partida distintos que acaban
// llegando al mismo sitio. Es la idea del nombre, sin lápices ni birretes.
const paths = [
  { y: 70, c: "var(--sky)", label: "No sé por dónde empezar" },
  { y: 150, c: "var(--lime)", label: "Me está costando" },
  { y: 280, c: "var(--lilac)", label: "Voy bien, quiero más" },
  { y: 360, c: "var(--sand)", label: "Empiezo de nuevo" },
].map((p) => ({ ...p, d: `M24 ${p.y} L 200 ${p.y} C 300 ${p.y}, 320 214, 400 214 L 452 214` }));

export function HeroPaths() {
  return (
    <svg className="paths" viewBox="0 0 520 420" role="img" aria-label="Cuatro caminos que parten de lugares distintos y llegan al mismo punto: tu siguiente paso.">
      <defs>
        <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="rgba(243,241,234,.13)" />
        </pattern>
      </defs>
      <rect width="520" height="420" fill="url(#dots)" />
      {paths.map((p, i) => (
        <g key={p.label}>
          <path className="path-line" style={{ animationDelay: `${i * 0.18}s` }} d={p.d} stroke={p.c} strokeWidth="7" fill="none" strokeLinecap="round" pathLength={1} />
          <circle cx="24" cy={p.y} r="9" fill={p.c} />
          <text x="44" y={p.y - 18} className="path-label">{p.label}</text>
        </g>
      ))}
      <circle className="goal-halo" cx="456" cy="214" r="34" fill="var(--mandarin)" opacity=".22" />
      <circle cx="456" cy="214" r="18" fill="var(--mandarin)" />
      <text x="456" y="268" textAnchor="middle" className="path-goal">Tu siguiente</text>
      <text x="456" y="290" textAnchor="middle" className="path-goal">paso</text>
    </svg>
  );
}
