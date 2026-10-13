"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { emailConfigured, invitationEmail, sendEmails } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import type { Sex } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type InviteState = { ok?: boolean; error?: string; notice?: string; email?: string } | null;

export async function inviteUser(_: InviteState, form: FormData): Promise<InviteState> {
  await requireAdmin();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Escribe un email válido.", email };
  if (!emailConfigured()) return { error: "El envío de emails no está configurado.", email };

  const origin = (process.env.SITE_URL ?? "").replace(/\/$/, "");
  if (!origin) return { error: "Falta configurar la URL de Lemon RX.", email };

  try {
    await sendEmails([invitationEmail(email, `${origin}/registro`)]);
    return { ok: true, notice: `Invitación enviada a ${email}.`, email: "" };
  } catch (error) {
    console.error("Invitación de Lemon RX no enviada", error);
    return { error: "No se ha podido enviar la invitación. Inténtalo de nuevo.", email };
  }
}

export async function setUserSex(userId: string, sex: Sex) {
  await requireAdmin();
  if (!UUID.test(userId) || (sex !== "male" && sex !== "female")) {
    return { ok: false as const, error: "Datos no válidos." };
  }

  const supabase = await createClient();
  const { error, count } = await supabase.from("profiles").update({ sex }, { count: "exact" }).eq("id", userId);
  if (error || !count) return { ok: false as const, error: "No se ha podido guardar el sexo del usuario." };

  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/usuarios");
  revalidatePath("/ranking");
  revalidatePath("/", "layout");
  return { ok: true as const };
}
