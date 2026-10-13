import Link from "next/link";

export default function NotFound() {
  return (
    <main id="contenido" className="container section" style={{ textAlign: "center" }}>
      <p className="eyebrow">Error 404</p>
      <h1 className="display h2" style={{ marginTop: 16 }}>
        Esta página <em>no existe.</em>
      </h1>
      <p className="lead" style={{ margin: "16px auto 32px" }}>
        Puede que el enlace esté mal escrito o que la página se haya movido.
      </p>
      <Link className="btn btn--primary" href="/">
        Volver al inicio
      </Link>
    </main>
  );
}
