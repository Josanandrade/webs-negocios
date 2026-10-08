import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap" style={{ display: "grid", gap: "1.5rem", justifyItems: "start" }}>
        <p className="label mark">Error 404</p>
        <h1 style={{ fontSize: "var(--step-4)" }}>Esta página no existe.</h1>
        <p className="muted">Puede que el enlace haya cambiado. Desde el inicio llegas a todo.</p>
        <Link href="/" className="btn">
          Volver al inicio <span className="arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
