import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../api/client";
import type { CandidateSummary, Coverage, DocumentInfo, Job, PageSummary, Section } from "../api/types";
import { isActive, JobProgress } from "../components/JobProgress";
import { Badge, Button, ButtonLink, Card, ErrorBox, Field, inputClass, Loading, Modal, PageTitle } from "../components/ui";
import { useAction, useAsync, useInterval } from "../lib/hooks";
import { CANDIDATE_STATUS, DOC_STATUS, formatDate, reasonText } from "../lib/labels";

export function DocumentPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const doc = useAsync((signal) => api<DocumentInfo>(`/api/documents/${id}`, { signal }), [id]);
  const ready = doc.data?.status === "ready";
  const sections = useAsync((signal) => (ready ? api<Section[]>(`/api/documents/${id}/sections`, { signal }) : Promise.resolve([])), [id, ready]);
  const coverage = useAsync(
    (signal) => (ready ? api<Coverage>(`/api/documents/${id}/coverage`, { signal }) : Promise.resolve(undefined)),
    [id, ready],
  );
  const job = doc.data?.latest_job ?? null;
  const active = isActive(job);
  useInterval(() => {
    doc.reload();
    if (job?.kind !== "ingest") coverage.reload();
  }, 3000, active);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const remove = useAction(async () => {
    await api(`/api/documents/${id}`, { method: "DELETE" });
    navigate("/documentos");
  });
  const retry = useAction(async (jobId: string) => {
    await api(`/api/jobs/${jobId}/retry`, { method: "POST" });
    doc.reload();
  });

  if (doc.loading && !doc.data) return <Loading />;
  if (doc.error) return <ErrorBox error={doc.error} onRetry={doc.reload} />;
  const d = doc.data!;
  const stats = d.stats as Record<string, number | string | undefined>;

  return (
    <>
      <Link to="/documentos" className="mb-2 inline-block text-sm text-slate-600 hover:underline dark:text-slate-400">
        ← Documentos
      </Link>
      <PageTitle
        subtitle={
          <>
            {d.page_count ? `${d.page_count} páginas` : "Procesando"} · subido {formatDate(d.created_at)}
          </>
        }
        actions={
          <>
            {ready && <ButtonLink to={`/banco?document_id=${d.id}`} variant="secondary">Ver preguntas</ButtonLink>}
            <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
              Eliminar
            </Button>
          </>
        }
      >
        <span className="break-words">{d.title}</span> <Badge tone={ready ? "green" : d.status === "error" ? "red" : "amber"}>{DOC_STATUS[d.status]}</Badge>
      </PageTitle>

      {job && (active || job.status === "failed") && (
        <Card className="mb-5">
          <h2 className="mb-3 font-medium">{job.kind === "ingest" ? "Procesando el documento" : "Generando preguntas"}</h2>
          {job.status === "failed" ? (
            <div className="space-y-3">
              <ErrorBox error={job.last_error || "El trabajo ha fallado"} />
              <Button variant="secondary" busy={retry.busy} onClick={() => retry.run(job.id)}>
                Reanudar desde donde se quedó
              </Button>
            </div>
          ) : (
            <JobProgress job={job} />
          )}
        </Card>
      )}

      {ready && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-5">
            <GenerateCard doc={d} sections={sections.data ?? []} busy={active} onStarted={doc.reload} />
            {job?.kind === "generate" && job.status === "succeeded" && <GenerationReport job={job} />}
            {coverage.data && <CoverageCard coverage={coverage.data} />}
          </div>
          <div className="min-w-0 space-y-5">
            <Card>
              <h2 className="mb-3 font-medium">Calidad del texto</h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Kv k="Páginas aptas" v={`${stats.pages_eligible ?? "—"} / ${stats.pages ?? d.page_count}`} />
                <Kv k="Con OCR" v={stats.pages_ocr ?? 0} />
                <Kv k="Temas" v={stats.top_level_sections ?? "—"} />
                <Kv k="Fragmentos aptos" v={`${stats.chunks_eligible ?? "—"} / ${stats.chunks ?? "—"}`} />
              </dl>
              <PageQuality docId={d.id} />
            </Card>
            <Card>
              <h2 className="mb-3 font-medium">Temas detectados</h2>
              <SectionTree nodes={sections.data ?? []} />
            </Card>
          </div>
        </div>
      )}

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="¿Eliminar el documento?">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Se borrarán el documento, su texto y todas sus preguntas. Los tests ya hechos conservan su copia.
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

function Kv({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 dark:text-slate-400">{k}</dt>
      <dd className="font-medium tabular-nums">{v}</dd>
    </div>
  );
}

function PageQuality({ docId }: { docId: string }) {
  const [open, setOpen] = useState(false);
  const pages = useAsync((signal) => (open ? api<PageSummary[]>(`/api/documents/${docId}/pages`, { signal }) : Promise.resolve([])), [docId, open]);
  const bad = (pages.data ?? []).filter((p) => !p.is_eligible);
  return (
    <div className="mt-3 text-sm">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-brand-700 underline dark:text-brand-200">
          Ver páginas no aptas
        </button>
      ) : pages.loading ? (
        <Loading />
      ) : bad.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">Todas las páginas se pueden usar.</p>
      ) : (
        <ul className="space-y-1">
          {bad.map((p) => (
            <li key={p.page_number}>
              Página {p.page_number}: <span className="text-slate-600 dark:text-slate-400">{p.quality_flags.join(", ") || "calidad baja"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SectionTree({ nodes, depth = 0 }: { nodes: Section[]; depth?: number }) {
  if (!nodes.length) return depth === 0 ? <p className="text-sm text-slate-500">Sin temas</p> : null;
  return (
    <ul className={depth ? "ml-3 border-l border-slate-200 pl-3 dark:border-slate-800" : "space-y-2"}>
      {nodes.map((n) => (
        <li key={n.id} className="text-sm">
          {depth === 0 ? (
            <details>
              <summary className="cursor-pointer">
                <span className="font-medium">{n.title}</span>{" "}
                <span className="text-xs text-slate-500">
                  p. {n.start_page}–{n.end_page}
                </span>
              </summary>
              <div className="mt-1">
                <SectionTree nodes={n.children} depth={depth + 1} />
              </div>
            </details>
          ) : (
            <div className="py-0.5 text-slate-700 dark:text-slate-300">
              {n.title} <span className="text-xs text-slate-500">p. {n.start_page}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function GenerateCard({ doc, sections, busy, onStarted }: { doc: DocumentInfo; sections: Section[]; busy: boolean; onStarted: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [count, setCount] = useState("20");
  const [max, setMax] = useState(false);
  const [difficulty, setDifficulty] = useState("mixed");
  const start = useAction(async () => {
    await api<Job>(`/api/documents/${doc.id}/generate`, {
      method: "POST",
      body: { section_ids: selected.length ? selected : null, count: max ? null : Number(count), difficulty },
    });
    onStarted();
  });
  const toggle = (sid: string) => setSelected((s) => (s.includes(sid) ? s.filter((x) => x !== sid) : [...s, sid]));

  return (
    <Card>
      <h2 className="font-medium">Generar preguntas</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Cada pregunta sale de una cita literal del temario y la revisa un segundo modelo a ciegas. Ante la duda, se descarta: es
        normal que salgan menos de las pedidas.
      </p>
      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-medium">Temas</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={selected.length === 0} onClick={() => setSelected([])}>
            Todos
          </Chip>
          {sections.map((s) => (
            <Chip key={s.id} active={selected.includes(s.id)} onClick={() => toggle(s.id)} title={s.title}>
              {shortTitle(s.title)}
            </Chip>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Número de preguntas">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={500}
              className={inputClass}
              value={count}
              disabled={max}
              onChange={(e) => setCount(e.target.value)}
            />
            <label className="flex shrink-0 items-center gap-1.5 text-sm">
              <input type="checkbox" checked={max} onChange={(e) => setMax(e.target.checked)} className="accent-brand-600" /> Máximo
            </label>
          </div>
        </Field>
        <Field label="Dificultad">
          <select className={inputClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="mixed">Mezcla</option>
            <option value="easy">Fácil</option>
            <option value="medium">Media</option>
            <option value="hard">Difícil</option>
          </select>
        </Field>
      </div>
      <div className="mt-4">
        <ErrorBox error={start.error} />
      </div>
      <Button className="mt-4" busy={start.busy} disabled={busy || (!max && !(Number(count) >= 1))} onClick={() => start.run()}>
        {busy ? "Trabajo en curso…" : "Generar"}
      </Button>
    </Card>
  );
}

export function shortTitle(title: string): string {
  const m = title.match(/^(tema|unidad|cap[ií]tulo|bloque)\s*\d+/i);
  return m ? m[0].replace(/\s+/, " ") : title.length > 28 ? title.slice(0, 26) + "…" : title;
}

export function Chip({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ring-1 ${
        active
          ? "bg-brand-600 text-white ring-brand-600"
          : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function GenerationReport({ job }: { job: Job }) {
  const report = useAsync((signal) => api<CandidateSummary>(`/api/jobs/${job.id}/candidates`, { signal }), [job.id]);
  if (!report.data) return null;
  const total = Object.values(report.data.by_status).reduce((a, b) => a + b, 0);
  return (
    <Card>
      <h2 className="font-medium">Última generación</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {job.message} · {formatDate(job.finished_at)}
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {Object.entries(report.data.by_status)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => (
            <li key={k} className="flex justify-between gap-3">
              <span>{CANDIDATE_STATUS[k] ?? k}</span>
              <span className="tabular-nums text-slate-600 dark:text-slate-400">
                {v} de {total}
              </span>
            </li>
          ))}
      </ul>
      {report.data.top_reasons.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-slate-700 dark:text-slate-300">Motivos de descarte</summary>
          <ul className="mt-2 space-y-1">
            {report.data.top_reasons.map(([r, n]) => (
              <li key={r} className="flex justify-between gap-3">
                <span>{reasonText(r)}</span>
                <span className="tabular-nums text-slate-500">{n}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </Card>
  );
}

function CoverageCard({ coverage }: { coverage: Coverage }) {
  const max = Math.max(1, ...coverage.sections.map((s) => s.questions));
  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-medium">Preguntas por tema</h2>
        <span className="text-sm text-slate-600 dark:text-slate-400">{coverage.total_questions} en total</span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {coverage.sections.map((s) => (
          <li key={s.section_id ?? s.title} className="text-sm">
            <div className="flex justify-between gap-3">
              <span className="truncate" title={s.title}>
                {s.title}
              </span>
              <span className="shrink-0 tabular-nums font-medium">{s.questions}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${(s.questions / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      {coverage.low_coverage_sections.length > 0 && (
        <p className="mt-3 text-xs text-amber-800 dark:text-amber-200">Temas con poca cobertura: {coverage.low_coverage_sections.join(", ")}</p>
      )}
      {coverage.total_questions > 0 && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Posición de la respuesta correcta:{" "}
          {Object.entries(coverage.correct_label_distribution)
            .map(([l, n]) => `${l} ${n}`)
            .join(" · ")}
        </p>
      )}
    </Card>
  );
}
