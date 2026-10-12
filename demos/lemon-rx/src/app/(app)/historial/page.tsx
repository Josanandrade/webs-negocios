import type { Metadata } from "next";
import { getViewer } from "@/lib/auth";
import { getHistory } from "@/lib/activity";
import { NoAccess } from "@/components/no-access";
import { HistoryList } from "@/components/history-list";

export const metadata: Metadata = { title: "Mi historial" };

/** Todo lo que el atleta ha registrado: hechos, resultados, pesos y notas. */
export default async function HistoryPage({ searchParams }: PageProps<"/historial">) {
  const [viewer, sp] = await Promise.all([getViewer(), searchParams]);
  if (!viewer.canViewProgram) {
    return <NoAccess name={viewer.profile.full_name.split(" ")[0]} pending={viewer.profile.access_status === "pending"} />;
  }
  const entries = await getHistory(viewer.profile.id);
  const q = typeof sp.q === "string" ? sp.q : "";

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <p className="eyebrow">Tus entrenamientos</p>
      <h1 className="mt-1 font-display text-[40px] font-extrabold uppercase leading-[0.9] sm:text-[52px]">Mi historial</h1>
      <HistoryList
        entries={entries}
        q={q}
        action="/historial"
        emptyText="Aún no has registrado nada. Marca bloques como hechos, apunta tus pesos o tus resultados y aparecerán aquí."
      />
    </main>
  );
}
