import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { api } from "../api/client";
import type { DocumentInfo, Page, Question, Section } from "../api/types";
import { Badge, Button, Card, Empty, ErrorBox, inputClass, Loading, PageTitle } from "../components/ui";
import { useAction, useAsync } from "../lib/hooks";
import { DIFFICULTY, QUESTION_STATUS } from "../lib/labels";

const PAGE = 25;

export function statusTone(s: string) {
  return s === "manually_reviewed" ? "green" : s === "discarded" ? "red" : s === "auto_validated" ? "brand" : "slate";
}

export function BankPage() {
  const [params, setParams] = useSearchParams();
  const f = Object.fromEntries(params.entries());
  const offset = Number(f.offset ?? 0);
  const [q, setQ] = useState(f.q ?? "");
  const [selected, setSelected] = useState<string[]>([]);

  const docs = useAsync((signal) => api<DocumentInfo[]>("/api/documents", { signal }), []);
  const sections = useAsync(
    (signal) => (f.document_id ? api<Section[]>(`/api/documents/${f.document_id}/sections`, { signal }) : Promise.resolve([])),
    [f.document_id],
  );
  const list = useAsync(
    (signal) =>
      api<Page<Question>>("/api/questions", {
        signal,
        query: { document_id: f.document_id, section_id: f.section_id, status: f.status, difficulty: f.difficulty, tag: f.tag, q: f.q, limit: PAGE, offset },
      }),
    [params.toString()],
  );
  const tags = useAsync((signal) => api<[string, number][]>("/api/questions/tags", { signal }), []);

  useEffect(() => setSelected([]), [params]);

  function set(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "document_id") next.delete("section_id");
    if (key !== "offset") next.delete("offset");
    setParams(next);
  }

  const bulk = useAction(async (action: string, extra: Record<string, string> = {}) => {
    await api("/api/questions/bulk", { method: "POST", body: { ids: selected, action, ...extra } });
    setSelected([]);
    list.reload();
    tags.reload();
  });

  const items = list.data?.items ?? [];
  const allSelected = items.length > 0 && items.every((i) => selected.includes(i.id));

  return (
    <>
      <PageTitle subtitle="Todas las preguntas generadas, con su fuente en el temario. Revísalas, edítalas o descártalas.">Banco de preguntas</PageTitle>

      <Card className="mb-4">
        <form
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            set("q", q.trim());
          }}
        >
          <input
            type="search"
            className={`${inputClass} sm:col-span-2 lg:col-span-3`}
            placeholder="Buscar en enunciados y opciones…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => q.trim() !== (f.q ?? "") && set("q", q.trim())}
            aria-label="Buscar"
          />
          <select className={inputClass} value={f.document_id ?? ""} onChange={(e) => set("document_id", e.target.value)} aria-label="Documento">
            <option value="">Todos los documentos</option>
            {docs.data?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={f.section_id ?? ""}
            onChange={(e) => set("section_id", e.target.value)}
            disabled={!f.document_id}
            aria-label="Tema"
          >
            <option value="">{f.document_id ? "Todos los temas" : "Tema (elige documento)"}</option>
            {sections.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-1">
            <select className={inputClass} value={f.status ?? ""} onChange={(e) => set("status", e.target.value)} aria-label="Estado">
              <option value="">Activas</option>
              <option value="auto_validated">Verificadas</option>
              <option value="manually_reviewed">Revisadas</option>
              <option value="discarded">Descartadas</option>
            </select>
            <select className={inputClass} value={f.difficulty ?? ""} onChange={(e) => set("difficulty", e.target.value)} aria-label="Dificultad">
              <option value="">Toda dificultad</option>
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="hard">Difícil</option>
            </select>
          </div>
          {!!tags.data?.length && (
            <select className={inputClass} value={f.tag ?? ""} onChange={(e) => set("tag", e.target.value)} aria-label="Etiqueta">
              <option value="">Todas las etiquetas</option>
              {tags.data.map(([t, n]) => (
                <option key={t} value={t}>
                  {t} ({n})
                </option>
              ))}
            </select>
          )}
        </form>
      </Card>

      {selected.length > 0 && (
        <div className="sticky top-16 z-[5] mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-900 p-3 text-sm text-white shadow-lg md:top-4 dark:bg-slate-800">
          <span className="mr-auto">{selected.length} seleccionadas</span>
          <Button variant="secondary" busy={bulk.busy} onClick={() => bulk.run("approve")}>
            Aprobar
          </Button>
          <Button variant="secondary" busy={bulk.busy} onClick={() => bulk.run(f.status === "discarded" ? "restore" : "discard")}>
            {f.status === "discarded" ? "Restaurar" : "Descartar"}
          </Button>
          <Button
            variant="secondary"
            busy={bulk.busy}
            onClick={() => {
              const tag = window.prompt("Etiqueta a añadir");
              if (tag?.trim()) bulk.run("add_tag", { tag: tag.trim() });
            }}
          >
            Etiquetar
          </Button>
        </div>
      )}
      <ErrorBox error={bulk.error} />

      {list.loading && !list.data ? (
        <Loading />
      ) : list.error ? (
        <ErrorBox error={list.error} onRetry={list.reload} />
      ) : !items.length ? (
        <Empty title="No hay preguntas con estos filtros">
          {params.size ? "Prueba a quitar algún filtro." : <Link className="underline" to="/documentos">Sube un documento y genera preguntas.</Link>}
        </Empty>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand-600"
                checked={allSelected}
                onChange={() => setSelected(allSelected ? [] : items.map((i) => i.id))}
              />
              Seleccionar página
            </label>
            <span>{list.data!.total} preguntas</span>
          </div>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <input
                  type="checkbox"
                  aria-label={`Seleccionar pregunta ${item.seq}`}
                  className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
                  checked={selected.includes(item.id)}
                  onChange={() => setSelected((s) => (s.includes(item.id) ? s.filter((x) => x !== item.id) : [...s, item.id]))}
                />
                <Link to={`/banco/${item.id}`} className="min-w-0 flex-1">
                  <p className="font-medium">{item.stem}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    <span className="sr-only">Respuesta correcta: </span>✓ {item.options.find((o) => o.is_correct)?.text}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone={statusTone(item.status)}>{QUESTION_STATUS[item.status]}</Badge>
                    <Badge>{DIFFICULTY[item.difficulty]}</Badge>
                    {item.section_title && <Badge>{item.section_title.slice(0, 40)}</Badge>}
                    {item.tags.map((t) => (
                      <Badge key={t} tone="amber">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <Button variant="secondary" disabled={offset === 0} onClick={() => set("offset", String(Math.max(0, offset - PAGE)))}>
              Anterior
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {offset + 1}–{offset + items.length} de {list.data!.total}
            </span>
            <Button variant="secondary" disabled={offset + PAGE >= list.data!.total} onClick={() => set("offset", String(offset + PAGE))}>
              Siguiente
            </Button>
          </div>
        </>
      )}
    </>
  );
}
