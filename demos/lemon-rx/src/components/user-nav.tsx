"use client";

import { usePathname } from "next/navigation";
import { IntentLink } from "@/components/intent-link";

const ITEMS = [
  { href: "/", label: "Semana", match: (p: string) => p === "/" },
  { href: "/home", label: "Home", match: (p: string) => p.startsWith("/home") },
  { href: "/ranking", label: "Ranking", match: (p: string) => p.startsWith("/ranking") },
  { href: "/rms", label: "RM's", match: (p: string) => p.startsWith("/rms") },
  { href: "/historial", label: "Historial", match: (p: string) => p.startsWith("/historial") },
];

export function UserNav({ variant }: { variant: "top" | "bottom" }) {
  const pathname = usePathname();

  if (variant === "top") {
    return (
      <nav aria-label="Principal" className="hidden min-w-0 md:block">
        <ul className="flex items-center gap-1">
          {ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <li key={item.href}>
                <IntentLink
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`press relative flex h-11 items-center px-2 font-display text-[14px] font-bold uppercase tracking-[0.04em] ${active ? "text-chalk" : "text-chalk-3 hover:text-chalk"}`}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-2 bottom-1 h-[3px] bg-lemon" aria-hidden />}
                </IntentLink>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid w-full grid-cols-5">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href} className="min-w-0">
              <IntentLink
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`press relative flex h-16 min-w-0 items-center justify-center px-1 text-center font-display text-[11px] font-bold uppercase tracking-[0.02em] ${active ? "text-chalk" : "text-chalk-3"}`}
              >
                {active && <span className="absolute inset-x-3 top-0 h-[3px] bg-lemon" aria-hidden />}
                <span className="truncate">{item.label}</span>
              </IntentLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
