import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Settings } from "@/lib/types";

export const PROFILE_COLUMNS = "id, full_name, email, role, payment_status, access_status, sex, created_at";

export function canSeeProgram(p: Profile, s: Settings) {
  return (
    p.role === "admin" ||
    (p.access_status === "active" && (p.payment_status === "paid" || !s.auto_block_unpaid))
  );
}

export async function listProfiles() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: false })
    .returns<Profile[]>();
  return data ?? [];
}
