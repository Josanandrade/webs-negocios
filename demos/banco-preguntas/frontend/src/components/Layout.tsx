import { NavLink, Outlet } from "react-router";
import { useAuth } from "../auth";
import { IconBank, IconDocs, IconLogout, IconQuiz, IconStats } from "./icons";

const NAV = [
  { to: "/tests", label: "Tests", icon: IconQuiz },
  { to: "/banco", label: "Banco", icon: IconBank },
  { to: "/documentos", label: "Documentos", icon: IconDocs },
  { to: "/estadisticas", label: "Estadísticas", icon: IconStats },
];

export function Layout() {
  const { me, logout } = useAuth();
  return (
    <div className="min-h-dvh md:flex">
      {/* Barra lateral (PC / tableta) */}
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 md:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-2 px-2">
          <img src="/icons/icon.svg" alt="" className="h-8 w-8" />
          <span className="font-semibold">Banco de preguntas</span>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Principal">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-100"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-200 px-2 pt-4 text-sm dark:border-slate-800">
          <div className="truncate text-slate-600 dark:text-slate-400" title={me?.email}>
            {me?.display_name || me?.email}
          </div>
          <button onClick={logout} className="mt-2 inline-flex items-center gap-2 text-slate-700 hover:underline dark:text-slate-300">
            <IconLogout /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Cabecera (móvil) */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-2">
          <img src="/icons/icon.svg" alt="" className="h-7 w-7" />
          <span className="font-semibold">Banco de preguntas</span>
        </div>
        <button onClick={logout} aria-label="Cerrar sesión" className="rounded-lg p-2 text-slate-600 dark:text-slate-300">
          <IconLogout />
        </button>
      </header>

      <main className="pb-safe mx-auto w-full max-w-5xl px-4 pt-5 md:px-8 md:pt-8">
        <Outlet />
      </main>

      {/* Barra inferior (móvil) */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-slate-800 dark:bg-slate-900"
      >
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                isActive ? "text-brand-600 dark:text-brand-200" : "text-slate-500 dark:text-slate-400"
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
