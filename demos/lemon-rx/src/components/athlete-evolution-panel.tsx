import Link from "next/link";
import type { AthleteEvolution, EvolutionWindow } from "@/lib/evolution";

function number(value: number | null, suffix = "") {
  if (value == null) return "—";
  return `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })}${suffix}`;
}

function signed(value: number | null, suffix = "") {
  if (value == null) return "Sin comparación todavía";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })}${suffix}`;
}

function averagePosition(position: number | null, participants: number | null) {
  if (position == null || participants == null) return "—";
  return `${Math.round(position)}/${Math.max(1, Math.round(participants))}`;
}

export function AthleteEvolutionPanel({ evolution, weeks, hrefBase = "/cuenta" }: { evolution: AthleteEvolution | null; weeks: EvolutionWindow; hrefBase?: string }) {
  const current = evolution?.current;
  const previous = evolution?.previous;
  const rmUps = evolution?.rms.filter((row) => (row.change_kg ?? 0) > 0) ?? [];

  return (
    <section className="mt-10 border-t border-line pt-8" aria-labelledby="mi-evolucion">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Rendimiento</p>
          <h2 id="mi-evolucion" className="font-display text-[28px] font-extrabold uppercase leading-none">Mi evolución</h2>
        </div>
        <nav className="flex gap-1" aria-label="Periodo de evolución">
          {([4, 8, 12] as EvolutionWindow[]).map((value) => (
            <Link key={value} href={`${hrefBase}?evolucion=${value}`} className={`press rounded-md px-3 py-2 text-[13px] font-bold ${weeks === value ? "bg-lemon text-ink" : "bg-panel text-chalk-2"}`}>
              {value} sem
            </Link>
          ))}
        </nav>
      </div>

      {!evolution || !current?.available ? (
        <p className="mt-5 border-y border-line py-5 text-[16px] text-chalk-3">Todavía no hay suficientes entrenamientos registrados para mostrar tu evolución.</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line md:grid-cols-4">
            <Metric label="Cumplimiento" value={number(current.compliance.pct, "%")} sub={`${current.compliance.completed} de ${current.compliance.programmed} bloques hasta hoy`} />
            <Metric label="Posición WOD media" value={current.wods.comparable ? averagePosition(current.wods.avg_position, current.wods.avg_participants) : "—"} sub={current.wods.comparable ? `${current.wods.comparable} WODs comparables · misma división` : "Aún sin muestra suficiente"} />
            <Metric label="Volumen fuerza" value={`${Math.round(current.strength.total_load).toLocaleString("es-ES")} kg`} sub={`${current.strength.sessions}/${current.strength.programmed_sessions} sesiones realizadas`} />
            <Metric label="RM mejorados" value={String(rmUps.length)} sub={rmUps.length ? rmUps.slice(0, 2).map((row) => row.movement_name).join(" · ") : "Desde que guardamos histórico"} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Trend title="Constancia" main={signed(evolution.trends.compliance_points, " pt")} text={previous?.available ? "Variación de cumplimiento frente al periodo anterior, contando solo los bloques hasta la fecha equivalente." : "Necesitamos un periodo anterior completo para comparar."} />
            <Trend title="WODs" main={evolution.trends.wod_position_improvement == null ? "Sin comparación todavía" : `${evolution.trends.wod_position_improvement > 0 ? "+" : ""}${evolution.trends.wod_position_improvement.toLocaleString("es-ES", { maximumFractionDigits: 1 })} puestos`} text="Un valor positivo significa que tu posición media ha mejorado frente al periodo anterior." />
            <Trend title="Fuerza" main={signed(evolution.trends.strength_volume_pct, "%")} text="Variación del volumen total registrado frente al periodo anterior." />
          </div>

          {rmUps.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <h3 className="font-display text-[17px] font-bold uppercase">Evolución de RM</h3>
              <ul className="mt-2 divide-y divide-line">
                {rmUps.slice(0, 6).map((row) => (
                  <li key={row.movement_id} className="flex items-baseline justify-between gap-4 py-2 text-[15px]">
                    <span>{row.movement_name}</span>
                    <span className="font-semibold text-lemon">+{number(row.change_kg, " kg")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-5 text-[13px] leading-[1.5] text-chalk-3">Estos datos describen lo que has registrado en Lemon RX. No sustituyen las indicaciones de tu coach ni modifican la programación.</p>
        </>
      )}
    </section>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="bg-ink px-4 py-5"><p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-chalk-3">{label}</p><p className="mt-1 font-display text-[30px] font-bold leading-none">{value}</p><p className="mt-2 text-[12px] leading-[1.35] text-chalk-3">{sub}</p></div>;
}

function Trend({ title, main, text }: { title: string; main: string; text: string }) {
  return <div className="rounded-lg border border-line p-4"><p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-chalk-3">{title}</p><p className="mt-1 font-display text-[22px] font-bold">{main}</p><p className="mt-2 text-[13px] leading-[1.45] text-chalk-3">{text}</p></div>;
}
