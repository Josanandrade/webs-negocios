"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Panel", match: (p: string) => p === "/admin" },
  { href: "/", label: "Programación", match: (p: string) => p === "/" },
  { href: "/ranking", label: "Ranking", match: (p: string) => p.startsWith("/ranking") },
  { href: "/rms", label: "RM's", match: (p: string) => p.startsWith("/rms") },
  { href: "/admin/programacion", label: "Crear", match: (p: string) => p.startsWith("/admin/programacion") },
  { href: "/admin/usuarios", label: "Usuarios", match: (p: string) => p.startsWith("/admin/usuarios") },
  { href: "/admin/ajustes", label: "Ajustes", match: (p: string) => p.startsWith("/admin/ajustes") },
];

const CREATE_ITEM = ITEMS.find((item) => item.label === "Crear")!;
const MOBILE_ITEMS = ITEMS.filter((item) => item.label !== "Crear");

export function AdminNav({ variant }: { variant: "top" | "bottom" }) {
  const pathname = usePathname();

  if (variant === "top") {
    return (
      <nav aria-label="Administración" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`press relative flex h-11 items-center px-2 font-display text-[14px] font-bold uppercase tracking-[0.04em] ${active ? "text-chalk" : "text-chalk-3 hover:text-chalk"}`}
                >
                  {item.label === "Crear" ? "Crear programación" : item.label}
                  {active && <span className="absolute inset-x-2 bottom-1 h-[3px] bg-lemon" aria-hidden />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  const createActive = CREATE_ITEM.match(pathname);

  return (
    <>
      <Link
        href={CREATE_ITEM.href}
        aria-current={createActive ? "page" : undefined}
        className={`press fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-40 flex h-12 -translate-x-1/2 items-center justify-center rounded-sm border px-7 font-display text-[14px] font-bold uppercase tracking-[0.05em] md:hidden ${
          createActive
            ? "border-chalk bg-chalk text-ink"
            : "border-lemon bg-lemon text-ink"
        }`}
      >
        Crear
      </Link>

      <nav
        aria-label="Administración"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid w-full grid-cols-6">
          {MOBILE_ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`press relative flex h-16 min-w-0 items-center justify-center px-0.5 text-center font-display text-[10px] font-bold uppercase tracking-[0.02em] ${active ? "text-chalk" : "text-chalk-3"}`}
                >
                  {active && <span className="absolute inset-x-2 top-0 h-[3px] bg-lemon" aria-hidden />}
                  <span className="truncate">{item.label === "Programación" ? "Semana" : item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
