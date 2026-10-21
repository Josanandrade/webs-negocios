import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getRecentNotes } from "@/lib/activity";
import { getCoachEvolution, type CoachEvolutionWindow } from "@/lib/evolution";
import { createWeek } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { StatusDot } from "@/components/status-dot";
import { CoachEvolutionPanel } from "@/components/coach-evolution-panel";
import { AdminTrackingToggle } from "@/components/admin-tracking-toggle";
import { DAY_NAMES, currentWeekStart, formatJoined, isoDayOfWeek, shortDate, weekRangeShort } from "@/lib/dates";

export const metadata: Metadata = { title: "Panel" };

function windowFrom(value: string | undefined): CoachEvolutionWindow {
  return value === "4" ? 4 : value === "8" ? 8 : value === "12" ? 12 : 1;
}

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ evolucion?: string; seguimiento?: string }> }) {
  const supabase = await createClient();
  const thisWeek = currentWeekStart();
  const sp = await searchParams;
  const weeks = windowFrom(sp.evolucion);
  const showTracking = sp.seguimiento === "1";
  const { settings, profile: me } = await requireAdmin();

  const withAccessQuery = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "athlete")
    .eq("access_status", "active");
  if (settings.auto_block_unpaid) withAccessQuery.eq("payment_status", "paid");

  const [weekResult, athletesResult, withAccessResult, pendingPaymentResult] = await Promise.all([
    supabase.from("weeks").select("id, status").eq("start_date", thisWeek).maybeSingle<{ id: string; status: "draft" | "published" }>(),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "athlete"),
    withAccessQuery,
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "athlete").eq("payment_status", "pending"),
  ]);

  const week = weekResult.data;
  const athletes = athletesResult.count ?? 0;
  const withAccess = withAccessResult.count ?? 0;
  const pendingPayment = pendingPaymentResult.count ?? 0;
  const weekState = !week ? "Sin crear" : week.status === "published" ? "Publicada" : "Borrador";

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-6 md:pb-16 md:pt-10">
      <p className="eyebrow">Hola, {me.full_name.split(" ")[0] || "admin"}</p>
      <h1 className="mt-1 font-display text-[40px] font-extrabold uppercase leading-none md:text-[48px]">Panel</h1>

      <section aria-labelledby="semana-actual" className="mt-8 border-y border-line py-6">
        <h2 id="semana-actual" className="eyebrow">Semana actual · {weekRangeShort(thisWeek)}</h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <p className="flex items-center gap-3 font-display text-[32px] font-bold uppercase leading-none">
            <StatusDot status={week?.status ?? null} />{weekState}
          </p>
          {week ? (
            <Link href={`/admin/programacion/${week.id}`} prefetch={false} className={week.status === "published" ? "btn-secondary" : "btn-primary"}>Editar semana</Link>
          ) : (
            <form action={createWeek}>
              <input type="hidden" name="start_date" value={thisWeek} />
              <SubmitButton className="btn-primary" pendingLabel="Creando…">Crear esta semana</SubmitButton>
            </form>
          )}
        </div>
      </section>

      <section aria-label="KPIs de usuarios" className="mt-2">
        <dl className="grid grid-cols-3 divide-x divide-line border-b border-line">
          <Stat label="Usuarios" value={athletes} href="/admin/usuarios" />
          <Stat label="Con acceso" value={withAccess} href="/admin/usuarios?filtro=con-acceso" />
          <Stat label="Sin pagar" value={pendingPayment} href="/admin/usuarios?filtro=pago-pendiente" highlight={pendingPayment > 0} />
        </dl>
      </section>

      <section className="mt-8 border-y border-line" aria-label="Seguimiento de atletas">
        <AdminTrackingToggle open={showTracking} />
        {showTracking && (
          <div id="admin-seguimiento-content" className="border-t border-line py-6">
            <Suspense fallback={<TrackingFallback />}>
              <TrackingStream weeks={weeks} />
            </Suspense>
          </div>
        )}
      </section>

      <nav aria-label="Accesos directos" className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link href="/admin/programacion" prefetch={false} className="btn-secondary justify-between">Crear programación <span aria-hidden>→</span></Link>
        <Link href="/home" prefetch={false} className="btn-secondary justify-between">Abrir Home <span aria-hidden>→</span></Link>
      </nav>
    </main>
  );
}

async function TrackingStream({ weeks }: { weeks: CoachEvolutionWindow }) {
  const supabase = await createClient();
  const [evolution, notes, signupsResult] = await Promise.all([
    getCoachEvolution(weeks),
    getRecentNotes(6),
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("role", "athlete")
      .eq("access_status", "pending")
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<Array<{ id: string; full_name: string; email: string; created_at: string }>>(),
  ]);
  const newSignups = signupsResult.data ?? [];

  return (
    <>
      <CoachEvolutionPanel evolution={evolution} weeks={weeks} />

      {newSignups.length > 0 && (
        <section aria-labelledby="nuevos" className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h3 id="nuevos" className="font-display text-[22px] font-bold uppercase">Pendientes de activar</h3>
            <Link href="/admin/usuarios?filtro=nuevos" prefetch={false} className="press py-2 text-[15px] font-semibold text-chalk-2 hover:text-chalk">Gestionar</Link>
          </div>
          <ul className="mt-3 border-t border-line">
            {newSignups.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                <span className="min-w-0">
                  <span className="block truncate text-[17px] font-semibold">{p.full_name || "Sin nombre"}</span>
                  <span className="block truncate text-[14px] text-chalk-3">{p.email}</span>
                </span>
                <span className="shrink-0 text-[14px] text-chalk-3">{formatJoined(p.created_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="notas" className="mt-10 border-t border-line pt-8">
        <h3 id="notas" className="font-display text-[22px] font-bold uppercase">Últimas notas de los atletas</h3>
        {notes.length === 0 ? (
          <p className="mt-3 pt-2 text-[16px] text-chalk-3">Aquí aparecerán las notas que dejen los atletas en cada bloque.</p>
        ) : (
          <ul className="mt-3 border-t border-line">
            {notes.map((n) => (
              <li key={`${n.user_id}-${n.block_id}`} className="border-b border-line">
                <Link href={`/admin/usuarios/${n.user_id}${n.date ? `?semana=${n.date}` : ""}`} prefetch={false} className="day-trigger block py-4">
                  <p className="text-[14px] text-chalk-3"><span className="font-semibold text-chalk">{n.full_name}</span> · {n.date ? `${DAY_NAMES[isoDayOfWeek(n.date) - 1]} ${shortDate(n.date)} · ` : ""}{n.block_title}</p>
                  <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-[16px] leading-[1.5]">{n.note}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function TrackingFallback() {
  return (
    <div aria-label="Cargando seguimiento">
      <div className="flex items-end justify-between gap-4"><div><div className="skeleton skeleton-fade h-3 w-24" /><div className="skeleton skeleton-fade mt-2 h-7 w-52" /></div><div className="skeleton skeleton-fade h-11 w-44" /></div>
      <div className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-line sm:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="bg-ink px-4 py-4"><div className="skeleton skeleton-fade h-3 w-28" /><div className="skeleton skeleton-fade mt-3 h-8 w-20" /></div>)}
      </div>
    </div>
  );
}

function Stat({ label, value, href, highlight }: { label: string; value: number; href: string; highlight?: boolean }) {
  return (
    <div className="min-w-0">
      <Link href={href} prefetch={false} className="press block px-3 py-5 first:pl-0 md:px-6">
        <dt className="text-[13px] font-semibold uppercase tracking-[0.06em] text-chalk-3">{label}</dt>
        <dd className={`mt-1 font-display text-[44px] font-bold leading-none ${highlight ? "text-lemon" : ""}`}>{value}</dd>
      </Link>
    </div>
  );
}
