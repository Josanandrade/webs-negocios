import type { AreaId } from "@/lib/site";

// Marcas geométricas de cada área: trazos sobrios, nada de dibujos infantiles.
// Psicología: dos presencias que se encuentran. Logopedia: una voz que sale.
// Pedagogía: peldaños de aprendizaje.
export function AreaMark({ area, className }: { area: AreaId; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      {area === "psicologia" && (
        <>
          <circle cx="15" cy="20" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="25" cy="20" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
        </>
      )}
      {area === "logopedia" && (
        <>
          <path d="M8 12a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5h-6l-6 5v-5.4A5 5 0 0 1 8 20z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M32 13c1.6 1.8 1.6 5.2 0 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {area === "pedagogia" && (
        <path d="M7 31h8v-7h8v-7h8V9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
