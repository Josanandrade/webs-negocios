import "server-only";
import { createClient } from "@/lib/supabase/server";
import { mondayOf, todayIso } from "@/lib/dates";

/**
 * Explicit kill switch. Off by default, including previews, until all existing
 * athletes have verified subscription dates and database RLS is updated.
 */
export const SUBSCRIPTION_ENFORCEMENT_ENABLED = process.env.LEMON_RX_SUBSCRIPTION_ENFORCEMENT === "true";

type Period = { starts_on: string; ends_on: string };
export type SubscriptionAccess = {
  activeToday: boolean;
  homeAllowed: boolean;
  canViewWeek: (weekStart: string) => boolean;
  expiry: string | null;
};

export async function getSubscriptionAccess(userId: string, isAdmin: boolean, today = todayIso()): Promise<SubscriptionAccess> {
  if (isAdmin) return { activeToday: true, homeAllowed: true, expiry: null, canViewWeek: () => true };
  const supabase = await createClient();
  const { data, error } = await supabase.from("athlete_subscription_periods")
    .select("starts_on,ends_on")
    .eq("user_id", userId).is("voided_at", null)
    .order("ends_on", { ascending: false })
    .returns<Period[]>();
  if (error) throw new Error("No se pudo comprobar la suscripción.");
  const periods = data ?? [];
  // Home closes ON the expiration date. A renewal/courtesy starting that day restores it.
  const homeAllowed = periods.some(p => p.starts_on <= today && today < p.ends_on);
  const activeToday = periods.some(p => p.starts_on <= today && today <= p.ends_on);
  return {
    activeToday, homeAllowed, expiry: periods[0]?.ends_on ?? null,
    canViewWeek: (weekStart: string) => periods.some(p => {
      const monday = mondayOf(p.ends_on);
      return weekStart <= monday && weekStart <= p.ends_on && weekStart + "" !== "" &&
        // Week ending Sunday must intersect the subscription's start.
        Date.parse(weekStart + "T00:00:00Z") + 6 * 86400000 >= Date.parse(p.starts_on + "T00:00:00Z");
    }),
  };
}
