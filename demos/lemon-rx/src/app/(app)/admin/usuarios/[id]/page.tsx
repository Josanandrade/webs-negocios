import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_COLUMNS } from "@/lib/users";
import { getAdjacentPublished, getPublishedWeek } from "@/lib/program";
import { getActivity, getUserNotes, getWeekLeaderboard } from "@/lib/activity";
import { divisionLabel, formatScore } from "@/lib/scores";
import { DAY_NAMES, currentWeekStart, isIsoDate, isoDayOfWeek, mondayOf, shortDate, weekDates, weekRangeShort } from "@/lib/dates";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Atleta" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ficha de un atleta para los admins: qué bloques ha hecho, sus resultados y sus notas. */
export default async function AthletePage({ params, searchParams }: PageProps<"/admin/usuarios/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!UUID.test(id)) notFound();
  const thisWeek = currentWeekStart();
  const start = isIsoDate(sp.semana) ? mondayOf(sp.semana) : thisWeek;

  const supabase = await createClient();
  const [, { data: athlete }, week, adjacent, notes] = await Promise.all([
    requireAdmin(),
    supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", id).maybeSingle<Profile>(),
    getPublishedWeek(start),
    getAdjacentPublished(start),
    getUserNotes(id),
  ]);
  if (!athlete) notFound();

  const blockIds = week?.days.flatMap((d) => d.workout_blocks.map((b) => b.id)) ?? [];
  const [activity, board] = await Promise.all([getActivity(id, blockIds), getWeekLeaderboard(week?.id ?? null)]);

  const days = weekDates(start).map((date, i) => ({
    date,
    name: DAY_NAMES[i],
    blocks: (week?.days.find((d) => d.date === date)?.workout_blocks ?? []).filter(
      (b) => b.title.trim() || b.content.trim(),
    ),
  }));
  const total = days.reduce((n, d) => n + d.blocks.length, 0);
  const done = days.reduce((n, d) => n + d.blocks.filter((b) => activity.logs[b.id]?.done).length, 0);
  const name = athlete.full_name || "Sin nombre";
  const base = `/admin/usuarios/${id}`;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-4 md:px-6 md:pt-8">
      <Link
        href="/admin/usuarios"
        className="press -ml-1 inline-flex h-11 items-center gap-2 px-1 text-[15px] font-semibold text-chalk-3 hover:text-chalk"
      >
        <span aria-hidden>←</span> Usuarios
      </Link>

      <h1 className="mt-2 font-display text-[36px] font-extrabold uppercase leading-[0.95] md:text-[44px]">{name}</h1>
      <p className="mt-1 truncate text-[15px] text-chalk-3">{athlete.email}</p>

      <section aria-labelledby="semana" className="mt-8">
        <div className="flex items-end justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="eyebrow">{start === thisWeek ? "Esta semana" : "Semana"}</p>
            <h2 id="semana" className="mt-1 font-display text-[28px] font-bold uppercase leading-none">
              {weekRangeShort(start)}
            </h2>
            {week && (
              <p className="mt-2 text-[15px] text-chalk-2">
                <span className="font-semibold text-chalk">{done}</span> de {total} bloques hechos
              </p>
            )}
          </div>
          <nav aria-label="Cambiar de semana" className="flex shrink-0 gap-2">
            <PagerLink href={adjacent.prev ? `${base}?semana=${adjacent.prev}` : null} label="Semana anterior" dir="left" />
            <PagerLink href={adjacent.next ? `${base}?semana=${adjacent.next}` : null} label="Semana siguiente" dir="right" />
          </nav>
        </div>

        {!week ? (
          <p className="pt-6 text-[17px] text-chalk-3">No hay programación publicada esta semana.</p>
        ) : (
          <ol>
            {days
              .filter((d) => d.blocks.length > 0)
              .map((day) => (
                <li key={day.date} className="border-b border-line py-5">
                  <h3 className="flex items-baseline gap-3">
                    <span className="font-display text-[22px] font-bold uppercase leading-none">{day.name}</span>
                    <span className="font-display text-[15px] font-semibold uppercase text-chalk-3">{shortDate(day.date)}</span>
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {day.blocks.map((b) => {
                      const log = activity.logs[b.id];
                      const result = activity.results[b.id];
                      const rank = board[b.id]?.find((r) => r.user_id === id);
                      return (
                        <li key={b.id} className="rounded-sm border border-line bg-ink-2 px-3 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 truncate font-display text-[15px] font-bold uppercase tracking-[0.1em] text-chalk-2">
                              {b.title || b.content.split("\n")[0]}
                            </p>
                            <span
                              className={`shrink-0 font-display text-[13px] font-bold uppercase tracking-[0.08em] ${
                                log?.done ? "text-lemon" : "text-chalk-3"
                              }`}
                            >
                              {log?.done ? "✓ Hecho" : "Pendiente"}
                            </span>
                          </div>
                          {result && (
                            <p className="mt-2 text-[16px]">
                              <span className="font-display text-[20px] font-bold">{formatScore(b.score_type, result)}</span>
                              <span className="ml-2 text-chalk-3">
                                {divisionLabel(result.division)}
                                {rank && ` · ${rank.position}º de ${rank.total}`}
                              </span>
                            </p>
                          )}
                          {log?.note && (
                            <p className="mt-2 whitespace-pre-wrap border-l-2 border-lemon pl-3 text-[16px] leading-[1.5]">{log.note}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="notas" className="mt-12">
        <h2 id="notas" className="font-display text-[22px] font-bold uppercase">
          Todas sus notas
        </h2>
        {notes.length === 0 ? (
          <p className="mt-3 border-t border-line pt-4 text-[16px] text-chalk-3">Todavía no ha escrito ninguna nota.</p>
        ) : (
          <ul className="mt-3 border-t border-line">
            {notes.map((n) => (
              <li key={n.block_id} className="border-b border-line py-4">
                <p className="eyebrow">
                  {n.date ? (
                    <Link href={`${base}?semana=${mondayOf(n.date)}`} className="hover:text-chalk">
                      {DAY_NAMES[isoDayOfWeek(n.date) - 1]} {shortDate(n.date)}
                    </Link>
                  ) : null}
                  {n.date ? " · " : ""}
                  {n.block_title}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[16px] leading-[1.5]">{n.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function PagerLink({ href, label, dir }: { href: string | null; label: string; dir: "left" | "right" }) {
  const icon = (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" />
    </svg>
  );
  if (!href)
    return (
      <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-sm border border-line text-chalk-3/40">
        {icon}
      </span>
    );
  return (
    <Link href={href} aria-label={label} scroll={false} className="press flex h-11 w-11 items-center justify-center rounded-sm border border-line-strong text-chalk">
      {icon}
    </Link>
  );
}
