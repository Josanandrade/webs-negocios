"use client";

import { useEffect } from "react";

/**
 * Calienta en segundo plano la configuración pública del motor de reservas.
 * No consulta huecos ni bloquea el render: solo adelanta la carga de servicios,
 * profesionales y reglas para que entrar en /reservas sea inmediato en móvil.
 */
export default function BookingSetupWarmup() {
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch("/api/reservas", { cache: "no-store", signal: controller.signal }).catch(() => {
        // Es una optimización oportunista: BookingFlow mostrará su fallback si falla.
      });
    }, 120);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  return null;
}
