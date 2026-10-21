"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyAdminsOfSignup } from "@/lib/push";

export type AuthState = { error?: string; notice?: string; email?: string; sex?: "male" | "female" } | null;

function str(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : null;
}

async function origin() {
  const h = await headers();
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const email = str(form, "email").toLowerCase();
  const password = (form.get("password") as string) ?? "";
  if (!email || !password) return { error: "Introduce tu email y contraseña.", email };

  const supabase = await createClient();
  const { data: auth, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed")
      return { error: "Confirma tu email antes de entrar. Revisa tu bandeja de entrada.", email };
    return { error: "Email o contraseña incorrectos.", email };
  }

  const requested = safeNext(str(form, "next"));
  if (requested) redirect(requested);
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle<{ role: "admin" | "athlete" }>();
  redirect(profile?.role === "admin" ? "/admin" : "/home");
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const fullName = str(form, "full_name");
  const email = str(form, "email").toLowerCase();
  const password = (form.get("password") as string) ?? "";
  const rawSex = str(form, "sex");
  const sex = rawSex === "male" || rawSex === "female" ? rawSex : undefined;

  if (fullName.length < 2) return { error: "Escribe tu nombre.", email, sex };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Ese email no parece válido.", email, sex };
  if (!sex) return { error: "Indica si eres hombre o mujer.", email };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres.", email, sex };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName.slice(0, 120), sex },
      emailRedirectTo: `${await origin()}/auth/callback?next=/home`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists")
      return { error: "Ya existe una cuenta con ese email. Inicia sesión.", email, sex };
    if (error.code === "weak_password")
      return { error: "Esa contraseña es demasiado débil. Prueba con otra más larga.", email, sex };
    if (error.status === 429)
      return { error: "Demasiados intentos. Espera unos minutos y vuelve a probar.", email, sex };
    return { error: "No hemos podido crear la cuenta. Inténtalo de nuevo.", email, sex };
  }

  const newUserId = data.user?.id;
  if (newUserId) after(() => notifyAdminsOfSignup(newUserId));

  if (!data.session) {
    return {
      notice: `Te hemos enviado un email a ${email}. Ábrelo para confirmar tu cuenta y después inicia sesión.`,
      email,
      sex,
    };
  }
  redirect("/home");
}

export async function requestPasswordReset(_: AuthState, form: FormData): Promise<AuthState> {
  const email = str(form, "email").toLowerCase();
  if (!email) return { error: "Introduce tu email." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/recovery`,
  });
  if (error?.status === 429)
    return { error: "Demasiados intentos. Espera unos minutos y vuelve a probar.", email };

  return {
    notice: "Si existe una cuenta con ese email, te llegará un enlace para crear una contraseña nueva.",
    email,
  };
}

export async function updatePassword(_: AuthState, form: FormData): Promise<AuthState> {
  const password = (form.get("password") as string) ?? "";
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return { error: "Usa una contraseña distinta de la anterior." };
    if (error.code === "weak_password") return { error: "Esa contraseña es demasiado débil." };
    return { error: "No hemos podido cambiar la contraseña. Pide un enlace nuevo." };
  }
  return { notice: "Contraseña actualizada." };
}
