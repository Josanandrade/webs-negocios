import type { WeekStatus } from "@/lib/types";

export function StatusDot({ status }: { status: WeekStatus | null }) {
  const color = status === "published" ? "bg-lemon" : status === "draft" ? "bg-chalk-3" : "border border-chalk-3";
  return <span aria-hidden className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />;
}

export function WeekStatusLabel({ status }: { status: WeekStatus }) {
  return (
    <span className="inline-flex items-center gap-2 font-display text-[15px] font-bold uppercase tracking-[0.08em]">
      <StatusDot status={status} />
      <span className={status === "published" ? "text-lemon" : "text-chalk-2"}>
        {status === "published" ? "Publicada" : "Borrador"}
      </span>
    </span>
  );
}
