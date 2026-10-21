import type { BuilderSection, ComplexMovementRow, StrengthSchemeRow } from "@/lib/types";

type SourceBlock = {
  content: string;
  sets_count: number | null;
  reps_per_set: number | null;
  movement_id: string | null;
  strength_scheme: StrengthSchemeRow[] | null;
  is_complex: boolean;
  complex_movements: ComplexMovementRow[] | null;
  is_emom: boolean;
  emom_reps: number | null;
  emom_interval_seconds: number | null;
  emom_rounds: number | null;
  emom_percentage: number | null;
  builder_sections: BuilderSection[] | null;
};

export function SocialBlockProgram({ block, movementNames }: { block: SourceBlock | null; movementNames: Record<string, string> }) {
  if (!block) return <p className="text-[14px] text-chalk-3">No se ha podido recuperar la programación original de este bloque.</p>;
  const sections = block.builder_sections ?? [];
  return <div className="space-y-3">
    {block.content && <p className="workout-text whitespace-pre-wrap text-[16px] leading-[1.55] text-chalk">{block.content}</p>}
    {sections.length > 0 ? sections.map((section) => <BuilderSectionDetail key={section.id} section={section} movementNames={movementNames} />) : <ClassicStrengthDetail block={block} movementNames={movementNames} />}
    {!block.content && sections.length === 0 && !hasClassicStrength(block) && <p className="text-[14px] text-chalk-3">Este bloque no tiene más detalle escrito.</p>}
  </div>;
}

function BuilderSectionDetail({ section, movementNames }: { section: BuilderSection; movementNames: Record<string, string> }) {
  const format = section.format ?? (section.count_type === "rounds" ? "rounds" : "sets");
  const count = section.count_min === section.count_max ? String(section.count_min) : `${section.count_min}–${section.count_max}`;
  const badge = format === "free" ? "Libre" : format === "emom" ? `EMOM · ${count} rondas${section.emom_interval_seconds ? ` · cada ${section.emom_interval_seconds}s` : ""}` : `${count} ${format}`;
  return <div className="rounded-sm border border-line bg-ink p-3">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-display text-[18px] font-bold uppercase">{section.label || "Bloque"}</p><p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-chalk-3">{badge}</p></div>
    <div className="mt-3 space-y-2.5">{section.items.map((item) => {
      if (item.type === "exercise") {
        const name = movementNames[item.movement_id] ?? "Movimiento";
        return <div key={item.id} className="text-[15px] leading-[1.45] text-chalk-2">
          {item.scheme?.length ? <><p><strong className="text-chalk">{name}</strong>{item.instruction ? ` · ${item.instruction}` : ""}</p><div className="mt-1 space-y-0.5">{item.scheme.map((row, i) => <p key={i}>{row.sets > 1 ? `${row.sets}×${row.reps}` : `${row.reps} reps`} · {fmt(row.percentage)}%</p>)}</div></> : <p><strong className="mr-2 text-lemon">{item.reps}</strong><strong className="text-chalk">{name}</strong>{pct(item.percentage_min, item.percentage_max)}{item.instruction ? ` · ${item.instruction}` : ""}</p>}
        </div>;
      }
      if (item.type === "complex") return <div key={item.id} className="border-l-2 border-lemon/60 pl-3"><p className="text-[12px] font-bold uppercase tracking-[0.06em] text-lemon">Complex</p><div className="mt-1 space-y-0.5">{item.movements.map((row, i) => <p key={i} className="text-[15px] text-chalk-2"><strong className="text-chalk">{row.reps}</strong> {movementNames[row.movement_id] ?? "Movimiento"}</p>)}</div>{pct(item.percentage_min, item.percentage_max) && <p className="mt-1 text-[13px] text-chalk-3">{pctText(item.percentage_min, item.percentage_max)}</p>}{item.instruction && <p className="mt-1 text-[14px] text-chalk-2">{item.instruction}</p>}{item.scheme?.length && <div className="mt-1 space-y-0.5 text-[13px] text-chalk-2">{item.scheme.map((row, i) => <p key={i}>{row.sets > 1 ? `${row.sets}×${row.reps}` : `${row.reps} reps`} · {fmt(row.percentage)}%</p>)}</div>}</div>;
      if (item.type === "rest") return <p key={item.id} className="inline-flex rounded-full border border-lemon/40 bg-lemon/10 px-2.5 py-1 text-[12px] font-bold uppercase tracking-[0.05em] text-lemon">Rest · {item.duration}</p>;
      return <p key={item.id} className="border-l-2 border-line-strong pl-3 text-[14px] italic text-chalk-2">{item.text}</p>;
    })}</div>
  </div>;
}

function ClassicStrengthDetail({ block, movementNames }: { block: SourceBlock; movementNames: Record<string, string> }) {
  if (!hasClassicStrength(block)) return null;
  if (block.is_complex && block.complex_movements?.length) return <div className="rounded-sm border border-line bg-ink p-3"><p className="text-[12px] font-bold uppercase tracking-[0.06em] text-lemon">Complex</p><div className="mt-2 space-y-1">{block.complex_movements.map((row, i) => <p key={i} className="text-[15px] text-chalk-2"><strong className="text-chalk">{row.reps}</strong> {movementNames[row.movement_id] ?? "Movimiento"}</p>)}</div>{block.strength_scheme?.length && <Scheme rows={block.strength_scheme} />}</div>;
  const name = block.movement_id ? movementNames[block.movement_id] ?? "Movimiento" : "Trabajo de fuerza";
  return <div className="rounded-sm border border-line bg-ink p-3"><p className="font-semibold text-chalk">{name}</p>{block.is_emom ? <p className="mt-1 text-[14px] text-chalk-2">EMOM · {block.emom_rounds ?? "—"} rondas · {block.emom_reps ?? "—"} reps{block.emom_interval_seconds ? ` · cada ${block.emom_interval_seconds}s` : ""}{block.emom_percentage ? ` · ${fmt(block.emom_percentage)}%` : ""}</p> : block.sets_count && block.reps_per_set ? <p className="mt-1 text-[14px] text-chalk-2">{block.sets_count} series × {block.reps_per_set} reps</p> : null}{block.strength_scheme?.length && <Scheme rows={block.strength_scheme} />}</div>;
}

function Scheme({ rows }: { rows: StrengthSchemeRow[] }) { return <div className="mt-2 space-y-0.5 text-[13px] text-chalk-2">{rows.map((row, i) => <p key={i}>{row.sets}×{row.reps} · {fmt(row.percentage)}%</p>)}</div>; }
function hasClassicStrength(block: SourceBlock) { return Boolean(block.movement_id || block.is_complex || block.sets_count || block.strength_scheme?.length || block.is_emom); }
function fmt(value: number) { return Number.isInteger(value) ? String(value) : String(value).replace(".", ","); }
function pctText(min: number | null, max: number | null) { if (min == null && max == null) return ""; const lo = min ?? max; const hi = max ?? min; return lo === hi ? `${fmt(lo!)}% 1RM` : `${fmt(lo!)}–${fmt(hi!)}% 1RM`; }
function pct(min: number | null, max: number | null) { const text = pctText(min, max); return text ? ` · ${text}` : ""; }
