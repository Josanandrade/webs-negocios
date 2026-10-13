"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Sex } from "@/lib/types";

export type AccountState = { error?: string; notice?: string } | null;
export type ProfileInput = { fullName: string; phone: string; sex: Sex; avatarUrl?: string | null };

function validAvatarUrl(url: string | null | undefined, userId: string) {
  if (!url) return true;
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return Boolean(base) && url.startsWith(`${base}/storage/v1/object/public/avatars/${userId}/`);
}

export async function updateOwnProfile(input: ProfileInput) {
  const { profile } = await getViewer();
  const name = String(input.fullName ?? "").trim();
  const phone = String(input.phone ?? "").trim();
  const sex = input.sex;
  const avatarUrl = input.avatarUrl ? String(input.avatarUrl) : null;

  if (name.length < 2 || name.length > 120) return { ok: false as const, error: "Escribe un nombre válido." };
  if (phone.length > 30) return { ok: false as const, error: "El teléfono es demasiado largo." };
  if (sex !== "male" && sex !== "female") return { ok: false as const, error: "Selecciona Hombre o Mujer." };
  if (!validAvatarUrl(avatarUrl, profile.id)) return { ok: false as const, error: "La foto de perfil no es válida." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: name, phone: phone || null, sex, avatar_url: avatarUrl })
    .eq("id", profile.id);
  if (error) return { ok: false as const, error: "No se ha podido guardar. Inténtalo de nuevo." };

  revalidatePath("/", "layout");
  revalidatePath("/cuenta");
  revalidatePath("/ranking");
  return { ok: true as const };
}

/** Compatibilidad con el formulario antiguo mientras se completa el cambio de interfaz. */
export async function updateName(_: AccountState, form: FormData): Promise<AccountState> {
  const { profile } = await getViewer();
  const name = String(form.get("full_name") ?? "").trim();
  if (name.length < 2) return { error: "Escribe tu nombre." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: name.slice(0, 120) }).eq("id", profile.id);
  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  revalidatePath("/", "layout");
  return { notice: "Nombre guardado." };
}
