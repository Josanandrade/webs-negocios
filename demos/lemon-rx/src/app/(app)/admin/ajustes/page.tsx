import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { SettingsForm } from "./settings-form";
import { PushSettings } from "./push-settings";
import { AdminEvolutionSetting } from "./admin-evolution-setting";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const { settings, profile } = await requireAdmin();
  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-6 md:pb-16 md:pt-10">
      <h1 className="font-display text-[40px] font-extrabold uppercase leading-none md:text-[48px]">Configuración</h1>

      <section className="mt-8 border-y border-line py-5" aria-labelledby="usuarios-ajustes">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Gestión</p>
            <h2 id="usuarios-ajustes" className="mt-1 font-display text-[24px] font-bold uppercase">Usuarios</h2>
            <p className="mt-1 text-[14px] leading-[1.45] text-chalk-3">Invitaciones, búsqueda, accesos, pagos y ficha completa de cada atleta.</p>
          </div>
          <Link href="/admin/usuarios" prefetch={false} className="btn-secondary shrink-0">Usuarios <span aria-hidden>→</span></Link>
        </div>
      </section>

      <SettingsForm settings={settings} />
      <AdminEvolutionSetting initialValue={profile.show_evolution_as_athlete} />
      <PushSettings />
    </main>
  );
}
