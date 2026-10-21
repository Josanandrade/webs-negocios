"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Prepara las rutas más usadas de forma escalonada después de que la pantalla
 * actual ya esté visible. Evita el coste frío del primer toque sin volver a
 * precargar todo el menú a la vez.
 */
export function NavigationWarmup({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const routes = isAdmin
      ? ["/", "/home", "/ranking", "/rms", "/admin", "/admin/ajustes", "/cuenta"]
      : ["/", "/home", "/ranking", "/rms", "/historial", "/cuenta"];
    const pending = routes.filter((route) => route !== pathname);
    let cancelled = false;
    let stepTimer: ReturnType<typeof setTimeout> | null = null;
    let startTimer: ReturnType<typeof setTimeout> | null = null;
    let index = 0;

    const prefetchNext = () => {
      if (cancelled || index >= pending.length) return;
      router.prefetch(pending[index]);
      index += 1;
      stepTimer = setTimeout(prefetchNext, index < 2 ? 1400 : 900);
    };

    const start = () => {
      if (!cancelled) prefetchNext();
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(start, { timeout: 700 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
        if (stepTimer) clearTimeout(stepTimer);
      };
    }

    startTimer = setTimeout(start, 350);
    return () => {
      cancelled = true;
      if (startTimer) clearTimeout(startTimer);
      if (stepTimer) clearTimeout(stepTimer);
    };
  }, [isAdmin, pathname, router]);

  return null;
}
