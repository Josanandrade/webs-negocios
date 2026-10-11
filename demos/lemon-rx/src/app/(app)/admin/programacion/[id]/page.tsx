import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getWeekById } from "@/lib/program";
import { todayIso } from "@/lib/dates";
import { WeekEditor } from "@/components/week-editor/week-editor";

export const metadata: Metadata = { title: "Editar semana" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditWeekPage({ params }: PageProps<"/admin/programacion/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const week = await getWeekById(id);
  if (!week) notFound();
  // key: si la semana cambia en servidor (publicar), el editor no pierde el estado local.
  return <WeekEditor key={week.id} week={week} today={todayIso()} />;
}
