import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../api/client";
import type { Quiz, QuizQuestion } from "../api/types";
import { IconCheck, IconChevronLeft, IconChevronRight, IconClock, IconX } from "../components/icons";
import { Badge, Button, Card, ErrorBox, Loading, Modal } from "../components/ui";
import { useAction, useAsync } from "../lib/hooks";
import { score } from "../lib/labels";

export function QuizPage() {
  const { id = "" } = useParams();
  const quiz = useAsync((signal) => api<Quiz>(`/api/quizzes/${id}`, { signal }), [id]);
  if (quiz.loading && !quiz.data) return <Loading />;
  if (quiz.error) return <ErrorBox error={quiz.error} onRetry={quiz.reload} />;
  const q = quiz.data!;
  return q.status === "in_progress" ? (
    <TakeQuiz quiz={q} setQuiz={quiz.setData} reload={quiz.reload} />
  ) : (
    <Results quiz={q} />
  );
}

// ------------------------------------------------------------------ hacer el test
function TakeQuiz({ quiz, setQuiz, reload }: { quiz: Quiz; setQuiz: (q: Quiz) => void; reload: () => void }) {
  const firstPending = quiz.questions.findIndex((q) => !q.answered);
  const [current, setCurrent] = useState(firstPending >= 0 ? firstPending : 0);
  const [confirm, setConfirm] = useState(false);
  const practice = quiz.mode === "practice";
  const question = quiz.questions[current];
  const answered = quiz.questions.filter((q) => q.answered).length;

  const answer = useAction(async (label: string | null) => {
    const updated = await api<QuizQuestion>(`/api/quizzes/${quiz.id}/questions/${question.ordinal}`, {
      method: "PUT",
      body: { selected_label: label },
    });
    setQuiz({ ...quiz, questions: quiz.questions.map((q) => (q.ordinal === updated.ordinal ? updated : q)) });
    if (!practice && label && current < quiz.questions.length - 1) setCurrent(current + 1);
  });
  const finish = useAction(async () => {
    setQuiz(await api<Quiz>(`/api/quizzes/${quiz.id}/finish`, { method: "POST" }));
  });

  const locked = practice && question.answered;
  const choose = useCallback(
    (label: string) => {
      if (answer.busy || locked) return;
      if (!practice && question.selected_label === label) return;
      answer.run(label);
    },
    [answer, locked, practice, question.selected_label],
  );

  // Teclado: 1-4 o A-D para responder, flechas para moverse.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey) return;
      const k = e.key.toUpperCase();
      const idx = "1234".indexOf(k) >= 0 ? "1234".indexOf(k) : "ABCD".indexOf(k);
      if (idx >= 0 && question.options[idx]) choose(question.options[idx].label);
      else if (e.key === "ArrowRight") setCurrent((c) => Math.min(quiz.questions.length - 1, c + 1));
      else if (e.key === "ArrowLeft") setCurrent((c) => Math.max(0, c - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, question, quiz.questions.length]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-semibold">{quiz.title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {answered} de {quiz.total} respondidas · {practice ? "Práctica" : "Examen"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quiz.expires_at && quiz.remaining_seconds !== null && <Countdown seconds={quiz.remaining_seconds} onExpire={reload} />}
          <Button variant="secondary" onClick={() => setConfirm(true)}>
            Entregar
          </Button>
        </div>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" aria-hidden="true">
        <div className="h-full bg-brand-500 transition-all" style={{ width: `${(answered / quiz.total) * 100}%` }} />
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Pregunta {current + 1} de {quiz.total}
          </span>
          {question.top_section_title && <span className="truncate">· {question.top_section_title}</span>}
        </div>
        <h2 className="text-lg font-medium leading-snug">{question.stem}</h2>
        <ul className="mt-4 space-y-2" role="radiogroup" aria-label="Opciones">
          {question.options.map((o) => (
            <li key={o.label}>
              <OptionButton
                label={o.label}
                text={o.text}
                selected={question.selected_label === o.label}
                state={
                  question.revealed
                    ? o.label === question.correct_label
                      ? "correct"
                      : o.label === question.selected_label
                        ? "wrong"
                        : "idle"
                    : "idle"
                }
                disabled={locked || answer.busy}
                onClick={() => choose(o.label)}
              />
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <ErrorBox error={answer.error} />
        </div>

        {question.revealed && <Feedback q={question} />}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" disabled={current === 0} onClick={() => setCurrent(current - 1)} aria-label="Anterior">
            <IconChevronLeft /> <span className="hidden sm:inline">Anterior</span>
          </Button>
          {!question.answered || !practice ? (
            <Button
              variant="ghost"
              busy={answer.busy && !question.selected_label}
              disabled={practice ? false : !question.selected_label}
              onClick={() => answer.run(null)}
            >
              {practice ? "No lo sé" : "Dejar en blanco"}
            </Button>
          ) : (
            <span />
          )}
          {current < quiz.total - 1 ? (
            <Button variant={question.answered ? "primary" : "ghost"} onClick={() => setCurrent(current + 1)} aria-label="Siguiente">
              <span className="hidden sm:inline">Siguiente</span> <IconChevronRight />
            </Button>
          ) : (
            <Button onClick={() => setConfirm(true)}>Entregar</Button>
          )}
        </div>
      </Card>

      <Navigator quiz={quiz} current={current} onGo={setCurrent} />

      <Modal open={confirm} onClose={() => setConfirm(false)} title="¿Entregar el test?">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {quiz.total - answered > 0
            ? `Te quedan ${quiz.total - answered} preguntas sin responder: contarán en blanco (no restan).`
            : "Has respondido todas las preguntas."}
        </p>
        <ErrorBox error={finish.error} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Seguir
          </Button>
          <Button busy={finish.busy} onClick={() => finish.run()}>
            Entregar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function OptionButton({
  label,
  text,
  selected,
  state,
  disabled,
  onClick,
}: {
  label: string;
  text: string;
  selected: boolean;
  state: "idle" | "correct" | "wrong";
  disabled: boolean;
  onClick: () => void;
}) {
  const styles =
    state === "correct"
      ? "bg-emerald-50 ring-2 ring-emerald-500 dark:bg-emerald-950/40"
      : state === "wrong"
        ? "bg-red-50 ring-2 ring-red-500 dark:bg-red-950/40"
        : selected
          ? "bg-brand-50 ring-2 ring-brand-500 dark:bg-brand-900/30"
          : "bg-white ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled && state === "idle" && !selected}
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors disabled:cursor-default ${styles}`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          state === "correct"
            ? "bg-emerald-600 text-white"
            : state === "wrong"
              ? "bg-red-600 text-white"
              : selected
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
        }`}
      >
        {state === "correct" ? <IconCheck /> : state === "wrong" ? <IconX /> : label}
      </span>
      <span className="pt-0.5">
        {text}
        {state === "correct" && <span className="sr-only"> (respuesta correcta)</span>}
        {state === "wrong" && <span className="sr-only"> (tu respuesta, incorrecta)</span>}
      </span>
    </button>
  );
}

function Feedback({ q }: { q: QuizQuestion }) {
  const verdict = q.selected_label === null ? "blank" : q.is_correct ? "correct" : "wrong";
  return (
    <div
      aria-live="polite"
      className={`mt-4 rounded-xl p-4 text-sm ${
        verdict === "correct"
          ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
          : verdict === "wrong"
            ? "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100"
            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
      }`}
    >
      <p className="font-semibold">
        {verdict === "correct" ? "¡Correcto!" : verdict === "wrong" ? `Incorrecto. La respuesta es la ${q.correct_label}.` : `En blanco. La respuesta es la ${q.correct_label}.`}
      </p>
      {q.source_quote && (
        <p className="mt-1">
          <span className="font-medium">Página {q.source_page}:</span> «{q.source_quote}»
        </p>
      )}
    </div>
  );
}

function Navigator({ quiz, current, onGo }: { quiz: Quiz; current: number; onGo: (i: number) => void }) {
  return (
    <nav aria-label="Preguntas del test" className="mt-4">
      <ol className="flex flex-wrap gap-1.5">
        {quiz.questions.map((q, i) => {
          const tone = q.revealed
            ? q.is_correct
              ? "bg-emerald-600 text-white"
              : q.selected_label
                ? "bg-red-600 text-white"
                : "bg-slate-400 text-white"
            : q.answered
              ? "bg-brand-600 text-white"
              : "bg-white ring-1 ring-slate-300 dark:bg-slate-900 dark:ring-slate-700";
          const state = q.revealed ? (q.is_correct ? "acertada" : q.selected_label ? "fallada" : "en blanco") : q.answered ? "respondida" : "sin responder";
          return (
            <li key={q.ordinal}>
              <button
                onClick={() => onGo(i)}
                aria-current={i === current ? "step" : undefined}
                aria-label={`Pregunta ${i + 1}, ${state}`}
                className={`h-9 w-9 rounded-lg text-sm font-medium tabular-nums ${tone} ${i === current ? "outline-2 outline-offset-2 outline-brand-500" : ""}`}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Countdown({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const deadline = useMemo(() => Date.now() + seconds * 1000, [seconds]);
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) {
        window.clearInterval(id);
        onExpire(); // el servidor entrega el examen al consultarlo
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [deadline, onExpire]);
  const m = Math.floor(left / 60);
  const s = left % 60;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium tabular-nums ${
        left < 60 ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" : "bg-slate-100 dark:bg-slate-800"
      }`}
      role="timer"
      aria-label={`Quedan ${m} minutos y ${s} segundos`}
    >
      <IconClock /> {m}:{String(s).padStart(2, "0")}
    </span>
  );
}

// ------------------------------------------------------------------- resultados
function Results({ quiz }: { quiz: Quiz }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "wrong" | "blank">("all");
  const retry = useAction(async () => {
    const q = await api<Quiz>(`/api/quizzes/${quiz.id}/retry`, { method: "POST" });
    navigate(`/tests/${q.id}`);
  });
  const pass = (quiz.score ?? 0) >= 5;
  const shown = quiz.questions.filter((q) =>
    filter === "all" ? true : filter === "blank" ? q.selected_label === null : q.selected_label !== null && !q.is_correct,
  );
  const penaltyText = quiz.penalty === 0 ? "sin penalización" : `cada fallo resta ${quiz.penalty > 0.3 && quiz.penalty < 0.34 ? "1/3" : score(quiz.penalty)}`;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/tests" className="mb-2 inline-block text-sm text-slate-600 hover:underline dark:text-slate-400">
        ← Tests
      </Link>
      <Card className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">{quiz.title}</p>
        <p className={`mt-2 text-5xl font-bold tabular-nums ${pass ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
          {score(quiz.score)}
          <span className="text-xl font-medium text-slate-500"> / 10</span>
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/40">
            <div className="text-xl font-semibold tabular-nums">{quiz.correct}</div>aciertos
          </div>
          <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950/40">
            <div className="text-xl font-semibold tabular-nums">{quiz.wrong}</div>fallos
          </div>
          <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
            <div className="text-xl font-semibold tabular-nums">{quiz.blank}</div>en blanco
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Neto {score(quiz.net)} de {quiz.total} ({penaltyText}; en blanco no resta)
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {(quiz.wrong ?? 0) + (quiz.blank ?? 0) > 0 && (
            <Button busy={retry.busy} onClick={() => retry.run()}>
              Repasar fallos
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate("/tests/nuevo")}>
            Nuevo test
          </Button>
        </div>
        <div className="mt-3 text-left">
          <ErrorBox error={retry.error} />
        </div>
      </Card>

      <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">Corrección</h2>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800" role="tablist">
          {(
            [
              ["all", "Todas"],
              ["wrong", "Falladas"],
              ["blank", "En blanco"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={filter === k}
              onClick={() => setFilter(k)}
              className={`rounded-md px-3 py-1 ${filter === k ? "bg-white shadow-sm dark:bg-slate-950" : "text-slate-600 dark:text-slate-400"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ul className="space-y-3">
        {shown.map((q) => (
          <li key={q.ordinal}>
            <Card>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold">{q.ordinal}.</span>
                <Badge tone={q.selected_label === null ? "slate" : q.is_correct ? "green" : "red"}>
                  {q.selected_label === null ? "En blanco" : q.is_correct ? "Acertada" : "Fallada"}
                </Badge>
                {q.top_section_title && <span className="truncate text-slate-500">{q.top_section_title}</span>}
              </div>
              <p className="font-medium">{q.stem}</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {q.options.map((o) => {
                  const isCorrect = o.label === q.correct_label;
                  const mine = o.label === q.selected_label;
                  return (
                    <li
                      key={o.label}
                      className={`flex gap-2 rounded-lg px-2 py-1.5 ${
                        isCorrect ? "bg-emerald-50 dark:bg-emerald-950/40" : mine ? "bg-red-50 dark:bg-red-950/40" : ""
                      }`}
                    >
                      <span className="w-4 font-semibold">{o.label}</span>
                      <span className="flex-1">{o.text}</span>
                      {isCorrect && <span className="shrink-0 text-emerald-700 dark:text-emerald-300">✓ correcta</span>}
                      {mine && !isCorrect && <span className="shrink-0 text-red-700 dark:text-red-300">tu respuesta</span>}
                    </li>
                  );
                })}
              </ul>
              {q.source_quote && (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Página {q.source_page}:</span> «{q.source_quote}»
                </p>
              )}
              {q.question_id && (
                <Link to={`/banco/${q.question_id}`} className="mt-2 inline-block text-xs text-brand-700 underline dark:text-brand-200">
                  Ver en el banco
                </Link>
              )}
            </Card>
          </li>
        ))}
        {!shown.length && <p className="text-sm text-slate-500">Nada que mostrar con este filtro.</p>}
      </ul>
    </div>
  );
}
