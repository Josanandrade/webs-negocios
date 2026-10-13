"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { emailConfigured, invitationEmail, sendEmails } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import type { AccessStatus, PaymentStatus, Role, Sex } from "@/lib/types";

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

function validAvatarUrl(url: string | null | undefined, userId: string) {
  if (!url) return true;
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return Boolean(base) && url.startsWith(`${base}/storage/v1/object/public/avatars/${userId}/`);
}

export async function updateUserProfile(
  userId: string,
  input: {
    fullName: string;
    phone: string;
    sex: Sex;
    avatarUrl?: string | null;
    role: Role;
    paymentStatus: PaymentStatus;
    accessStatus: AccessStatus;
  },
) {
  const viewer = await requireAdmin();
  if (!UUID.test(userId)) return { ok: false as const, error: "Usuario no válido." };

  const name = String(input.fullName ?? "").trim();
  const phone = String(input.phone ?? "").trim();
  const avatarUrl = input.avatarUrl ? String(input.avatarUrl) : null;
  if (name.length < 2 || name.length > 120) return { ok: false as const, error: "Escribe un nombre válido." };
  if (phone.length > 30) return { ok: false as const, error: "El teléfono es demasiado largo." };
  if (input.sex !== "male" && input.sex !== "female") return { ok: false as const, error: "Selecciona Hombre o Mujer." };
  if (input.role !== "admin" && input.role !== "athlete") return { ok: false as const, error: "Rol no válido." };
  if (input.paymentStatus !== "paid" && input.paymentStatus !== "pending") return { ok: false as const, error: "Estado de pago no válido." };
  if (!["pending", "active", "blocked"].includes(input.accessStatus)) return { ok: false as const, error: "Estado de acceso no válido." };
  if (!validAvatarUrl(avatarUrl, userId)) return { ok: false as const, error: "La foto de perfil no es válida." };
  if (userId === viewer.profile.id && input.role !== viewer.profile.role) return { ok: false as const, error: "No puedes cambiar tu propio rol de administrador." };

  const accessStatus: AccessStatus = input.role === "admin" ? "active" : input.accessStatus;
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("profiles")
    .update({
      full_name: name,
      phone: phone || null,
      sex: input.sex,
      avatar_url: avatarUrl,
      role: input.role,
      payment_status: input.paymentStatus,
      access_status: accessStatus,
    }, { count: "exact" })
    .eq("id", userId);
  if (error || !count) return { ok: false as const, error: "No se ha podido guardar el perfil." };

  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/usuarios");
  revalidatePath("/ranking");
  revalidatePath("/", "layout");
  return { ok: true as const };
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
