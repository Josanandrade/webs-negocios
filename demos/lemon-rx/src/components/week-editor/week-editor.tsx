"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { flushSync } from "react-dom";
import { deleteWeek, saveWeek, setWeekStatus, type DayInput } from "@/app/(app)/admin/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Toast, useToast } from "@/components/toast";
import { WeekStatusLabel } from "@/components/status-dot";
import { DAY_NAMES, shortDate, weekDates, weekRangeLong, weekRangeSentence } from "@/lib/dates";
import type { WeekStatus, WeekWithDays } from "@/lib/types";
import { BlockEditor, type EditableBlock } from "./block-editor";
import { AddBlock } from "./add-block";

type DaysState = Record<string, EditableBlock[]>;

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Fallback para contextos no seguros (p. ej. probar por IP en la red local).
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16),
  );
}

function initialState(week: WeekWithDays): DaysState {
  const state: DaysState = {};
  for (const date of weekDates(week.start_date)) {
    const day = week.days.find((d) => d.date === date);
    state[date] = (day?.workout_blocks ?? []).map((b) => ({ id: b.id, title: b.title, content: b.content }));
  }
  return state;
}

function snapshot(days: DaysState) {
  return JSON.stringify(
    Object.entries(days).map(([date, blocks]) => [
      date,
      blocks.filter((b) => b.title.trim() || b.content.trim()).map((b) => [b.id, b.title, b.content]),
    ]),
  );
}

/** Transición de vista para reordenar/añadir/quitar bloques, si el navegador la soporta. */
function withViewTransition(update: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "startViewTransition" in document) {
    document.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}

export function WeekEditor({ week, today }: { week: WeekWithDays; today: string }) {
  const router = useRouter();
  const dates = useMemo(() => weekDates(week.start_date), [week.start_date]);
  const [days, setDays] = useState<DaysState>(() => initialState(week));
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(initialState(week)));
  const [status, setStatus] = useState<WeekStatus>(week.status);
  const [active, setActive] = useState(() => {
    if (dates.includes(today)) return today;
    return dates.find((d) => (initialState(week)[d] ?? []).length > 0) ?? dates[0];
  });
  const [confirm, setConfirm] = useState<null | "publish" | "unpublish" | "delete">(null);
  const [saving, startSaving] = useTransition();
  const [busy, setBusy] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const { toast, show } = useToast();

  const dirty = snapshot(days) !== savedSnapshot;
  const daysRef = useRef(days);
  useEffect(() => {
    daysRef.current = days;
  }, [days]);

  // Aviso al salir con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const persist = useCallback(async () => {
    const current = daysRef.current;
    const payload: DayInput[] = Object.entries(current).map(([date, blocks]) => ({ date, blocks }));
    const result = await saveWeek(week.id, payload);
    if (result.ok) {
      setSavedSnapshot(snapshot(current));
    }
    return result;
  }, [week.id]);

  const save = useCallback(() => {
    startSaving(async () => {
      const result = await persist();
      if (result.ok) show(status === "published" ? "Cambios guardados y visibles" : "Borrador guardado");
      else show(result.error, "error");
    });
  }, [persist, show, status]);

  // Cmd/Ctrl + S guarda.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, saving]);

  async function changeStatus(next: WeekStatus) {
    setBusy(true);
    if (dirty) {
      const saved = await persist();
      if (!saved.ok) {
        setBusy(false);
        setConfirm(null);
        show(saved.error, "error");
        return;
      }
    }
    const result = await setWeekStatus(week.id, next);
    setBusy(false);
    setConfirm(null);
    if (!result.ok) return show(result.error, "error");
    setStatus(next);
    show(next === "published" ? "Semana publicada" : "Semana despublicada. Vuelve a ser borrador.");
    router.refresh();
  }

  async function removeWeek() {
    setBusy(true);
    const result = await deleteWeek(week.id);
    if (!result.ok) {
      setBusy(false);
      setConfirm(null);
      return show(result.error, "error");
    }
    router.replace("/admin/programacion");
  }

  // ---- edición de bloques
  const blocks = days[active] ?? [];

  function updateBlocks(date: string, fn: (b: EditableBlock[]) => EditableBlock[], animate = false) {
    const apply = () => setDays((prev) => ({ ...prev, [date]: fn(prev[date] ?? []) }));
    if (animate) withViewTransition(apply);
    else apply();
  }

  function addBlock(title: string) {
    const id = newId();
    setFocusId(id);
    updateBlocks(active, (b) => [...b, { id, title, content: "" }], true);
  }

  function move(index: number, delta: -1 | 1) {
    updateBlocks(
      active,
      (b) => {
        const target = index + delta;
        if (target < 0 || target >= b.length) return b;
        const next = [...b];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      },
      true,
    );
  }

  const range = weekRangeSentence(week.start_date);
  const filledDays = dates.filter((d) => (days[d] ?? []).some((b) => b.title.trim() || b.content.trim())).length;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-56 pt-4 md:px-6 md:pb-36 md:pt-8">
      <Link
        href="/admin/programacion"
        className="press -ml-1 inline-flex h-11 items-center gap-2 px-1 text-[15px] font-semibold text-chalk-3 hover:text-chalk"
      >
        <span aria-hidden>←</span> Semanas
      </Link>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <p className="eyebrow">Semana</p>
          <h1 className="mt-1 font-display text-[34px] font-extrabold uppercase leading-[0.95] md:text-[44px]">
            {weekRangeLong(week.start_date)}
          </h1>
        </div>
        <WeekStatusLabel status={status} />
      </div>

      {/* Selector de día */}
      <div role="tablist" aria-label="Días de la semana" className="mt-8 grid grid-cols-7 border-b border-line">
        {dates.map((date, i) => {
          const isActive = date === active;
          const has = (days[date] ?? []).some((b) => b.title.trim() || b.content.trim());
          return (
            <button
              key={date}
              role="tab"
              type="button"
              id={`tab-${date}`}
              aria-selected={isActive}
              aria-controls="panel-dia"
              onClick={() => setActive(date)}
              className={`press relative flex h-16 flex-col items-center justify-center gap-0.5 ${
                isActive ? "text-chalk" : "text-chalk-3 hover:text-chalk-2"
              }`}
            >
              <span className="font-display text-[15px] font-bold uppercase tracking-[0.06em]">
                <span className="sm:hidden">{DAY_NAMES[i].slice(0, 2)}</span>
                <span className="hidden sm:inline">{DAY_NAMES[i].slice(0, 3)}</span>
              </span>
              <span className="font-display text-[20px] font-semibold leading-none">{Number(date.slice(8))}</span>
              <span
                aria-hidden
                className={`absolute right-1/2 top-2 h-1.5 w-1.5 translate-x-[1.1rem] rounded-full ${has ? "bg-lemon" : "bg-transparent"}`}
              />
              <span className="sr-only">{has ? ", con sesión" : ", vacío"}</span>
              {isActive && <span aria-hidden className="absolute inset-x-1 -bottom-px h-[3px] bg-lemon" />}
            </button>
          );
        })}
      </div>

      <section id="panel-dia" role="tabpanel" aria-labelledby={`tab-${active}`} className="pt-6">
        <h2 className="font-display text-[28px] font-bold uppercase leading-none">
          {DAY_NAMES[dates.indexOf(active)]}{" "}
          <span className="text-chalk-3">{shortDate(active)}</span>
        </h2>

        {blocks.length === 0 && (
          <p className="mt-4 text-[16px] text-chalk-3">
            Sin sesión. Añade un bloque para empezar; los días vacíos no se muestran como entrenamiento.
          </p>
        )}

        <ol className="mt-6 space-y-4">
          {blocks.map((block, index) => (
            <BlockEditor
              key={block.id}
              block={block}
              index={index}
              total={blocks.length}
              autoFocus={block.id === focusId}
              onChange={(patch) =>
                updateBlocks(active, (b) => b.map((x) => (x.id === block.id ? { ...x, ...patch } : x)))
              }
              onMove={(delta) => move(index, delta)}
              onDelete={() => updateBlocks(active, (b) => b.filter((x) => x.id !== block.id), true)}
            />
          ))}
        </ol>

        <AddBlock onAdd={addBlock} />
      </section>

      {/* Barra de acciones: siempre a mano, encima de la navegación inferior en móvil. */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-line bg-ink/95 backdrop-blur-sm md:bottom-0 md:pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-3xl grid-cols-2 items-center gap-x-3 gap-y-2 px-4 py-3 md:flex md:px-6">
          <p className="col-span-2 min-w-0 text-[14px] leading-tight text-chalk-3 md:mr-auto" aria-live="polite">
            {saving ? (
              "Guardando…"
            ) : dirty ? (
              <span className="text-chalk">● Cambios sin guardar</span>
            ) : (
              <>
                {filledDays} {filledDays === 1 ? "día" : "días"} con sesión ·{" "}
                {status === "published" ? "visible para los usuarios" : "solo lo veis los admins"}
              </>
            )}
          </p>
          <button type="button" className="btn-secondary whitespace-nowrap px-4" onClick={save} disabled={saving || busy || !dirty}>
            Guardar
          </button>
          {status === "draft" ? (
            <button
              type="button"
              className="btn-primary whitespace-nowrap px-4"
              onClick={() => setConfirm("publish")}
              disabled={saving || busy || filledDays === 0}
            >
              Publicar semana
            </button>
          ) : (
            <button type="button" className="btn-secondary whitespace-nowrap px-4" onClick={() => setConfirm("unpublish")} disabled={saving || busy}>
              Despublicar
            </button>
          )}
        </div>
      </div>

      {status === "draft" && (
        <div className="mt-16 border-t border-line pt-6">
          <button type="button" className="btn-ghost -ml-5 text-danger/80" onClick={() => setConfirm("delete")}>
            Eliminar borrador
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirm === "publish"}
        title={`¿Quieres publicar la programación de la semana del ${range}?`}
        body={`Los usuarios con acceso podrán verla en cuanto la publiques.${dirty ? " Se guardarán también los cambios pendientes." : ""}`}
        confirmLabel="Publicar semana"
        busy={busy}
        onConfirm={() => changeStatus("published")}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "unpublish"}
        title={`¿Despublicar la semana del ${range}?`}
        body="Volverá a ser un borrador y los usuarios dejarán de verla."
        confirmLabel="Despublicar"
        danger
        busy={busy}
        onConfirm={() => changeStatus("draft")}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        title="¿Eliminar este borrador?"
        body="Se borrará la semana y todo su contenido. No se puede deshacer."
        confirmLabel="Eliminar"
        danger
        busy={busy}
        onConfirm={removeWeek}
        onCancel={() => setConfirm(null)}
      />

      <Toast toast={toast} className="bottom-[calc(11rem+env(safe-area-inset-bottom))] md:bottom-24" />
    </main>
  );
}
