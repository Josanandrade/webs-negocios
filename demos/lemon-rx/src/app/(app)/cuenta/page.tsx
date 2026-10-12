import type { Metadata } from "next";
import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { formatJoined } from "@/lib/dates";
import { NameForm } from "./name-form";
import { PasswordForm } from "@/components/password-form";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function AccountPage() {
  const { profile, isAdmin, canViewProgram } = await getViewer();

  return (
    <main className="mx-auto max-w-xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <h1 className="font-display text-[40px] font-extrabold uppercase leading-none">Mi cuenta</h1>

      <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-y border-line py-5 text-[16px]">
        <dt className="text-chalk-3">Email</dt>
        <dd className="min-w-0 truncate">{profile.email}</dd>
        <dt className="text-chalk-3">Alta</dt>
        <dd>{formatJoined(profile.created_at)}</dd>
        <dt className="text-chalk-3">Programación</dt>
        <dd>{isAdmin ? "Administrador" : canViewProgram ? "Acceso activo" : "Sin acceso"}</dd>
      </dl>

      {canViewProgram && (
        <Link href="/historial" className="press mt-4 inline-flex h-11 items-center text-[16px] font-semibold text-lemon hover:text-chalk">
          Mi historial: pesos, resultados y notas →
        </Link>
      )}

      <section className="mt-10">
        <NameForm name={profile.full_name} />
      </section>

      <section className="mt-12 border-t border-line pt-10">
        <h2 className="font-display text-[22px] font-bold uppercase">Contraseña</h2>
        <div className="mt-5">
          <PasswordForm />
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-10">
        <form action="/auth/signout" method="post">
          <button className="btn-danger w-full sm:w-auto">Cerrar sesión</button>
        </form>
      </section>
    </main>
  );
}
