import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { addDays, currentWeekStart, weekRangeLong, weekRangeShort } from "@/lib/dates";
import { createWeek } from "../actions";
import { WeekStatusLabel } from "@/components/status-dot";
import { SubmitButton } from "@/components/submit-button";
import type { Week } from "@/lib/types";

export const metadata: Metadata = { title: "Crear programación" };

const ERRORS: Record<string, string> = {
  fecha: "Elige una semana válida.",
  crear: "No se ha podido crear la semana. Inténtalo de nuevo.",
};

export default async function WeeksPage({ searchParams }: PageProps<"/admin/programacion">) {
  await requireAdmin();
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined;

  const supabase = await createClient();
  const { data } = await supabase
    .from("weeks")
    .select("id, start_date, end_date, status, published_at, updated_at")
    .order("start_date", { ascending: false })
    .returns<Week[]>();
  const weeks = data ?? [];

  const thisWeek = currentWeekStart();
  const taken = new Set(weeks.map((w) => w.start_date));
  // Opciones: dos semanas atrás y diez adelante, sin las ya creadas.
  const options = Array.from({ length: 13 }, (_, i) => addDays(thisWeek, (i - 2) * 7)).filter((d) => !taken.has(d));
  const suggested = options.find((d) => d >= thisWeek) ?? options[0];

  const upcoming = weeks.filter((w) => w.start_date >= thisWeek).reverse();
  const past = weeks.filter((w) => w.start_date < thisWeek);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <h1 className="font-display text-[40px] font-extrabold uppercase leading-none md:text-[48px]">Crear programación</h1>

      <form action={createWeek} className="mt-8 border-y border-line py-6">
        <label htmlFor="start_date" className="label">
          Nueva semana
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select id="start_date" name="start_date" defaultValue={suggested} className="field sm:flex-1" required>
            {options.map((d) => (
              <option key={d} value={d}>
                {weekRangeLong(d)}
                {d === thisWeek ? " · esta semana" : ""}
              </option>
            ))}
          </select>
          <SubmitButton className="btn-primary sm:w-auto" pendingLabel="Creando…" disabled={options.length === 0}>
            Crear semana
          </SubmitButton>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-[15px] text-danger">
            {error}
          </p>
        )}
      </form>

      <WeekList title="Próximas y actual" weeks={upcoming} thisWeek={thisWeek} empty="No hay semanas creadas desde esta semana en adelante." />
      {past.length > 0 && <WeekList title="Anteriores" weeks={past} thisWeek={thisWeek} />}
    </main>
  );
}

function WeekList({ title, weeks, thisWeek, empty }: { title: string; weeks: Week[]; thisWeek: string; empty?: string }) {
  return (
    <section className="mt-10">
      <h2 className="eyebrow">{title}</h2>
      {weeks.length === 0 ? (
        <p className="mt-3 text-[16px] text-chalk-3">{empty}</p>
      ) : (
        <ul className="mt-3 border-t border-line">
          {weeks.map((w) => (
            <li key={w.id} className="border-b border-line">
              <Link
                href={`/admin/programacion/${w.id}`}
                className="day-trigger flex min-h-[4.5rem] items-center justify-between gap-4 px-1"
              >
                <span>
                  <span className="block font-display text-[24px] font-bold uppercase leading-none">
                    {weekRangeShort(w.start_date)}
                  </span>
                  {w.start_date === thisWeek && <span className="mt-1 block text-[14px] text-chalk-3">Esta semana</span>}
                </span>
                <span className="flex items-center gap-4">
                  <WeekStatusLabel status={w.status} />
                  <span aria-hidden className="text-chalk-3">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
