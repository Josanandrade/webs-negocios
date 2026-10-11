"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AccountState = { error?: string; notice?: string } | null;

export async function updateName(_: AccountState, form: FormData): Promise<AccountState> {
  const { profile } = await getViewer();
  const name = String(form.get("full_name") ?? "").trim();
  if (name.length < 2) return { error: "Escribe tu nombre." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: name.slice(0, 120) })
    .eq("id", profile.id);
  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  revalidatePath("/", "layout");
  return { notice: "Nombre guardado." };
}
