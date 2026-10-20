"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/wordmark";

export default function RecoveryHandoffPage() {
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!code) {
      setError("El enlace de recuperación no es válido. Solicita uno nuevo.");
      return;
    }
    if (!url || !key) {
      setError("No se ha podido preparar el cambio de contraseña. Inténtalo de nuevo.");
      return;
    }

    void (async () => {
      // Cliente aislado: en esta pantalla el intercambio lo hacemos explícitamente
      // para impedir que el código PKCE de un solo uso se consuma dos veces.
      const supabase = createBrowserClient(url, key, {
        isSingleton: false,
        auth: { detectSessionInUrl: false },
      });
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        // Si una segunda ejecución llega después de que la sesión ya se haya creado,
        // no tratamos el enlace como caducado: continuamos con la sesión existente.
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          setError("Este enlace ya no es válido o ha caducado. Solicita uno nuevo.");
          return;
        }
      }

      window.location.replace("/nueva-contrasena");
    })();
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[26rem] flex-col px-5 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <Wordmark className="text-[40px]" />
      <p className="mt-2 text-[15px] text-chalk-3">Programación de CrossFit</p>

      <div className="mt-12 flex-1">
        <h1 className="font-display text-[34px] font-bold uppercase leading-none">Nueva contraseña</h1>
        {!error ? (
          <p className="mt-4 text-[15px] leading-relaxed text-chalk-3">
            Estamos preparando tu acceso seguro para que puedas crear una contraseña nueva.
          </p>
        ) : (
          <>
            <p className="mt-4 text-[15px] leading-relaxed text-red-300">{error}</p>
            <Link
              href="/recuperar"
              className="mt-8 inline-flex h-11 items-center font-semibold text-chalk underline decoration-lemon decoration-2 underline-offset-4"
            >
              Solicitar un enlace nuevo
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
