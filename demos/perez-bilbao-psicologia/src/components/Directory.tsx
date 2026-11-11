import { business } from "@/content/site";

// El «directorio del portal»: un tablero de letras como los de los edificios
// de oficinas, que hace a la vez de índice de la página.
const rows = [
  { n: "01", label: "La consulta", href: "#consulta" },
  { n: "02", label: "Primera cita", href: "#primera-cita" },
  { n: "03", label: "Pedir cita", href: "#cita" },
  { n: "04", label: "Dónde estamos", href: "#ubicacion" },
  { n: "05", label: "Preguntas", href: "#preguntas" },
];

export default function Directory() {
  return (
    <aside className="board" aria-label="Índice">
      <div className="board-head">
        <span>{business.street}</span>
        <span>Índice</span>
      </div>
      <p className="board-name">
        <span className="board-name-main">{business.short}</span>
        <span className="board-name-sub">Psicología</span>
      </p>
      <ul className="board-rows">
        {rows.map((r) => (
          <li key={r.n}>
            <a href={r.href}>
              <span className="board-n">{r.n}</span>
              <span className="board-label">{r.label}</span>
              <span className="board-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
      <div className="board-foot">
        <span className="board-dot" aria-hidden="true" />
        <span>{business.hoursShort}</span>
      </div>
    </aside>
  );
}
