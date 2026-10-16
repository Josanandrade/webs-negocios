import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { formatJoined } from "@/lib/dates";
import { getAthleteEvolution, type EvolutionWindow } from "@/lib/evolution";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "@/components/password-form";
import { AthleteEvolutionPanel } from "@/components/athlete-evolution-panel";

export const metadata: Metadata = { title: "Mi cuenta" };

function windowFrom(value: string | undefined): EvolutionWindow {
  return value === "8" ? 8 : value === "12" ? 12 : 4;
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ evolucion?: string }> }) {
  const [{ profile, isAdmin, canViewProgram }, sp] = await Promise.all([getViewer(), searchParams]);
  const weeks = windowFrom(sp.evolucion);
  const showEvolution = canViewProgram && (!isAdmin || profile.show_evolution_as_athlete);

  return (
    <main className="mx-auto max-w-xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <h1 className="font-display text-[40px] font-extrabold uppercase leading-none">Mi cuenta</h1>

      <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-y border-line py-5 text-[16px]">
        <dt className="text-chalk-3">Alta</dt>
        <dd>{formatJoined(profile.created_at)}</dd>
        <dt className="text-chalk-3">Programación</dt>
        <dd>{isAdmin ? "Administrador" : canViewProgram ? "Acceso activo" : "Sin acceso"}</dd>
      </dl>

      {canViewProgram && (
        <Link href="/historial" prefetch={false} className="press mt-4 inline-flex h-11 items-center text-[16px] font-semibold text-lemon hover:text-chalk">
          Mi historial: pesos, resultados y notas →
        </Link>
      )}

      {showEvolution && (
        <Suspense fallback={<EvolutionFallback />}>
          <AthleteEvolutionStream userId={profile.id} weeks={weeks} />
        </Suspense>
      )}
      {isAdmin && !profile.show_evolution_as_athlete && (
        <p className="mt-6 rounded-lg border border-line bg-panel px-4 py-3 text-[14px] leading-relaxed text-chalk-2">
          Tu evolución está oculta. Puedes activarla desde <Link href="/admin/ajustes" prefetch={false} className="font-semibold text-lemon">Configuración</Link>.
        </p>
      )}

      <ProfileForm profile={profile} />

      <section className="mt-12 border-t border-line pt-10">
        <h2 className="font-display text-[22px] font-bold uppercase">Contraseña</h2>
        <div className="mt-5"><PasswordForm /></div>
      </section>

      <section className="mt-12 border-t border-line pt-10">
        <form action="/auth/signout" method="post">
          <button className="btn-danger w-full sm:w-auto">Cerrar sesión</button>
        </form>
      </section>
    </main>
  );
}

async function AthleteEvolutionStream({ userId, weeks }: { userId: string; weeks: EvolutionWindow }) {
  const evolution = await getAthleteEvolution(userId, weeks);
  return <AthleteEvolutionPanel evolution={evolution} weeks={weeks} />;
}

function EvolutionFallback() {
  return (
    <section className="mt-10 border-t border-line pt-8" aria-label="Cargando Mi evolución">
      <p className="eyebrow">Rendimiento</p>
      <h2 className="font-display text-[28px] font-extrabold uppercase leading-none">Mi evolución</h2>
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="bg-ink px-4 py-5"><div className="skeleton skeleton-fade h-3 w-20" /><div className="skeleton skeleton-fade mt-3 h-8 w-20" /><div className="skeleton skeleton-fade mt-3 h-3 w-full" /></div>)}
      </div>
    </section>
  );
}
