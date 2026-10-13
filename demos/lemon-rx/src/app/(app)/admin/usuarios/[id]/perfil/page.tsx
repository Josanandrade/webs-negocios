import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_COLUMNS } from "@/lib/users";
import { formatJoined } from "@/lib/dates";
import type { Profile } from "@/lib/types";
import { AdminProfileForm } from "../profile-form";

export const metadata: Metadata = { title: "Perfil de usuario" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function UserProfilePage({ params }: PageProps<"/admin/usuarios/[id]/perfil">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const [viewer, { data: profile }] = await Promise.all([
    requireAdmin(),
    supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", id).maybeSingle<Profile>(),
  ]);
  if (!profile) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-4 md:px-6 md:pt-8">
      <Link href="/admin/usuarios" className="press -ml-1 inline-flex h-11 items-center gap-2 px-1 text-[15px] font-semibold text-chalk-3 hover:text-chalk">
        <span aria-hidden>←</span> Usuarios
      </Link>

      <p className="eyebrow mt-2">Ficha de usuario</p>
      <h1 className="mt-1 font-display text-[36px] font-extrabold uppercase leading-[0.95] md:text-[44px]">
        {profile.full_name || "Sin nombre"}
      </h1>
      <p className="mt-2 text-[14px] text-chalk-3">Alta {formatJoined(profile.created_at)}</p>

      <AdminProfileForm profile={profile} isSelf={profile.id === viewer.profile.id} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href={`/admin/usuarios/${profile.id}`} className="btn-secondary text-center">
          Actividad y notas
        </Link>
        <Link href={`/admin/usuarios/${profile.id}/historial`} className="btn-secondary text-center">
          Historial completo
        </Link>
      </div>
    </main>
  );
}
