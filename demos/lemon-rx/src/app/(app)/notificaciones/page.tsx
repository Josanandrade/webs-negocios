import type { Metadata } from "next";
import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { vapidPublicKey } from "@/lib/push";
import { PushOptIn } from "@/components/push-opt-in";
import { markAllNotificationsRead, markNotificationRead } from "../notification-actions";

export const metadata: Metadata = { title: "Notificaciones" };

type NotificationRow = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string;
  read_at: string | null;
  created_at: string;
};

export default async function NotificationsPage({ searchParams }: PageProps<"/notificaciones">) {
  const viewer = await getViewer();
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_notifications")
    .select("id, kind, title, body, href, read_at, created_at")
    .eq("recipient_id", viewer.profile.id)
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<NotificationRow[]>();
  const notifications = data ?? [];
  const activation = notifications.find((row) => row.kind === "system" && !row.read_at && row.href.startsWith("/notificaciones?activar=1"));
  const unread = notifications.filter((row) => !row.read_at).length;

  return <main className="mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-6 md:pb-16 md:pt-10">
    <div className="flex items-end justify-between gap-4">
      <div><p className="eyebrow">Lemon RX</p><h1 className="mt-1 font-display text-[40px] font-extrabold uppercase leading-none md:text-[48px]">Notificaciones</h1></div>
      {unread > 0 && <form action={markAllNotificationsRead}><button type="submit" className="press min-h-11 text-[13px] font-semibold text-chalk-2 hover:text-chalk">Marcar todas leídas</button></form>}
    </div>

    {(sp.activar === "1" || activation) && <div className="mt-6"><PushOptIn publicKey={vapidPublicKey()} notificationId={activation?.id} compact /></div>}

    {notifications.length === 0 ? <p className="mt-8 border-y border-line py-6 text-[15px] text-chalk-3">Todavía no tienes notificaciones.</p> : <ul className="mt-8 divide-y divide-line border-t border-line">
      {notifications.map((notification) => <li key={notification.id} className={`relative border-b border-line ${notification.read_at ? "opacity-65" : ""}`}>
        <form action={async () => { "use server"; await markNotificationRead(notification.id); }}>
          <button type="submit" className="absolute inset-0 z-0" aria-label="Marcar como leída" tabIndex={-1} />
        </form>
        <Link href={notification.href} className="day-trigger relative z-10 block py-4 pr-3">
          <div className="flex items-start gap-3">
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${notification.read_at ? "bg-line-strong" : "bg-lemon"}`} aria-hidden />
            <div className="min-w-0 flex-1"><p className="text-[15px] font-bold text-chalk">{notification.title}</p>{notification.body && <p className="mt-1 text-[14px] leading-[1.45] text-chalk-2">{notification.body}</p>}<p className="mt-1.5 text-[12px] text-chalk-3">{timeAgo(notification.created_at)}</p></div>
          </div>
        </Link>
      </li>)}
    </ul>}
  </main>;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.max(0, Math.floor(diff / 60000));
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Ayer" : `Hace ${days} días`;
}
