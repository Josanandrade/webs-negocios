/**
 * Esqueleto que se ve al instante al tocar un enlace mientras el servidor
 * prepara la pantalla. Imita la estructura común (antetítulo, título y lista)
 * para que el contenido real aparezca sin saltos.
 */
export function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 md:px-6 md:pt-10" aria-busy="true">
      <span className="sr-only" role="status">
        Cargando…
      </span>
      <div aria-hidden className="skeleton-fade">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton mt-3 h-10 w-56 md:h-12 md:w-72" />
        <ul className="mt-8 border-t border-line">
          {Array.from({ length: rows }, (_, i) => (
            <li key={i} className="flex min-h-[4.5rem] items-center justify-between gap-4 border-b border-line px-1">
              <div className="skeleton h-6 w-40" />
              <div className="skeleton h-4 w-16" />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
