"use client";

import { ASK_EVENT, type AskDetail } from "./Consulta";

// Rellena la consulta con el animal o el pasillo elegido y baja hasta ella.
export function AskButton({ children, className = "", ...detail }: AskDetail & { children: React.ReactNode; className?: string }) {
  return (
    <a
      href="#consulta"
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent<AskDetail>(ASK_EVENT, { detail }));
        // El salto lo hace el propio enlace; luego llevamos el foco al título.
        requestAnimationFrame(() => document.getElementById("consulta-title")?.focus({ preventScroll: true }));
      }}
    >
      {children}
    </a>
  );
}
