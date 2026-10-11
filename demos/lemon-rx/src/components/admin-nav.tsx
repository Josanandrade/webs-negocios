"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Panel", match: (p: string) => p === "/admin" },
  { href: "/", label: "Programación", match: (p: string) => p === "/" },
  { href: "/ranking", label: "Ranking", match: (p: string) => p.startsWith("/ranking") },
  { href: "/admin/programacion", label: "Crear", match: (p: string) => p.startsWith("/admin/programacion") },
  { href: "/admin/usuarios", label: "Usuarios", match: (p: string) => p.startsWith("/admin/usuarios") },
  { href: "/admin/ajustes", label: "Ajustes", match: (p: string) => p.startsWith("/admin/ajustes") },
];

/** Barra inferior en móvil (alcanzable con el pulgar), fila de enlaces en escritorio. */
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
                  className={`press relative flex h-11 items-center px-3 font-display text-[16px] font-bold uppercase tracking-[0.05em] ${
                    active ? "text-chalk" : "text-chalk-3 hover:text-chalk"
                  }`}
                >
                  {item.label === "Crear" ? "Crear programación" : item.label}
                  {active && <span className="absolute inset-x-3 bottom-1 h-[3px] bg-lemon" aria-hidden />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Administración"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-6">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`press relative flex h-16 flex-col items-center justify-center font-display text-[12px] font-bold uppercase tracking-[0.06em] ${
                  active ? "text-chalk" : "text-chalk-3"
                }`}
              >
                {active && <span className="absolute inset-x-4 top-0 h-[3px] bg-lemon" aria-hidden />}
                {item.label === "Programación" ? "Semana" : item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
