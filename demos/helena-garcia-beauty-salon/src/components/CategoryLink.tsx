"use client";

import type { ReactNode } from "react";
import type { CategoryId } from "@/content/salon";
import { CATEGORY_EVENT } from "./ServiceMenu";

// Enlace a la carta que, además, abre la pestaña correspondiente.
export function CategoryLink({
  category,
  className,
  children,
}: {
  category: CategoryId;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href="#carta"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(CATEGORY_EVENT, { detail: category }))}
    >
      {children}
    </a>
  );
}
