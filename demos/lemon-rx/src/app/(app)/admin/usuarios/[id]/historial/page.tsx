import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getHistory } from "@/lib/activity";
import { HistoryList } from "@/components/history-list";

export const metadata: Metadata = { title: "Historial del atleta" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Historial completo de un atleta, para los admins. */
export default async function AthleteHistoryPage({ params, searchParams }: PageProps<"/admin/usuarios/[id]/historial">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!UUID.test(id)) notFound();
  const supabase = await createClient();
  const [, { data: athlete }, entries] = await Promise.all([
    requireAdmin(),
    supabase.from("profiles").select("full_name").eq("id", id).maybeSingle<{ full_name: string }>(),
    getHistory(id),
  ]);
  if (!athlete) notFound();
  const q = typeof sp.q === "string" ? sp.q : "";
  const base = `/admin/usuarios/${id}`;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-4 md:px-6 md:pt-8">
      <Link href={base} className="press -ml-1 inline-flex h-11 items-center gap-2 px-1 text-[15px] font-semibold text-chalk-3 hover:text-chalk">
        <span aria-hidden>←</span> {athlete.full_name || "Atleta"}
      </Link>
      <h1 className="mt-2 font-display text-[36px] font-extrabold uppercase leading-[0.95] md:text-[44px]">Historial</h1>
      <HistoryList entries={entries} q={q} action={`${base}/historial`} emptyText="Este atleta aún no ha registrado nada." />
    </main>
  );
}
