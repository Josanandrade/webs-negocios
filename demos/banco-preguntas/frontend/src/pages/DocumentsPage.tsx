import { type DragEvent, useRef, useState } from "react";
import { Link } from "react-router";
import { api, uploadFile } from "../api/client";
import type { DocumentInfo } from "../api/types";
import { IconUpload } from "../components/icons";
import { isActive, JobProgress } from "../components/JobProgress";
import { Badge, Card, Empty, ErrorBox, Loading, PageTitle, ProgressBar } from "../components/ui";
import { useAsync, useInterval } from "../lib/hooks";
import { DOC_STATUS, formatDate, formatSize } from "../lib/labels";

const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function DocumentsPage() {
  const docs = useAsync((signal) => api<DocumentInfo[]>("/api/documents", { signal }), []);
  const [upload, setUpload] = useState<{ name: string; progress: number } | null>(null);
  const [uploadError, setUploadError] = useState<unknown>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const processing = docs.data?.some((d) => isActive(d.latest_job)) ?? false;
  useInterval(docs.reload, 3000, processing);

  async function send(file: File) {
    setUploadError(null);
    setUpload({ name: file.name, progress: 0 });
    try {
      await uploadFile<DocumentInfo>("/api/documents", file, (p) => setUpload({ name: file.name, progress: p }));
      docs.reload();
    } catch (e) {
      setUploadError(e);
    } finally {
      setUpload(null);
      if (input.current) input.current.value = "";
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) send(file);
  }

  return (
    <>
      <PageTitle subtitle="Sube tu temario en PDF o Word. Se extrae el texto página a página (con OCR si está escaneado) y se detectan los temas.">
        Documentos
      </PageTitle>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mb-6 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragging ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-slate-300 dark:border-slate-700"
        }`}
      >
        {upload ? (
          <div className="mx-auto max-w-sm space-y-2">
            <p className="truncate text-sm font-medium">Subiendo {upload.name}…</p>
            <ProgressBar value={upload.progress * 100} max={100} label="Subida" />
          </div>
        ) : (
          <>
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200">
              <IconUpload />
            </div>
            <p className="text-sm">
              <button onClick={() => input.current?.click()} className="font-medium text-brand-700 underline dark:text-brand-200">
                Elige un archivo
              </button>{" "}
              <span className="hidden sm:inline">o arrástralo aquí</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">PDF o DOCX · hasta 150 MB</p>
          </>
        )}
        <input ref={input} type="file" accept={ACCEPT} className="hidden" onChange={(e) => e.target.files?.[0] && send(e.target.files[0])} />
      </div>
      <div className="mb-4">
        <ErrorBox error={uploadError} />
      </div>

      {docs.loading && !docs.data ? (
        <Loading />
      ) : docs.error ? (
        <ErrorBox error={docs.error} onRetry={docs.reload} />
      ) : !docs.data?.length ? (
        <Empty title="Aún no hay documentos">Sube tu temario para empezar.</Empty>
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          {docs.data.map((d) => (
            <li key={d.id}>
              <Card className="transition-shadow hover:shadow-md">
                <Link to={`/documentos/${d.id}`} className="block">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate font-medium">{d.title}</h2>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {d.page_count ? `${d.page_count} páginas · ` : ""}
                        {formatSize(d.size_bytes)} · {formatDate(d.created_at)}
                      </p>
                    </div>
                    <Badge tone={d.status === "ready" ? "green" : d.status === "error" ? "red" : "amber"}>{DOC_STATUS[d.status] ?? d.status}</Badge>
                  </div>
                  {d.latest_job && isActive(d.latest_job) && (
                    <div className="mt-3">
                      <JobProgress job={d.latest_job} />
                    </div>
                  )}
                  {d.status === "error" && d.error && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{d.error}</p>}
                  {d.status === "ready" && !isActive(d.latest_job) && (
                    <p className="mt-2 text-sm">
                      {d.question_count > 0 ? (
                        <span className="text-slate-600 dark:text-slate-400">{d.question_count} preguntas en el banco</span>
                      ) : (
                        <span className="font-medium text-brand-700 dark:text-brand-200">Siguiente paso: generar las preguntas →</span>
                      )}
                    </p>
                  )}
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
