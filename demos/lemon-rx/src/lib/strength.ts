import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Movement = {
  id: string;
  name: string;
  group_name: string;
  sort_order: number;
};

export type UserRm = {
  movement_id: string;
  rm_1: number | null;
  rm_2: number | null;
  rm_3: number | null;
  rm_4: number | null;
  rm_5: number | null;
};

export async function getMovements(): Promise<Movement[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("movements")
    .select("id, name, group_name, sort_order")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  return (data ?? []) as Movement[];
}

export async function getUserRms(userId: string): Promise<UserRm[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_rms")
    .select("movement_id, rm_1, rm_2, rm_3, rm_4, rm_5")
    .eq("user_id", userId);
  return (data ?? []) as UserRm[];
}

export async function getUserRm1Map(userId: string, movementIds: string[]) {
  const ids = [...new Set(movementIds.filter(Boolean))];
  if (ids.length === 0) return {} as Record<string, number>;
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_rms")
    .select("movement_id, rm_1")
    .eq("user_id", userId)
    .in("movement_id", ids);
  return Object.fromEntries(
    (data ?? [])
      .filter((row) => row.rm_1 != null)
      .map((row) => [row.movement_id as string, Number(row.rm_1)]),
  );
}
