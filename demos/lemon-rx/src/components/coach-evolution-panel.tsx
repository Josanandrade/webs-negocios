import Link from "next/link";
import type { CoachEvolution, EvolutionWindow } from "@/lib/evolution";

function value(n: number | null, suffix = "") {
  return n == null ? "—" : `${n.toLocaleString("es-ES", { maximumFractionDigits: 1 })}${suffix}`;
}

function averagePosition(position: number | null, participants: number | null) {
  if (position == null || participants == null) return "—";
  return `${Math.round(position)}/${Math.max(1, Math.round(participants))}`;
}

export function CoachEvolutionPanel({ evolution, weeks }: { evolution: CoachEvolution | null; weeks: EvolutionWindow }) {
  const athletes = [...(evolution?.athletes ?? [])].sort((a, b) => {
    const aa = a.current.compliance.pct ?? 101;
    const bb = b.current.compliance.pct ?? 101;
    return aa - bb || a.full_name.localeCompare(b.full_name, "es");
  });
  const complianceRows = athletes
    .filter((a) => a.current.compliance.programmed > 0)
    .sort((a, b) => a.current.compliance.completed - b.current.compliance.completed || (a.current.compliance.pct ?? 101) - (b.current.compliance.pct ?? 101) || a.full_name.localeCompare(b.full_name, "es"));

  return (
    <section className="mt-10" aria-labelledby="coach-evolution-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Seguimiento</p>
          <h2 id="coach-evolution-title" className="font-display text-[24px] font-bold uppercase">Evolución de atletas</h2>
        </div>
        <nav className="flex gap-1" aria-label="Periodo de evolución del panel">
          {([4, 8, 12] as EvolutionWindow[]).map((n) => (
            <Link key={n} href={`/admin?evolucion=${n}`} prefetch={false} className={`press rounded-md px-3 py-2 text-[13px] font-bold ${weeks === n ? "bg-lemon text-ink" : "bg-panel text-chalk-2"}`}>{n} sem</Link>
          ))}
        </nav>
      </div>

      {!evolution ? (
        <p className="mt-4 border-y border-line py-4 text-[15px] text-chalk-3">No se han podido cargar las métricas de evolución.</p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-line sm:grid-cols-3">
            <Stat label="Cumplimiento medio" value={value(evolution.summary.avg_compliance_pct, "%")} />
            <Stat label="Mejoran en WODs" value={String(evolution.summary.athletes_improving_wods)} />
            <Stat label="Mejoran algún RM" value={String(evolution.summary.athletes_improving_rm)} />
          </dl>

          <details className="mt-3 rounded-lg border border-line bg-panel px-4 py-3">
            <summary className="press cursor-pointer text-[14px] font-semibold text-lemon">Ver cumplimiento de usuarios ({complianceRows.length})</summary>
            {complianceRows.length === 0 ? (
              <p className="mt-3 text-[14px] text-chalk-3">Aún no hay usuarios con bloques programados en este periodo.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line border-t border-line">
                {complianceRows.map((a) => (
                  <li key={a.user_id}>
                    <Link href={`/admin/usuarios/${a.user_id}`} prefetch={false} className="day-trigger flex items-center justify-between gap-4 py-3">
                      <span className="min-w-0 truncate text-[15px] font-semibold">{a.full_name}</span>
                      <span className="shrink-0 text-right text-[13px] text-chalk-2">
                        {a.current.compliance.completed}/{a.current.compliance.programmed} · {value(a.current.compliance.pct, "%")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </details>

          {athletes.length === 0 ? (
            <p className="mt-4 text-[15px] text-chalk-3">Aún no hay atletas con datos suficientes en este periodo.</p>
          ) : (
            <div className="mt-5 overflow-hidden rounded-lg border border-line">
              <div className="hidden grid-cols-[1fr_110px_110px_120px] gap-3 border-b border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-chalk-3 md:grid">
                <span>Atleta</span><span>Cumplimiento</span><span>WOD</span><span>Fuerza</span>
              </div>
              <ul className="divide-y divide-line">
                {athletes.map((a) => (
                  <li key={a.user_id}>
                    <Link href={`/admin/usuarios/${a.user_id}`} prefetch={false} className="day-trigger grid gap-2 px-4 py-3 md:grid-cols-[1fr_110px_110px_120px] md:items-center md:gap-3">
                      <div className="min-w-0"><span className="block truncate text-[16px] font-semibold">{a.full_name}</span><span className="text-[12px] text-chalk-3">{a.current.compliance.completed}/{a.current.compliance.programmed} bloques hasta hoy</span></div>
                      <Cell label="Cumplimiento" value={value(a.current.compliance.pct, "%")} highlight={(a.current.compliance.pct ?? 100) < 60} />
                      <Cell label="WOD" value={a.current.wods.comparable ? averagePosition(a.current.wods.avg_position, a.current.wods.avg_participants) : "—"} />
                      <Cell label="Fuerza" value={`${a.current.strength.sessions}/${a.current.strength.programmed_sessions} sesiones`} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3 text-[12px] leading-[1.45] text-chalk-3">Ordenados por cumplimiento para detectar quién puede necesitar seguimiento. El cumplimiento solo cuenta bloques programados hasta hoy. La posición WOD media se calcula dentro de la misma división en los WODs comparables.</p>
        </>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="bg-ink px-4 py-4"><dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-chalk-3">{label}</dt><dd className="mt-1 font-display text-[28px] font-bold leading-none">{value}</dd></div>;
}

function Cell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="flex items-baseline justify-between gap-3 md:block"><span className="text-[11px] uppercase tracking-[0.05em] text-chalk-3 md:hidden">{label}</span><span className={`text-[14px] font-semibold ${highlight ? "text-lemon" : ""}`}>{value}</span></div>;
}
