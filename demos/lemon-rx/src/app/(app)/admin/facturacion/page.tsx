import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { addSubscriptionPeriod, voidSubscriptionPeriod } from "./actions";
import { BillingForm } from "./billing-form";

export const metadata: Metadata = { title: "Facturación" };
type Period = { id: string; user_id: string; starts_on: string; ends_on: string; kind: string; amount_cents: number | null; paid_on: string | null; note: string; voided_at: string | null };
type Athlete = { id: string; full_name: string; email: string | null };
const date = (s: string) => s.split("-").reverse().join("-");

export default async function BillingPage({ searchParams }: PageProps<"/admin/facturacion">) {
  await requireAdmin();
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: users, error: usersError }, { data: periods, error: periodsError }] = await Promise.all([
    supabase.from("profiles").select("id,full_name,email").eq("role", "athlete").order("full_name"),
    supabase.from("athlete_subscription_periods").select("id,user_id,starts_on,ends_on,kind,amount_cents,paid_on,note,voided_at").order("created_at", { ascending: false }).limit(300),
  ]);
  if (usersError || periodsError) throw new Error("No se ha podido cargar la facturación.");
  const athletes = (users ?? []) as Athlete[];
  const entries = (periods ?? []) as Period[];
  const names = new Map(athletes.map((a) => [a.id, a.full_name || a.email || "Atleta"]));
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });
  const active = entries.filter((p) => !p.voided_at && p.starts_on <= today && p.ends_on >= today);
  const paid = active.filter((p) => p.kind === "payment").length;
  const courtesy = active.filter((p) => p.kind === "courtesy").length;

  return <main className="mx-auto max-w-4xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
    <Link href="/admin/usuarios" className="text-sm text-chalk-3 hover:text-chalk">← Usuarios</Link>
    <h1 className="mt-4 font-display text-[38px] font-extrabold uppercase">Facturación</h1>
    <p className="mt-2 text-chalk-3">Registro manual de pagos y cortesías. El nuevo control automático de acceso todavía no está activado.</p>
    <div className="mt-5 grid grid-cols-2 gap-3">
      <div className="rounded-sm border border-line p-4"><p className="text-sm text-chalk-3">Periodos pagados vigentes</p><p className="text-3xl font-bold">{paid}</p></div>
      <div className="rounded-sm border border-line p-4"><p className="text-sm text-chalk-3">Cortesías vigentes</p><p className="text-3xl font-bold">{courtesy}</p></div>
    </div>
    {typeof sp.error === "string" && <p role="alert" className="mt-4 text-red-400">No se pudo completar la operación. Revisa los datos e inténtalo de nuevo.</p>}
    {typeof sp.ok === "string" && <p role="status" className="mt-4 text-lemon">Operación guardada correctamente.</p>}
    <BillingForm athletes={athletes} action={addSubscriptionPeriod} />
    <section className="mt-10">
      <h2 className="font-display text-2xl font-bold uppercase">Historial de movimientos</h2>
      <p className="mt-1 text-sm text-chalk-3">Últimos 300 registros, incluidos los anulados.</p>
      <div className="mt-4 space-y-3">
        {entries.length === 0 && <p className="text-chalk-3">Todavía no hay pagos ni cortesías registrados.</p>}
        {entries.map((p) => <article key={p.id} className="rounded-sm border border-line bg-ink-2 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{names.get(p.user_id) ?? "Atleta eliminado"}</p>
              <p className="text-sm text-chalk-3">{p.kind === "courtesy" ? "Cortesía" : "Pago"} · {date(p.starts_on)} — {date(p.ends_on)}</p>
              {p.kind === "payment" && <p className="mt-1 text-sm">{((p.amount_cents ?? 0) / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" })} · Pagado el {p.paid_on ? date(p.paid_on) : "—"}</p>}
              {p.note && <p className="mt-1 text-sm text-chalk-3">{p.note}</p>}
            </div>
            {p.voided_at ? <span className="text-sm text-chalk-3">Anulado</span> :
              <form action={voidSubscriptionPeriod}><input type="hidden" name="period_id" value={p.id} /><button type="submit" className="text-sm text-red-300 hover:text-red-200">Anular registro</button></form>}
          </div>
        </article>)}
      </div>
    </section>
  </main>;
}
