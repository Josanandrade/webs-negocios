import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { canSeeProgram, listProfiles } from "@/lib/users";
import { createWeek } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { StatusDot } from "@/components/status-dot";
import { currentWeekStart, formatJoined, weekRangeShort } from "@/lib/dates";

export const metadata: Metadata = { title: "Panel" };

export default async function AdminHome() {
  const supabase = await createClient();
  const thisWeek = currentWeekStart();

  // Todo en paralelo: un no-admin es redirigido por requireAdmin y la RLS no le
  // devolvería estos datos de todos modos.
  const [{ settings, profile: me }, profiles, { data: week }] = await Promise.all([
    requireAdmin(),
    listProfiles(),
    supabase.from("weeks").select("id, status").eq("start_date", thisWeek).maybeSingle(),
  ]);

  const athletes = profiles.filter((p) => p.role === "athlete");
  const withAccess = athletes.filter((p) => canSeeProgram(p, settings)).length;
  const pendingPayment = athletes.filter((p) => p.payment_status === "pending").length;
  const newSignups = athletes.filter((p) => p.access_status === "pending");

  const weekState = !week ? "Sin crear" : week.status === "published" ? "Publicada" : "Borrador";

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <p className="eyebrow">Hola, {me.full_name.split(" ")[0] || "admin"}</p>
      <h1 className="mt-1 font-display text-[40px] font-extrabold uppercase leading-none md:text-[48px]">Panel</h1>

      <section aria-labelledby="semana-actual" className="mt-8 border-y border-line py-6">
        <h2 id="semana-actual" className="eyebrow">
          Semana actual · {weekRangeShort(thisWeek)}
        </h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <p className="flex items-center gap-3 font-display text-[32px] font-bold uppercase leading-none">
            <StatusDot status={week?.status ?? null} />
            {weekState}
          </p>
          {week ? (
            <Link href={`/admin/programacion/${week.id}`} className={week.status === "published" ? "btn-secondary" : "btn-primary"}>
              Editar semana
            </Link>
          ) : (
            <form action={createWeek}>
              <input type="hidden" name="start_date" value={thisWeek} />
              <SubmitButton className="btn-primary" pendingLabel="Creando…">
                Crear esta semana
              </SubmitButton>
            </form>
          )}
        </div>
      </section>

      <section aria-label="Usuarios" className="mt-2">
        <dl className="grid grid-cols-3 divide-x divide-line border-b border-line">
          <Stat label="Usuarios" value={athletes.length} href="/admin/usuarios" />
          <Stat label="Con acceso" value={withAccess} href="/admin/usuarios?filtro=con-acceso" />
          <Stat label="Sin pagar" value={pendingPayment} href="/admin/usuarios?filtro=pago-pendiente" highlight={pendingPayment > 0} />
        </dl>
      </section>

      {newSignups.length > 0 && (
        <section aria-labelledby="nuevos" className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="nuevos" className="font-display text-[22px] font-bold uppercase">
              Pendientes de activar
            </h2>
            <Link href="/admin/usuarios?filtro=nuevos" className="press py-2 text-[15px] font-semibold text-chalk-2 hover:text-chalk">
              Gestionar
            </Link>
          </div>
          <ul className="mt-3 border-t border-line">
            {newSignups.slice(0, 5).map((p) => (
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

      <nav aria-label="Accesos directos" className="mt-10 grid gap-3 sm:grid-cols-2">
        <Link href="/admin/programacion" className="btn-secondary justify-between">
          Crear programación <span aria-hidden>→</span>
        </Link>
        <Link href="/admin/usuarios" className="btn-secondary justify-between">
          Gestionar usuarios <span aria-hidden>→</span>
        </Link>
      </nav>
    </main>
  );
}

function Stat({ label, value, href, highlight }: { label: string; value: number; href: string; highlight?: boolean }) {
  return (
    <div className="min-w-0">
      <Link href={href} className="press block px-3 py-5 first:pl-0 md:px-6">
        <dt className="text-[13px] font-semibold uppercase tracking-[0.06em] text-chalk-3">{label}</dt>
        <dd className={`mt-1 font-display text-[44px] font-bold leading-none ${highlight ? "text-lemon" : ""}`}>{value}</dd>
      </Link>
    </div>
  );
}
