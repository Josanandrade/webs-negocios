import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const { settings } = await requireAdmin();
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <h1 className="font-display text-[40px] font-extrabold uppercase leading-none md:text-[48px]">Configuración</h1>
      <SettingsForm settings={settings} />
    </main>
  );
}
