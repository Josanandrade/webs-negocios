import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getWeekById } from "@/lib/program";
import { getMovements } from "@/lib/strength";
import { todayIso } from "@/lib/dates";
import { WeekEditor } from "@/components/week-editor/week-editor";

export const metadata: Metadata = { title: "Editar semana" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditWeekPage({ params }: PageProps<"/admin/programacion/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [, week, movements] = await Promise.all([requireAdmin(), getWeekById(id), getMovements()]);
  if (!week) notFound();
  return <WeekEditor key={week.id} week={week} today={todayIso()} movements={movements} />;
}
