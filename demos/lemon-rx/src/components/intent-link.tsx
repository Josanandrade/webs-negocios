"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useRef, type AnchorHTMLAttributes } from "react";

type Props = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

/**
 * Link sin prefetch automático. Solo prepara el destino cuando el usuario
 * muestra intención real de navegar: hover/foco o inicio de toque.
 * Evita la precarga masiva de rutas privadas, pero reduce la espera del clic.
 */
export const IntentLink = forwardRef<HTMLAnchorElement, Props>(function IntentLink(
  { href, onMouseEnter, onMouseLeave, onFocus, onTouchStart, prefetch: _prefetch, ...props },
  ref,
) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetched = useRef(false);

  function prepare(delay = 0) {
    if (prefetched.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      prefetched.current = true;
      router.prefetch(String(href));
    }, delay);
  }

  function cancelHover() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  return (
    <Link
      {...props}
      ref={ref}
      href={href}
      prefetch={false}
      onMouseEnter={(event) => {
        prepare(70);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        cancelHover();
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        prepare();
        onFocus?.(event);
      }}
      onTouchStart={(event) => {
        prepare();
        onTouchStart?.(event);
      }}
    />
  );
});
