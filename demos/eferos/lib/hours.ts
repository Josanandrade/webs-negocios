import type { HoursRow } from "@/lib/types";

type OpenRow = Extract<HoursRow, { opens: string }>;

export const isOpenRow = (row: HoursRow): row is OpenRow => !row.closed;

/** "09:30 – 20:30"; con `short`, "9:30–20:30" para textos compactos. */
export function formatRange(row: HoursRow, short = false) {
  if (!isOpenRow(row)) return "Cerrado";
  if (!short) return `${row.opens} – ${row.closes}`;
  const trim = (t: string) => t.replace(/^0/, "");
  return `${trim(row.opens)}–${trim(row.closes)}`;
}
