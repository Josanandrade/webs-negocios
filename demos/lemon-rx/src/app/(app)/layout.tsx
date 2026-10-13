import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { Wordmark } from "@/components/wordmark";
import { AdminNav } from "@/components/admin-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, profile } = await getViewer();
  return (
    <div className={`min-h-dvh ${isAdmin ? "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0" : ""}`}>
      <header className="sticky top-0 z-20 border-b border-line bg-ink pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 md:h-16 md:px-6">
          <Link href={isAdmin ? "/admin" : "/"} className="press -mx-1 shrink-0 px-1 py-2" aria-label="Lemon RX, inicio"><Wordmark className="text-[26px] md:text-[28px]" /></Link>
          {isAdmin && <AdminNav variant="top" />}
          {!isAdmin && <nav aria-label="Principal" className="ml-auto flex min-w-0 overflow-x-auto"><Link href="/ranking" className="press flex h-11 shrink-0 items-center px-2 text-[14px] font-semibold text-chalk-2 hover:text-chalk">Ranking</Link><Link href="/rms" className="press flex h-11 shrink-0 items-center px-2 text-[14px] font-semibold text-chalk-2 hover:text-chalk">RM's</Link><Link href="/historial" className="press flex h-11 shrink-0 items-center px-2 text-[14px] font-semibold text-chalk-2 hover:text-chalk">Historial</Link></nav>}
          <Link href="/cuenta" className="press -mr-2 flex h-11 shrink-0 items-center px-2 text-[14px] font-semibold text-chalk-2 hover:text-chalk"><span className="max-w-[7rem] truncate">{isAdmin ? "Cuenta" : "Mi cuenta"}</span></Link>
        </div>
      </header>
      {children}
      {isAdmin && <AdminNav variant="bottom" />}
      <span className="sr-only">Sesión iniciada como {profile.full_name || profile.email}</span>
    </div>
  );
}
