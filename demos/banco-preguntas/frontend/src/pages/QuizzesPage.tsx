import { Link } from "react-router";
import { api } from "../api/client";
import type { QuizSummary } from "../api/types";
import { Badge, ButtonLink, Card, Empty, ErrorBox, Loading, PageTitle } from "../components/ui";
import { useAsync } from "../lib/hooks";
import { formatDate, score } from "../lib/labels";

export function QuizzesPage() {
  const quizzes = useAsync((signal) => api<{ items: QuizSummary[]; total: number }>("/api/quizzes", { signal, query: { limit: 100 } }), []);
  const items = quizzes.data?.items ?? [];
  const inProgress = items.filter((q) => q.status === "in_progress");
  const finished = items.filter((q) => q.status === "finished");

  return (
    <>
      <PageTitle subtitle="Practica con corrección inmediata o haz un simulacro de examen." actions={<ButtonLink to="/tests/nuevo">Nuevo test</ButtonLink>}>
        Tests
      </PageTitle>
      {quizzes.loading && !quizzes.data ? (
        <Loading />
      ) : quizzes.error ? (
        <ErrorBox error={quizzes.error} onRetry={quizzes.reload} />
      ) : !items.length ? (
        <Empty title="Aún no has hecho ningún test">
          <Link to="/tests/nuevo" className="font-medium text-brand-700 underline dark:text-brand-200">
            Crea el primero
          </Link>
        </Empty>
      ) : (
        <div className="space-y-6">
          {inProgress.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">En curso</h2>
              <ul className="space-y-2">
                {inProgress.map((q) => (
                  <li key={q.id}>
                    <QuizRow quiz={q} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {finished.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Realizados</h2>
              <ul className="space-y-2">
                {finished.map((q) => (
                  <li key={q.id}>
                    <QuizRow quiz={q} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}

function QuizRow({ quiz }: { quiz: QuizSummary }) {
  const done = quiz.status === "finished";
  return (
    <Link to={`/tests/${quiz.id}`}>
      <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{quiz.title}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {formatDate(done ? quiz.finished_at : quiz.started_at)} ·{" "}
            {done ? `${quiz.correct} aciertos, ${quiz.wrong} fallos, ${quiz.blank} en blanco` : `${quiz.answered} de ${quiz.total} respondidas`}
          </p>
          <div className="mt-1.5">
            <Badge tone={quiz.mode === "exam" ? "amber" : "brand"}>{quiz.mode === "exam" ? "Examen" : "Práctica"}</Badge>
          </div>
        </div>
        {done ? (
          <div className="text-right">
            <div className={`text-2xl font-semibold tabular-nums ${(quiz.score ?? 0) >= 5 ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
              {score(quiz.score)}
            </div>
            <div className="text-xs text-slate-500">sobre 10</div>
          </div>
        ) : (
          <span className="text-sm font-medium text-brand-700 dark:text-brand-200">Continuar →</span>
        )}
      </Card>
    </Link>
  );
}
