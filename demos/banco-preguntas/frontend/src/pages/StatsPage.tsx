import { useState } from "react";
import { Link } from "react-router";
import { api } from "../api/client";
import type { Breakdown, DocumentInfo, Stats } from "../api/types";
import { BarList } from "../components/charts";
import { LineChart } from "../components/charts";
import { ButtonLink, Card, Empty, ErrorBox, inputClass, Loading, PageTitle, Stat } from "../components/ui";
import { useAsync } from "../lib/hooks";
import { DIFFICULTY, formatDate, pct, score } from "../lib/labels";

function detail(b: Breakdown) {
  return `${b.correct} aciertos, ${b.wrong} fallos, ${b.blank} en blanco de ${b.answered}`;
}

export function StatsPage() {
  const docs = useAsync((signal) => api<DocumentInfo[]>("/api/documents", { signal }), []);
  const [docId, setDocId] = useState("");
  const stats = useAsync((signal) => api<Stats>("/api/stats", { signal, query: { document_id: docId } }), [docId]);
  const s = stats.data;

  return (
    <>
      <PageTitle
        subtitle="Tu progreso a partir de los tests entregados y de lo respondido en práctica."
        actions={
          (docs.data?.length ?? 0) > 1 ? (
            <select className={inputClass} value={docId} onChange={(e) => setDocId(e.target.value)} aria-label="Documento">
              <option value="">Todos los documentos</option>
              {docs.data!.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          ) : undefined
        }
      >
        Estadísticas
      </PageTitle>

      {stats.loading && !s ? (
        <Loading />
      ) : stats.error ? (
        <ErrorBox error={stats.error} onRetry={stats.reload} />
      ) : !s || s.totals.answered === 0 ? (
        <Empty title="Todavía no hay datos">
          Haz tu primer test para ver aquí tu evolución.{" "}
          <Link to="/tests/nuevo" className="font-medium text-brand-700 underline dark:text-brand-200">
            Empezar
          </Link>
        </Empty>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Nota media" value={score(s.average_score)} hint={s.best_score !== null ? `Mejor: ${score(s.best_score)}` : undefined} />
            <Stat label="Tests entregados" value={s.quizzes_finished} hint={s.quizzes_in_progress ? `${s.quizzes_in_progress} en curso` : undefined} />
            <Stat label="Aciertos" value={pct(s.totals.accuracy)} hint={`${s.totals.answered} respuestas`} />
            <Stat label="Dominadas" value={s.coverage.mastered} hint={`de ${s.coverage.active_questions} preguntas`} />
          </div>

          {s.scores.length > 0 && (
            <Card>
              <h2 className="font-medium">Evolución de la nota</h2>
              <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Últimos {s.scores.length} tests entregados, sobre 10</p>
              <LineChart
                points={s.scores.map((p) => ({ label: `${p.title} · ${formatDate(p.finished_at)}`, value: p.score }))}
                max={10}
                reference={5}
                referenceLabel="Aprobado"
                format={(v) => score(v)}
                ariaLabel={`Evolución de la nota: ${s.scores.map((p) => score(p.score)).join(", ")}`}
              />
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-slate-600 dark:text-slate-400">Ver como tabla</summary>
                <table className="mt-2 w-full text-left">
                  <thead className="text-xs text-slate-500">
                    <tr>
                      <th className="py-1 font-medium">Test</th>
                      <th className="py-1 font-medium">Fecha</th>
                      <th className="py-1 text-right font-medium">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.scores.map((p) => (
                      <tr key={p.quiz_id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="py-1">
                          <Link to={`/tests/${p.quiz_id}`} className="hover:underline">
                            {p.title}
                          </Link>
                        </td>
                        <td className="py-1 text-slate-500">{formatDate(p.finished_at)}</td>
                        <td className="py-1 text-right tabular-nums">{score(p.score)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card>
              <h2 className="font-medium">Aciertos por tema</h2>
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Primero los que más necesitas repasar</p>
              <BarList bars={s.by_topic.map((b) => ({ key: b.key ?? "none", label: b.title ?? "Sin tema", value: b.accuracy, detail: detail(b) }))} format={pct} />
            </Card>
            <div className="space-y-5">
              <Card>
                <h2 className="mb-4 font-medium">Aciertos por dificultad</h2>
                <BarList
                  bars={s.by_difficulty.map((b) => ({ key: b.key ?? "x", label: DIFFICULTY[b.key ?? ""] ?? "—", value: b.accuracy, detail: detail(b) }))}
                  format={pct}
                />
              </Card>
              <Card>
                <h2 className="font-medium">Tu banco de preguntas</h2>
                <div
                  className="mt-3 h-3 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/50"
                  role="meter"
                  aria-valuenow={s.coverage.mastered}
                  aria-valuemin={0}
                  aria-valuemax={s.coverage.active_questions}
                  aria-label="Preguntas dominadas"
                >
                  <div
                    className="h-full rounded-r-[4px]"
                    style={{ width: `${(s.coverage.mastered / Math.max(1, s.coverage.active_questions)) * 100}%`, background: "var(--chart-series)" }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Dominadas: acertadas las dos últimas veces</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Vistas</dt>
                    <dd className="text-lg font-semibold">{s.coverage.seen}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Sin ver</dt>
                    <dd className="text-lg font-semibold">{s.coverage.unseen}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Dominadas</dt>
                    <dd className="text-lg font-semibold">{s.coverage.mastered}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">A repasar</dt>
                    <dd className="text-lg font-semibold">{s.coverage.to_review}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.coverage.to_review > 0 && <ButtonLink to="/tests/nuevo?selection=failed">Repasar falladas</ButtonLink>}
                  {s.coverage.unseen > 0 && (
                    <ButtonLink to="/tests/nuevo?selection=unseen" variant="secondary">
                      Practicar las no vistas
                    </ButtonLink>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {s.most_failed.length > 0 && (
            <Card>
              <h2 className="mb-3 font-medium">Preguntas que más fallas</h2>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {s.most_failed.map((f, i) => (
                  <li key={f.question_id ?? i} className="flex items-start justify-between gap-3 py-2 text-sm">
                    <div className="min-w-0">
                      {f.question_id ? (
                        <Link to={`/banco/${f.question_id}`} className="hover:underline">
                          {f.stem}
                        </Link>
                      ) : (
                        f.stem
                      )}
                      {f.top_section_title && <div className="truncate text-xs text-slate-500">{f.top_section_title}</div>}
                    </div>
                    <span className="shrink-0 tabular-nums text-slate-600 dark:text-slate-400">
                      {f.wrong} de {f.attempts}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
