import type { Job } from "../api/types";
import { JOB_STAGE } from "../lib/labels";
import { ProgressBar } from "./ui";

export function isActive(job: Job | null | undefined): boolean {
  return !!job && (job.status === "pending" || job.status === "running");
}

/** Progreso real de un trabajo largo (ingestión o generación). */
export function JobProgress({ job }: { job: Job }) {
  const paused = job.status === "pending" && (job.message ?? "").startsWith("En pausa");
  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <span className="font-medium">{paused ? "En pausa" : JOB_STAGE[job.stage] ?? job.stage}</span>
        {job.progress_total > 0 && (
          <span className="tabular-nums text-slate-500 dark:text-slate-400">
            {job.progress_current} / {job.progress_total}
          </span>
        )}
      </div>
      <ProgressBar value={job.progress_current} max={job.progress_total} label="Progreso" />
      {job.message && <p className="text-xs text-slate-600 dark:text-slate-400">{job.message}</p>}
    </div>
  );
}
