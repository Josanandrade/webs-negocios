import { type ReactNode, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { api } from "../api/client";
import type { Difficulty, DocumentInfo, Quiz, QuizCreate, Section } from "../api/types";
import { Button, Card, ErrorBox, Field, inputClass, PageTitle } from "../components/ui";
import { useAction, useAsync } from "../lib/hooks";
import { Chip, shortTitle } from "./DocumentPage";

const SELECTIONS: { value: QuizCreate["selection"]; title: string; text: string }[] = [
  { value: "random", title: "Al azar", text: "Repartidas entre los temas" },
  { value: "unseen", title: "No vistas", text: "Las que nunca has respondido" },
  { value: "failed", title: "Falladas", text: "La última vez fallaste o dejaste en blanco" },
  { value: "weak", title: "Puntos débiles", text: "Primero las falladas y las de peor porcentaje" },
];

const PENALTIES = [
  { value: 1 / 3, label: "Cada fallo resta 1/3 (habitual con 4 opciones)" },
  { value: 0.25, label: "Cada fallo resta 1/4" },
  { value: 0, label: "Sin penalización" },
];

export function NewQuizPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialSelection = SELECTIONS.find((s) => s.value === params.get("selection"))?.value ?? "random";
  const docs = useAsync((signal) => api<DocumentInfo[]>("/api/documents", { signal }), []);
  const readyDocs = (docs.data ?? []).filter((d) => d.status === "ready");
  const [docId, setDocId] = useState("");
  const sections = useAsync((signal) => (docId ? api<Section[]>(`/api/documents/${docId}/sections`, { signal }) : Promise.resolve([])), [docId]);

  const [mode, setMode] = useState<QuizCreate["mode"]>("practice");
  const [selection, setSelection] = useState<QuizCreate["selection"]>(initialSelection);
  const [count, setCount] = useState(20);
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [penalty, setPenalty] = useState(1 / 3);
  const [minutes, setMinutes] = useState("");
  const [shuffle, setShuffle] = useState(false);
  const [onlyReviewed, setOnlyReviewed] = useState(false);

  useEffect(() => {
    if (!docId && readyDocs.length === 1) setDocId(readyDocs[0].id);
  }, [readyDocs, docId]);
  useEffect(() => setSectionIds([]), [docId]);

  const create = useAction(async () => {
    const body: QuizCreate = {
      selection,
      count,
      mode,
      penalty,
      document_ids: docId ? [docId] : undefined,
      section_ids: sectionIds.length ? sectionIds : undefined,
      difficulties: difficulties.length ? difficulties : undefined,
      time_limit_minutes: mode === "exam" && Number(minutes) > 0 ? Number(minutes) : undefined,
      shuffle_options: shuffle,
      only_reviewed: onlyReviewed,
    };
    const quiz = await api<Quiz>("/api/quizzes", { method: "POST", body });
    navigate(`/tests/${quiz.id}`, { replace: true });
  });

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <>
      <PageTitle>Nuevo test</PageTitle>
      <div className="space-y-4">
        <Card>
          <h2 className="mb-3 font-medium">Modo</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Choice active={mode === "practice"} onClick={() => setMode("practice")} title="Práctica">
              Ves la corrección al responder cada pregunta.
            </Choice>
            <Choice active={mode === "exam"} onClick={() => setMode("exam")} title="Examen">
              Sin ayudas: la corrección llega al entregar. Puedes poner tiempo límite.
            </Choice>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-medium">Preguntas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {readyDocs.length > 1 && (
              <Field label="Documento">
                <select className={inputClass} value={docId} onChange={(e) => setDocId(e.target.value)}>
                  <option value="">Todos</option>
                  {readyDocs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Número de preguntas">
              <input type="number" min={1} max={200} className={inputClass} value={count} onChange={(e) => setCount(Number(e.target.value))} />
            </Field>
          </div>
          {!!sections.data?.length && (
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-medium">Temas</legend>
              <div className="flex flex-wrap gap-2">
                <Chip active={!sectionIds.length} onClick={() => setSectionIds([])}>
                  Todos
                </Chip>
                {sections.data.map((s) => (
                  <Chip key={s.id} title={s.title} active={sectionIds.includes(s.id)} onClick={() => setSectionIds(toggle(sectionIds, s.id))}>
                    {shortTitle(s.title)}
                  </Chip>
                ))}
              </div>
            </fieldset>
          )}
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-medium">Dificultad</legend>
            <div className="flex flex-wrap gap-2">
              <Chip active={!difficulties.length} onClick={() => setDifficulties([])}>
                Todas
              </Chip>
              {(["easy", "medium", "hard"] as const).map((d) => (
                <Chip key={d} active={difficulties.includes(d)} onClick={() => setDifficulties(toggle(difficulties, d))}>
                  {{ easy: "Fácil", medium: "Media", hard: "Difícil" }[d]}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-medium">¿Cuáles?</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SELECTIONS.map((s) => (
                <Choice key={s.value} active={selection === s.value} onClick={() => setSelection(s.value)} title={s.title}>
                  {s.text}
                </Choice>
              ))}
            </div>
          </fieldset>
        </Card>

        <Card>
          <h2 className="mb-3 font-medium">Corrección</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Penalización por fallo" hint="Las preguntas en blanco no restan.">
              <select className={inputClass} value={penalty} onChange={(e) => setPenalty(Number(e.target.value))}>
                {PENALTIES.map((p) => (
                  <option key={p.label} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
            {mode === "exam" && (
              <Field label="Tiempo límite (minutos)" hint="Vacío = sin límite. Al acabarse, el examen se entrega solo.">
                <input type="number" min={1} max={600} className={inputClass} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
              </Field>
            )}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} />
              Barajar el orden de las opciones
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={onlyReviewed} onChange={(e) => setOnlyReviewed(e.target.checked)} />
              Solo preguntas que he revisado yo
            </label>
          </div>
        </Card>

        <ErrorBox error={create.error} />
        <div className="flex justify-end">
          <Button busy={create.busy} disabled={!(count >= 1)} onClick={() => create.run()} className="w-full sm:w-auto">
            Empezar
          </Button>
        </div>
      </div>
    </>
  );
}

function Choice({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl p-3 text-left ring-1 transition-colors ${
        active
          ? "bg-brand-50 ring-2 ring-brand-500 dark:bg-brand-900/30"
          : "bg-white ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800"
      }`}
    >
      <span className="block text-sm font-medium">{title}</span>
      <span className="mt-0.5 block text-xs text-slate-600 dark:text-slate-400">{children}</span>
    </button>
  );
}
