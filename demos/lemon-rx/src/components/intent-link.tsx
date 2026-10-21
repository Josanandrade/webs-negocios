"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useRef, type AnchorHTMLAttributes } from "react";

type Props = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

/**
 * En móvil una pulsación debe producir una sola navegación. El prefetch manual
 * en touchstart competía con el clic real y duplicaba peticiones privadas.
 * Conservamos una preparación suave solo para ratón/trackpad con hover real.
 */
export const IntentLink = forwardRef<HTMLAnchorElement, Props>(function IntentLink(
  { href, onMouseEnter, onMouseLeave, onFocus, onTouchStart, prefetch: _prefetch, ...props },
  ref,
) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetched = useRef(false);

  function prepareDesktop() {
    if (prefetched.current || typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      prefetched.current = true;
      router.prefetch(String(href));
    }, 90);
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
        prepareDesktop();
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        cancelHover();
        onMouseLeave?.(event);
      }}
      onFocus={(event) => onFocus?.(event)}
      onTouchStart={(event) => onTouchStart?.(event)}
    />
  );
});
