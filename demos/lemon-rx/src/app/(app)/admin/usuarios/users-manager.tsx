"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { setAccess, setPayment, setRole } from "../actions";
import { Segmented } from "@/components/segmented";
import { Toast, useToast } from "@/components/toast";
import { formatJoined } from "@/lib/dates";
import type { AccessStatus, PaymentStatus, Profile, Role, Settings } from "@/lib/types";

const FILTERS = [
  { value: "todos", label: "Todos" },
  { value: "nuevos", label: "Pendientes de activar" },
  { value: "con-acceso", label: "Con acceso" },
  { value: "sin-acceso", label: "Sin acceso" },
  { value: "pago-pendiente", label: "Pago pendiente" },
] as const;

type Patch = { id: string } & Partial<Pick<Profile, "payment_status" | "access_status" | "role">>;

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function UsersManager({
  profiles,
  settings,
  meId,
  initialQuery,
  initialFilter,
}: {
  profiles: Profile[];
  settings: Settings;
  meId: string;
  initialQuery: string;
  initialFilter: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(FILTERS.some((f) => f.value === initialFilter) ? initialFilter : "todos");
  const deferredQuery = useDeferredValue(query);
  const [, startTransition] = useTransition();
  const [optimistic, applyOptimistic] = useOptimistic(profiles, (state, patch: Patch) =>
    state.map((p) => (p.id === patch.id ? { ...p, ...patch } : p)),
  );
  const { toast, show } = useToast();

  // Mantiene búsqueda y filtro en la URL (compartible, y sobrevive a recargar).
  useEffect(() => {
    const url = new URL(window.location.href);
    if (deferredQuery) url.searchParams.set("q", deferredQuery);
    else url.searchParams.delete("q");
    if (filter !== "todos") url.searchParams.set("filtro", filter);
    else url.searchParams.delete("filtro");
    window.history.replaceState(null, "", url);
  }, [deferredQuery, filter]);

  const seesProgram = (p: Profile) =>
    p.role === "admin" || (p.access_status === "active" && (p.payment_status === "paid" || !settings.auto_block_unpaid));

  const visible = useMemo(() => {
    const q = normalize(deferredQuery.trim());
    return optimistic.filter((p) => {
      if (q && !normalize(`${p.full_name} ${p.email}`).includes(q)) return false;
      switch (filter) {
        case "nuevos":
          return p.access_status === "pending" && p.role !== "admin";
        case "con-acceso":
          return seesProgram(p);
        case "sin-acceso":
          return !seesProgram(p);
        case "pago-pendiente":
          return p.payment_status === "pending" && p.role !== "admin";
        default:
          return true;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optimistic, deferredQuery, filter, settings.auto_block_unpaid]);

  function mutate(patch: Patch, run: () => Promise<{ ok: boolean; error?: string }>, done: string) {
    startTransition(async () => {
      applyOptimistic(patch);
      const result = await run();
      if (!result.ok) show(result.error ?? "No se ha podido guardar.", "error");
      else show(done);
    });
  }

  return (
    <>
      <div className="mt-8 space-y-3">
        <label htmlFor="buscar" className="sr-only">
          Buscar por nombre o email
        </label>
        <input
          id="buscar"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o email"
          autoComplete="off"
          enterKeyHint="search"
          className="field"
        />
        <div className="flex items-center gap-3">
          <label htmlFor="filtro" className="shrink-0 text-[14px] text-chalk-3">
            Mostrar
          </label>
          <select id="filtro" value={filter} onChange={(e) => setFilter(e.target.value)} className="field min-h-11 flex-1 sm:max-w-xs">
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <p className="ml-auto shrink-0 text-[14px] text-chalk-3" aria-live="polite">
            {visible.length} {visible.length === 1 ? "usuario" : "usuarios"}
          </p>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 border-t border-line pt-6 text-[17px] text-chalk-3">
          {profiles.length === 0
            ? "Todavía no se ha registrado nadie. Comparte el enlace de registro con tus atletas."
            : "Ningún usuario coincide con la búsqueda."}
        </p>
      ) : (
        <ul className="mt-6 border-t border-line">
          {visible.map((p) => (
            <UserRow
              key={p.id}
              profile={p}
              isMe={p.id === meId}
              sees={seesProgram(p)}
              autoBlock={settings.auto_block_unpaid}
              onPayment={(v) =>
                mutate({ id: p.id, payment_status: v }, () => setPayment(p.id, v), v === "paid" ? "Marcado como pagado" : "Marcado como pendiente")
              }
              onAccess={(v) =>
                mutate({ id: p.id, access_status: v }, () => setAccess(p.id, v), v === "active" ? "Acceso activado" : "Acceso bloqueado")
              }
              onRole={(v) => {
                const ok = window.confirm(
                  v === "admin"
                    ? `¿Dar acceso de administrador a ${p.full_name || p.email}? Podrá editar la programación y gestionar usuarios.`
                    : `¿Quitar el rol de administrador a ${p.full_name || p.email}?`,
                );
                if (!ok) return;
                mutate(
                  v === "admin" ? { id: p.id, role: v, access_status: "active" } : { id: p.id, role: v },
                  () => setRole(p.id, v),
                  v === "admin" ? "Ahora es administrador" : "Ya no es administrador",
                );
              }}
            />
          ))}
        </ul>
      )}

      <Toast toast={toast} className="bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8" />
    </>
  );
}

function UserRow({
  profile: p,
  isMe,
  sees,
  autoBlock,
  onPayment,
  onAccess,
  onRole,
}: {
  profile: Profile;
  isMe: boolean;
  sees: boolean;
  autoBlock: boolean;
  onPayment: (v: PaymentStatus) => void;
  onAccess: (v: AccessStatus) => void;
  onRole: (v: Role) => void;
}) {
  const isAdmin = p.role === "admin";
  const reason = sees
    ? null
    : p.access_status === "pending"
      ? "Nuevo: activa su acceso"
      : p.access_status === "blocked"
        ? "Acceso bloqueado"
        : autoBlock && p.payment_status === "pending"
          ? "Oculta por pago pendiente"
          : null;

  return (
    <li className="border-b border-line py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="truncate text-[18px] font-semibold">
            {p.full_name || "Sin nombre"}
            {isMe && <span className="ml-2 text-[14px] font-normal text-chalk-3">(tú)</span>}
          </p>
          <p className="truncate text-[15px] text-chalk-3">{p.email}</p>
        </div>
        <p className="text-[14px] text-chalk-3">Alta {formatJoined(p.created_at)}</p>
      </div>
      <Link
        href={`/admin/usuarios/${p.id}`}
        className="press -ml-1 mt-1 inline-flex h-11 items-center gap-2 px-1 text-[15px] font-semibold text-lemon hover:text-chalk"
      >
        Ver bloques hechos y notas <span aria-hidden>→</span>
      </Link>

      {isAdmin ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-[15px] font-bold uppercase tracking-[0.08em] text-lemon">Administrador</p>
          {!isMe && (
            <button type="button" onClick={() => onRole("athlete")} className="press h-11 text-[14px] font-semibold text-chalk-3 hover:text-chalk">
              Quitar administrador
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-chalk-3">Pago</p>
              <Segmented
                label={`Pago de ${p.full_name || p.email}`}
                value={p.payment_status}
                onChange={onPayment}
                options={[
                  { value: "paid", label: "Pagado", tone: "ok" },
                  { value: "pending", label: "Pendiente", tone: "warn" },
                ]}
              />
            </div>
            <div>
              <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-chalk-3">Acceso</p>
              <Segmented
                label={`Acceso de ${p.full_name || p.email}`}
                value={p.access_status === "pending" ? null : p.access_status}
                onChange={onAccess}
                options={[
                  { value: "active", label: "Activo", tone: "ok" },
                  { value: "blocked", label: "Bloqueado", tone: "warn" },
                ]}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className={`text-[14px] ${sees ? "text-ok" : "text-chalk-2"}`}>
              {sees ? "Ve la programación" : `No ve la programación${reason ? ` · ${reason}` : ""}`}
            </p>
            <button type="button" onClick={() => onRole("admin")} className="press h-11 text-[14px] font-semibold text-chalk-3 hover:text-chalk">
              Hacer administrador
            </button>
          </div>
        </>
      )}
    </li>
  );
}
