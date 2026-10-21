import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { vapidPublicKey } from "@/lib/push";
import { Wordmark } from "@/components/wordmark";
import { AdminNav } from "@/components/admin-nav";
import { UserNav } from "@/components/user-nav";
import { Avatar } from "@/components/avatar";
import { IntentLink } from "@/components/intent-link";
import { PushOptIn } from "@/components/push-opt-in";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  const { isAdmin, profile } = viewer;
  const supabase = await createClient();
  const [{ count: unread }, { data: activation }] = await Promise.all([
    supabase.from("app_notifications").select("id", { count: "exact", head: true }).eq("recipient_id", profile.id).is("read_at", null),
    supabase.from("app_notifications").select("id").eq("recipient_id", profile.id).eq("kind", "system").is("read_at", null).like("href", "/notificaciones?activar=1%").order("created_at", { ascending: false }).limit(1).maybeSingle<{ id: string }>(),
  ]);
  const unreadCount = unread ?? 0;

  return (
    <div className="min-h-dvh pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="sticky top-0 z-20 border-b border-line bg-ink pt-[env(safe-area-inset-top)]">
        <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 md:h-16 md:px-6">
          <IntentLink href={isAdmin ? "/admin" : "/home"} className="press -mx-1 shrink-0 px-1 py-2" aria-label="Lemon RX, inicio"><Wordmark className="text-[26px] md:text-[28px]" /></IntentLink>
          {isAdmin ? <AdminNav variant="top" /> : <UserNav variant="top" />}
          {isAdmin && (
            <IntentLink
              href="/admin/programacion"
              className="press absolute left-1/2 top-1/2 flex h-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-lemon bg-lemon px-3 font-display text-[12px] font-bold uppercase tracking-[0.05em] text-ink md:hidden"
            >
              Crear
            </IntentLink>
          )}
          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            <IntentLink href="/notificaciones" aria-label={unreadCount ? `${unreadCount} notificaciones sin leer` : "Notificaciones"} className="press relative flex h-11 w-10 items-center justify-center text-chalk-2 hover:text-chalk">
              <BellIcon />
              {unreadCount > 0 && <span className="absolute right-0.5 top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-lemon px-1 text-[9px] font-extrabold leading-none text-lemon-ink">{unreadCount > 99 ? "99+" : unreadCount}</span>}
            </IntentLink>
            <IntentLink href="/cuenta" className="press -mr-2 flex h-11 items-center gap-2 px-2 text-[14px] font-semibold text-chalk-2 hover:text-chalk">
              <Avatar url={profile.avatar_url} name={profile.full_name} size="sm" />
              <span className="hidden max-w-[7rem] truncate sm:inline">{isAdmin ? "Cuenta" : "Mi cuenta"}</span>
            </IntentLink>
          </div>
        </div>
      </header>
      {children}
      {activation?.id && <PushOptIn publicKey={vapidPublicKey()} notificationId={activation.id} />}
      {isAdmin ? <AdminNav variant="bottom" /> : <UserNav variant="bottom" />}
      <span className="sr-only">Sesión iniciada como {profile.full_name || profile.email}</span>
    </div>
  );
}

function BellIcon() {
  return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>;
}
