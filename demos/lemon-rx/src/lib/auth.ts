import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Settings } from "@/lib/types";

export type Viewer = {
  profile: Profile;
  settings: Settings;
  isAdmin: boolean;
  /** Mismo criterio que public.has_program_access() en la base de datos. */
  canViewProgram: boolean;
};

/** Usuario actual con su perfil. Redirige a /login si no hay sesión válida. */
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect("/login");

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, payment_status, access_status, sex, phone, avatar_url, created_at")
      .eq("id", userId)
      .single<Profile>(),
    supabase.from("app_settings").select("auto_block_unpaid, show_past_weeks").single<Settings>(),
  ]);

  if (!profile || !settings) redirect("/auth/signout");

  const isAdmin = profile.role === "admin";
  const canViewProgram =
    isAdmin ||
    (profile.access_status === "active" &&
      (profile.payment_status === "paid" || !settings.auto_block_unpaid));

  return { profile, settings, isAdmin, canViewProgram };
});

/** Para páginas y acciones de administración. Un no-admin nunca ve ni ejecuta nada. */
export async function requireAdmin() {
  const viewer = await getViewer();
  if (!viewer.isAdmin) redirect("/");
  return viewer;
}
