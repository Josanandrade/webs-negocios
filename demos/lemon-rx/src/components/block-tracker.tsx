"use client";

import { useEffect, useId, useOptimistic, useRef, useState, useTransition } from "react";
import { deleteBlockResult, saveBlockNote, saveBlockResult, setBlockDone } from "@/app/(app)/actions";
import { Segmented } from "@/components/segmented";
import { RankingRows, ordinal } from "@/components/ranking-rows";
import { Toast, useToast } from "@/components/toast";
import { DIVISIONS, SCORE_TYPES, divisionLabel, emptyDraft, formatScore, parseScore, type ScoreDraft } from "@/lib/scores";

const SCORE_LABEL = Object.fromEntries(SCORE_TYPES.map((t) => [t.value, t.label]));
import type { Block, BlockLog, BlockResult, Division, LeaderboardRow } from "@/lib/types";

export type BlockView = Block & {
  log: BlockLog | null;
  result: BlockResult | null;
  board: LeaderboardRow[];
};

type Notify = (text: string, tone?: "ok" | "error") => void;

/** Seguimiento de un bloque por el atleta: hecho/pendiente, resultado con ranking y nota privada. */
export function BlockTracker({ block, meId, notify }: { block: BlockView; meId: string; notify: Notify }) {
  const scored = block.score_type !== "none";
  const [resultOpen, setResultOpen] = useState(false);
  const done = block.log?.done ?? false;

  return (
    <section>
      <div className="flex items-start justify-between gap-3">
        {block.title ? (
          <h3 className="pt-3 font-display text-[15px] font-bold uppercase tracking-[0.12em] text-lemon">{block.title}</h3>
        ) : (
          <span />
        )}
        <DoneToggle
          blockId={block.id}
          done={done}
          label={block.title || "este bloque"}
          notify={notify}
          // En un bloque con ranking, marcarlo como hecho abre la ventana del resultado.
          onBeforeDone={scored && !block.result ? () => setResultOpen(true) : undefined}
        />
      </div>
      {block.content && (
        <p className="workout-text mt-2 text-[19px] leading-[1.55] text-chalk sm:text-[20px]">{block.content}</p>
      )}
      {scored && <ResultPanel block={block} meId={meId} onEdit={() => setResultOpen(true)} />}
      <NotePanel blockId={block.id} note={block.log?.note ?? ""} notify={notify} />
      {scored && (
        <ResultDialog open={resultOpen} block={block} done={done} notify={notify} onClose={() => setResultOpen(false)} />
      )}
    </section>
  );
}

// ------------------------------------------------------------------ hecho

function DoneToggle({
  blockId,
  done,
  label,
  notify,
  onBeforeDone,
}: {
  blockId: string;
  done: boolean;
  label: string;
  notify: Notify;
  onBeforeDone?: () => void;
}) {
  const [optimistic, setOptimistic] = useOptimistic(done);
  const [, startTransition] = useTransition();

  function toggle() {
    const next = !optimistic;
    if (next && onBeforeDone) return onBeforeDone();
    startTransition(async () => {
      setOptimistic(next);
      const r = await setBlockDone(blockId, next);
      if (!r.ok) notify(r.error, "error");
    });
  }

  return (
    <button
      type="button"
      aria-pressed={optimistic}
      aria-label={`Marcar ${label} como hecho`}
      onClick={toggle}
      className={`press flex h-11 shrink-0 items-center gap-2 rounded-sm px-3 font-display text-[14px] font-bold uppercase tracking-[0.06em] ${
        optimistic ? "bg-lemon text-lemon-ink" : "border border-line-strong text-chalk-2 hover:text-chalk"
      }`}
    >
      <span
        aria-hidden
        className={`flex h-[18px] w-[18px] items-center justify-center rounded-[3px] ${
          optimistic ? "bg-lemon-ink text-lemon" : "border-2 border-chalk-3"
        }`}
      >
        {optimistic && (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        )}
      </span>
      {optimistic ? "Hecho" : "Marcar hecho"}
    </button>
  );
}

// ------------------------------------------------------------------ resultado y ranking

function ResultPanel({ block, meId, onEdit }: { block: BlockView; meId: string; onEdit: () => void }) {
  const [showBoard, setShowBoard] = useState(false);
  const mine = block.board.find((r) => r.user_id === meId);
  const result = block.result;

  return (
    <div className="mt-5 rounded-sm border border-line bg-ink-2">
      {result ? (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <div>
            <p className="eyebrow">Tu resultado · {divisionLabel(result.division)}</p>
            <p className="mt-1 font-display text-[28px] font-bold leading-none">{formatScore(block.score_type, result)}</p>
          </div>
          <div className="flex items-center gap-4">
            {mine && (
              <p className="text-right">
                <span className="block font-display text-[28px] font-extrabold leading-none text-lemon">{ordinal(mine.position)}</span>
                <span className="text-[13px] text-chalk-3">de {mine.total}</span>
              </p>
            )}
            <button type="button" onClick={onEdit} className="press h-11 px-1 text-[15px] font-semibold text-chalk-2 hover:text-chalk">
              Editar
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3">
          <button type="button" onClick={onEdit} className="btn-primary w-full sm:w-auto">
            Añadir mi resultado
          </button>
        </div>
      )}

      <div className="border-t border-line">
        <button
          type="button"
          aria-expanded={showBoard}
          onClick={() => setShowBoard((v) => !v)}
          className="day-trigger flex h-12 w-full items-center justify-between px-4 text-left text-[15px] font-semibold text-chalk-2"
        >
          <span>
            Clasificación del día{" "}
            <span className="ml-1 text-chalk-3">
              {block.board.length}
              <span className="sr-only"> {block.board.length === 1 ? "resultado" : "resultados"}</span>
            </span>
          </span>
          <span aria-hidden className="text-chalk-3">{showBoard ? "Ocultar" : "Ver"}</span>
        </button>
        {showBoard && <Leaderboard block={block} meId={meId} initial={result?.division ?? "rx"} />}
      </div>
    </div>
  );
}

function Leaderboard({ block, meId, initial }: { block: BlockView; meId: string; initial: Division }) {
  const [division, setDivision] = useState<Division>(initial);
  const rows = block.board.filter((r) => r.division === division);
  const count = (d: Division) => block.board.filter((r) => r.division === d).length;

  return (
    <div className="enter px-4 pb-4">
      <div role="tablist" aria-label="Categoría" className="grid grid-cols-2 border-b border-line">
        {DIVISIONS.map((d) => {
          const active = d.value === division;
          return (
            <button
              key={d.value}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setDivision(d.value)}
              className={`press relative h-11 font-display text-[15px] font-bold uppercase tracking-[0.06em] ${
                active ? "text-chalk" : "text-chalk-3 hover:text-chalk-2"
              }`}
            >
              {d.label} <span className="font-semibold text-chalk-3">{count(d.value)}</span>
              {active && <span aria-hidden className="absolute inset-x-2 -bottom-px h-[3px] bg-lemon" />}
            </button>
          );
        })}
      </div>
      {rows.length === 0 ? (
        <p className="py-4 text-[15px] text-chalk-3">Todavía nadie ha subido resultado en {divisionLabel(division)}.</p>
      ) : (
        <RankingRows rows={rows} type={block.score_type} meId={meId} />
      )}
    </div>
  );
}

/** Ventana emergente para subir o editar el resultado de un bloque con ranking. */
function ResultDialog({
  open,
  block,
  done,
  notify,
  onClose,
}: {
  open: boolean;
  block: BlockView;
  done: boolean;
  notify: Notify;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // "Hecho" sin resultado: para quien no quiere entrar en la clasificación.
  async function skip() {
    setBusy(true);
    const r = await setBlockDone(block.id, true);
    setBusy(false);
    if (!r.ok) return notify(r.error, "error");
    notify("Marcado como hecho");
    onClose();
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={`res-${block.id}`}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onClose();
      }}
      className="confirm-dialog m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-md border border-line-strong bg-ink-2 p-0 text-chalk"
    >
      {open && (
        <div className="pt-5">
          <div className="px-4">
            <p className="eyebrow">{block.title || "Bloque"} · {SCORE_LABEL[block.score_type]}</p>
            <h2 id={`res-${block.id}`} className="mt-1 font-display text-[26px] font-bold uppercase leading-tight">
              {block.result ? "Editar tu resultado" : "¡Hecho! ¿Cuál ha sido tu resultado?"}
            </h2>
          </div>
          <ResultForm block={block} onDone={onClose} notify={notify} />
          {!done && !block.result && (
            <div className="border-t border-line px-4 py-3">
              <button
                type="button"
                onClick={skip}
                disabled={busy}
                className="press h-11 text-[15px] font-semibold text-chalk-3 hover:text-chalk"
              >
                {busy ? "Un momento…" : "Marcar como hecho sin resultado"}
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

function ResultForm({ block, onDone, notify }: { block: BlockView; onDone: () => void; notify: Notify }) {
  const id = useId();
  const [division, setDivision] = useState<Division | null>(block.result?.division ?? null);
  const [draft, setDraft] = useState<ScoreDraft>(() => emptyDraft(block.result));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const set = (patch: Partial<ScoreDraft>) => setDraft((d) => ({ ...d, ...patch }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!division) return setError("Elige si lo hiciste en RX o en Intermedio.");
    const parsed = parseScore(block.score_type, draft);
    if (!parsed.ok) return setError(parsed.error);
    setError(null);
    startTransition(async () => {
      const r = await saveBlockResult(block.id, division, draft);
      if (!r.ok) return setError(r.error);
      notify("Resultado guardado");
      onDone();
    });
  }

  function remove() {
    if (!window.confirm("¿Borrar tu resultado? Saldrás de la clasificación de este día.")) return;
    startTransition(async () => {
      const r = await deleteBlockResult(block.id);
      if (!r.ok) return setError(r.error);
      notify("Resultado borrado");
      onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 px-4 py-4" noValidate>
      <div>
        <p className="label">¿Cómo lo hiciste?</p>
        <Segmented
          label="Categoría"
          value={division}
          onChange={setDivision}
          options={[
            { value: "rx", label: "RX", tone: "ok" },
            { value: "intermediate", label: "Intermedio", tone: "ok" },
          ]}
        />
        <p className="mt-1.5 text-[13px] text-chalk-3">Intermedio si adaptaste algún movimiento, repeticiones o peso.</p>
      </div>

      {block.score_type === "time" && (
        <>
          {!draft.capped && (
            <div>
              <p className="label">Tiempo</p>
              <div className="flex items-center gap-2">
                <NumberField id={`${id}-min`} label="min" name="Minutos" value={draft.min} onChange={(v) => set({ min: v })} autoFocus />
                <span className="font-display text-[24px] font-bold text-chalk-3">:</span>
                <NumberField id={`${id}-sec`} label="seg" name="Segundos" value={draft.sec} onChange={(v) => set({ sec: v })} />
              </div>
            </div>
          )}
          <label className="flex min-h-11 items-center gap-3 text-[16px]">
            <input
              type="checkbox"
              checked={draft.capped}
              onChange={(e) => set({ capped: e.target.checked })}
              className="h-5 w-5 accent-[var(--color-lemon)]"
            />
            No terminé dentro del time cap
          </label>
          {draft.capped && (
            <div>
              <p className="label">Reps totales al llegar al cap</p>
              <NumberField id={`${id}-reps`} label="reps" name="Reps" value={draft.reps} onChange={(v) => set({ reps: v })} autoFocus />
            </div>
          )}
        </>
      )}

      {block.score_type === "rounds_reps" && (
        <div>
          <p className="label">Rondas completas + reps extra</p>
          <div className="flex items-center gap-2">
            <NumberField id={`${id}-rounds`} label="rondas" name="Rondas" value={draft.rounds} onChange={(v) => set({ rounds: v })} autoFocus />
            <span className="font-display text-[24px] font-bold text-chalk-3">+</span>
            <NumberField id={`${id}-reps`} label="reps" name="Reps" value={draft.reps} onChange={(v) => set({ reps: v })} />
          </div>
        </div>
      )}

      {block.score_type === "reps" && (
        <div>
          <p className="label">Reps o calorías</p>
          <NumberField id={`${id}-reps`} label="total" name="Reps o calorías" value={draft.reps} onChange={(v) => set({ reps: v })} autoFocus />
        </div>
      )}

      {block.score_type === "weight" && (
        <div>
          <p className="label">Peso</p>
          <NumberField id={`${id}-kg`} label="kg" name="Kilos" value={draft.kg} onChange={(v) => set({ kg: v })} decimal autoFocus />
        </div>
      )}

      {error && (
        <p role="alert" className="border-l-2 border-danger pl-3 text-[15px] text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Guardando…" : "Guardar resultado"}
        </button>
        <button type="button" className="btn-ghost" onClick={onDone} disabled={pending}>
          Cancelar
        </button>
        {block.result && (
          <button type="button" onClick={remove} disabled={pending} className="press ml-auto h-11 text-[14px] font-semibold text-danger/80 hover:text-danger">
            Borrar
          </button>
        )}
      </div>
    </form>
  );
}

function NumberField({
  id,
  label,
  name,
  value,
  onChange,
  decimal,
  autoFocus,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  decimal?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative w-28">
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={decimal ? "decimal" : "numeric"}
        autoComplete="off"
        autoFocus={autoFocus}
        aria-label={name}
        maxLength={decimal ? 8 : 6}
        className="field pr-14 font-display text-[22px] font-bold"
      />
      <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-chalk-3">
        {label}
      </span>
    </div>
  );
}

// ------------------------------------------------------------------ nota

function NotePanel({ blockId, note, notify }: { blockId: string; note: string; notify: Notify }) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function open() {
    setDraft(note);
    setError(null);
    setEditing(true);
  }

  function save() {
    startTransition(async () => {
      const r = await saveBlockNote(blockId, draft);
      if (!r.ok) return setError(r.error);
      notify(draft.trim() ? "Nota guardada" : "Nota borrada");
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div className="mt-4">
        <label htmlFor={id} className="label">
          Tu nota
        </label>
        <textarea
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          maxLength={2000}
          autoFocus
          placeholder="¿Cómo te ha ido? Sensaciones, pesos, qué adaptaste…"
          className="field resize-y py-3 leading-[1.5]"
        />
        <p className="mt-1.5 text-[13px] text-chalk-3">Solo la ves tú y los coaches.</p>
        {error && (
          <p role="alert" className="mt-2 border-l-2 border-danger pl-3 text-[15px] text-danger">
            {error}
          </p>
        )}
        <div className="mt-3 flex gap-3">
          <button type="button" className="btn-secondary" onClick={save} disabled={pending}>
            {pending ? "Guardando…" : "Guardar nota"}
          </button>
          <button type="button" className="btn-ghost" onClick={() => setEditing(false)} disabled={pending}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (note) {
    return (
      <div className="mt-4 border-l-2 border-line-strong pl-3">
        <p className="eyebrow">Tu nota</p>
        <p className="mt-1 whitespace-pre-wrap text-[16px] leading-[1.5] text-chalk-2">{note}</p>
        <button type="button" onClick={open} className="press -ml-1 mt-1 h-11 px-1 text-[15px] font-semibold text-chalk-3 hover:text-chalk">
          Editar nota
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={open} className="press -ml-1 mt-3 h-11 px-1 text-[15px] font-semibold text-chalk-3 hover:text-chalk">
      + Añadir nota
    </button>
  );
}

/** Botón "Poner mi resultado" para la pantalla de Ranking: abre la misma ventana que el bloque. */
export function ResultButton({ block }: { block: BlockView }) {
  const [open, setOpen] = useState(false);
  const { toast, show } = useToast();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={block.result ? "btn-secondary" : "btn-primary"}>
        {block.result ? "Editar mi resultado" : "Poner mi resultado"}
      </button>
      <ResultDialog open={open} block={block} done={block.log?.done ?? false} notify={show} onClose={() => setOpen(false)} />
      <Toast toast={toast} className="bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8" />
    </>
  );
}
