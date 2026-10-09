import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../api/client";
import type { Question, Source } from "../api/types";
import { Badge, Button, Card, ErrorBox, Field, inputClass, Loading, Modal } from "../components/ui";
import { useAction, useAsync } from "../lib/hooks";
import { DIFFICULTY, formatDate, QUESTION_STATUS } from "../lib/labels";
import { statusTone } from "./BankPage";

export function QuestionPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const q = useAsync((signal) => api<Question>(`/api/questions/${id}`, { signal }), [id]);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = useAction(async (body: Record<string, unknown>) => {
    q.setData(await api<Question>(`/api/questions/${id}`, { method: "PATCH", body }));
    setEditing(false);
  });
  const remove = useAction(async () => {
    await api(`/api/questions/${id}`, { method: "DELETE" });
    navigate(-1);
  });

  if (q.loading && !q.data) return <Loading />;
  if (q.error) return <ErrorBox error={q.error} onRetry={q.reload} />;
  const question = q.data!;
  const sourceFor = (label: string) => question.sources?.find((s) => s.option_label === label);
  const gen = question.generation as Record<string, unknown> | null;

  return (
    <>
      <button onClick={() => navigate(-1)} className="mb-2 text-sm text-slate-600 hover:underline dark:text-slate-400">
        ← Volver
      </button>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">#{question.seq}</span>
        <Badge tone={statusTone(question.status)}>{QUESTION_STATUS[question.status]}</Badge>
        <Badge>{DIFFICULTY[question.difficulty]}</Badge>
        {question.tags.map((t) => (
          <Badge key={t} tone="amber">
            #{t}
          </Badge>
        ))}
      </div>
      <h1 className="text-lg font-semibold sm:text-xl">{question.stem}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        <Link to={`/documentos/${question.document_id}`} className="hover:underline">
          {question.document_title}
        </Link>
        {question.section_title && <> · {question.section_title}</>}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {question.status !== "manually_reviewed" && question.status !== "discarded" && (
          <Button busy={patch.busy} onClick={() => patch.run({ status: "manually_reviewed" })}>
            Aprobar
          </Button>
        )}
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Editar
        </Button>
        {question.status === "discarded" ? (
          <Button variant="secondary" busy={patch.busy} onClick={() => patch.run({ status: "auto_validated" })}>
            Restaurar
          </Button>
        ) : (
          <Button variant="secondary" busy={patch.busy} onClick={() => patch.run({ status: "discarded" })}>
            Descartar
          </Button>
        )}
        <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
          Eliminar
        </Button>
      </div>
      <div className="mt-3">
        <ErrorBox error={patch.error} />
      </div>

      <h2 className="mb-2 mt-6 font-medium">Opciones y su origen en el temario</h2>
      <ul className="space-y-3">
        {question.options.map((o) => (
          <li key={o.label}>
            <Card className={o.is_correct ? "ring-2 ring-emerald-500 dark:ring-emerald-600" : ""}>
              <div className="flex gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    o.is_correct ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800"
                  }`}
                >
                  {o.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {o.text}
                    {o.is_correct && <span className="ml-2 text-sm font-normal text-emerald-700 dark:text-emerald-300">Correcta</span>}
                  </p>
                  <SourceQuote source={sourceFor(o.label)} />
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {gen && (
        <Card className="mt-6">
          <h2 className="mb-2 font-medium">Cómo se generó</h2>
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Redactó</dt>
              <dd>{String(gen.generator_version ?? gen.generator ?? "—")}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Verificó a ciegas</dt>
              <dd>{String(gen.verifier_version ?? gen.verifier ?? "—")}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Confianza del verificador</dt>
              <dd>{question.confidence !== null ? `${Math.round(question.confidence * 100)} %` : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Creada</dt>
              <dd>{formatDate(question.created_at)}</dd>
            </div>
          </dl>
        </Card>
      )}

      {!!question.history?.length && (
        <Card className="mt-4">
          <h2 className="mb-2 font-medium">Historial de cambios</h2>
          <ul className="space-y-2 text-sm">
            {question.history
              .slice()
              .reverse()
              .map((h, i) => (
                <li key={i}>
                  <span className="text-slate-500">{formatDate(h.at)}:</span>{" "}
                  {Object.entries(h.changes)
                    .map(([k, v]) => (Array.isArray(v) ? `${k}: «${String(v[0])}» → «${String(v[1])}»` : `${k}: ${String(v)}`))
                    .join(" · ")}
                </li>
              ))}
          </ul>
        </Card>
      )}

      {editing && <EditModal question={question} busy={patch.busy} error={patch.error} onClose={() => setEditing(false)} onSave={patch.run} />}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="¿Eliminar la pregunta?">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Se borra del banco definitivamente. Si solo no quieres que salga en los tests, descártala.
        </p>
        <ErrorBox error={remove.error} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button variant="danger" busy={remove.busy} onClick={() => remove.run()}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}

/** Cita resaltada dentro del texto que la rodea en la página ("ver fragmento original"). */
export function SourceQuote({ source }: { source?: Source }) {
  const [open, setOpen] = useState(false);
  if (!source) return null;
  return (
    <div className="mt-2 text-sm">
      <p className="text-slate-600 dark:text-slate-400">
        <span className="font-medium text-slate-700 dark:text-slate-300">Página {source.page_number}:</span> «{source.quote}»
      </p>
      {(source.context_before || source.context_after) && (
        <>
          <button onClick={() => setOpen(!open)} className="mt-1 text-xs text-brand-700 underline dark:text-brand-200">
            {open ? "Ocultar contexto" : "Ver contexto en el temario"}
          </button>
          {open && (
            <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:bg-slate-950 dark:text-slate-400">
              …{source.context_before}
              <mark className="rounded bg-amber-200 px-0.5 text-slate-900 dark:bg-amber-500/40 dark:text-amber-50">{source.quote}</mark>
              {source.context_after}…
            </p>
          )}
        </>
      )}
    </div>
  );
}

function EditModal({
  question,
  busy,
  error,
  onClose,
  onSave,
}: {
  question: Question;
  busy: boolean;
  error: unknown;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => void;
}) {
  const [stem, setStem] = useState(question.stem);
  const [options, setOptions] = useState(question.options.map((o) => ({ label: o.label, text: o.text })));
  const [correct, setCorrect] = useState(question.options.find((o) => o.is_correct)!.label);
  const [explanation, setExplanation] = useState(question.explanation ?? "");
  const [difficulty, setDifficulty] = useState(question.difficulty);
  const [tags, setTags] = useState(question.tags.join(", "));

  function save() {
    onSave({
      stem,
      options,
      correct_label: correct,
      explanation,
      difficulty,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  return (
    <Modal open onClose={onClose} title="Editar pregunta">
      <div className="max-h-[70dvh] space-y-3 overflow-y-auto pr-1">
        <Field label="Enunciado">
          <textarea className={inputClass} rows={3} value={stem} onChange={(e) => setStem(e.target.value)} />
        </Field>
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium">Opciones (marca la correcta)</legend>
          {options.map((o, i) => (
            <div key={o.label} className="flex items-start gap-2">
              <input
                type="radio"
                name="correct"
                aria-label={`Opción ${o.label} correcta`}
                checked={correct === o.label}
                onChange={() => setCorrect(o.label)}
                className="mt-3 accent-emerald-600"
              />
              <span className="mt-2 w-4 text-sm font-semibold">{o.label}</span>
              <textarea
                rows={2}
                className={inputClass}
                value={o.text}
                onChange={(e) => setOptions(options.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
              />
            </div>
          ))}
        </fieldset>
        <Field label="Explicación">
          <textarea className={inputClass} rows={3} value={explanation} onChange={(e) => setExplanation(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dificultad">
            <select className={inputClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value as Question["difficulty"])}>
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="hard">Difícil</option>
            </select>
          </Field>
          <Field label="Etiquetas" hint="Separadas por comas">
            <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
        </div>
        <p className="text-xs text-slate-500">Editar el contenido marca la pregunta como revisada y queda en el historial.</p>
        <ErrorBox error={error} />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button busy={busy} onClick={save}>
          Guardar
        </Button>
      </div>
    </Modal>
  );
}
