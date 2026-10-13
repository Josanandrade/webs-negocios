import type { Metadata } from "next";
import { getViewer } from "@/lib/auth";
import { getMovements, getUserRms } from "@/lib/strength";
import { RmEditor } from "./rm-editor";

export const metadata: Metadata = { title: "RM's" };

export default async function RmsPage() {
  const viewer = await getViewer();
  const [movements, rms] = await Promise.all([getMovements(), getUserRms(viewer.profile.id)]);
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 md:px-6 md:pt-10">
      <p className="eyebrow">Tus marcas</p>
      <h1 className="mt-1 font-display text-[42px] font-extrabold uppercase leading-none">RM's</h1>
      <p className="mt-3 max-w-2xl text-[16px] text-chalk-2">Guarda y actualiza tus mejores marcas de 1 a 5 repeticiones. Lemon RX usará únicamente tu 1RM para calcular automáticamente los kilos de los bloques programados por porcentaje.</p>
      <RmEditor movements={movements} rms={rms} isAdmin={viewer.isAdmin} />
    </main>
  );
}
