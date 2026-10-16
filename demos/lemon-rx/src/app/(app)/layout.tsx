import { getViewer } from "@/lib/auth";
import { Wordmark } from "@/components/wordmark";
import { AdminNav } from "@/components/admin-nav";
import { Avatar } from "@/components/avatar";
import { IntentLink } from "@/components/intent-link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, profile } = await getViewer();
  return (
    <div className={`min-h-dvh ${isAdmin ? "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0" : ""}`}>
      <header className="sticky top-0 z-20 border-b border-line bg-ink pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 md:h-16 md:px-6">
          <IntentLink href={isAdmin ? "/admin" : "/"} className="press -mx-1 shrink-0 px-1 py-2" aria-label="Lemon RX, inicio"><Wordmark className="text-[26px] md:text-[28px]" /></IntentLink>
          {isAdmin && <AdminNav variant="top" />}
          {isAdmin && (
            <IntentLink
              href="/admin/programacion"
              className="press flex h-9 shrink-0 items-center justify-center rounded-sm border border-lemon bg-lemon px-3 font-display text-[12px] font-bold uppercase tracking-[0.05em] text-ink md:hidden"
            >
              Crear
            </IntentLink>
          )}
          {!isAdmin && <nav aria-label="Principal" className="ml-auto flex min-w-0 overflow-x-auto"><IntentLink href="/ranking" className="press flex h-11 shrink-0 items-center px-2 text-[14px] font-semibold text-chalk-2 hover:text-chalk">Ranking</IntentLink><IntentLink href="/rms" className="press flex h-11 shrink-0 items-center px-2 text-[14px] font-semibold text-chalk-2 hover:text-chalk">RM's</IntentLink><IntentLink href="/historial" className="press flex h-11 shrink-0 items-center px-2 text-[14px] font-semibold text-chalk-2 hover:text-chalk">Historial</IntentLink></nav>}
          <IntentLink href="/cuenta" className="press -mr-2 flex h-11 shrink-0 items-center gap-2 px-2 text-[14px] font-semibold text-chalk-2 hover:text-chalk">
            <Avatar url={profile.avatar_url} name={profile.full_name} size="sm" />
            <span className="max-w-[7rem] truncate">{isAdmin ? "Cuenta" : "Mi cuenta"}</span>
          </IntentLink>
        </div>
      </header>
      {children}
      {isAdmin && <AdminNav variant="bottom" />}
      <span className="sr-only">Sesión iniciada como {profile.full_name || profile.email}</span>
    </div>
  );
}
