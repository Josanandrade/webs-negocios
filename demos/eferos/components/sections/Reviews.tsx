"use client";

import { useEffect, useRef, useState } from "react";
import { business } from "@/business.config";
import type { ReviewsPayload } from "@/lib/googleReviews";
import styles from "./Reviews.module.css";

type State = { status: "idle" | "loading" | "error" } | { status: "ready"; data: ReviewsPayload };

const ratingLabel = (n: number) => `${n.toLocaleString("es-ES", { maximumFractionDigits: 1 })} de 5 estrellas`;

function Stars({ value, className = "" }: { value: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={`${styles.stars} ${className}`} role="img" aria-label={ratingLabel(value)}>
      {"★★★★★".slice(0, full)}
      <span className={styles.starsOff}>{"★★★★★".slice(full)}</span>
    </span>
  );
}

/**
 * Opiniones reales de Google (Places API, vía /api/google-reviews).
 *
 * - Las reseñas se piden a /api/google-reviews cuando la sección se acerca a la
 *   pantalla: la portada sigue siendo estática y solo se consulta a Google si
 *   alguien llega aquí. La ruta decide en cada petición si hay credenciales
 *   (sin ellas responde { configured: false }), así que activarlas no requiere recompilar.
 * - Sin configuración, o si Google falla, no se muestra ninguna reseña: solo un
 *   enlace a la ficha real en Google Maps. Nunca hay contenido de relleno.
 */
export default function Reviews() {
  const [state, setState] = useState<State>({ status: "idle" });
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setState({ status: "loading" });
        fetch("/api/google-reviews")
          .then((r) => (r.ok ? (r.json() as Promise<ReviewsPayload | { configured: false }>) : Promise.reject(r.status)))
          .then((data) => {
            if (cancelled) return;
            const ok = "reviews" in data && data.reviews.length > 0;
            setState(ok ? { status: "ready", data } : { status: "error" });
          })
          .catch(() => !cancelled && setState({ status: "error" }));
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  const data = state.status === "ready" ? state.data : null;
  const allReviewsUri = data?.reviewsUri ?? business.address.mapsUrl;

  return (
    <section
      ref={ref}
      id="opiniones"
      className={`section ${styles.section} ${data ? "" : styles.compact}`}
      aria-labelledby="opiniones-title"
      aria-busy={state.status === "loading"}
    >
      <div className="wrap grid">
        <div className={styles.summary}>
          <p className="label mark">Opiniones</p>
          <h2 id="opiniones-title" className={styles.title}>
            Lo que dicen en Google
          </h2>

          {data && data.rating !== null ? (
            <div className={styles.score}>
              <p className={`${styles.scoreValue} tabular`}>
                {data.rating.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </p>
              <div className={styles.scoreMeta}>
                <Stars value={data.rating} />
                {data.total !== null && (
                  <p className="muted tabular">
                    {data.total.toLocaleString("es-ES")} {data.total === 1 ? "reseña" : "reseñas"} en Google
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className={`muted ${styles.fallbackText}`}>
              Puedes leer las opiniones de nuestros pacientes directamente en nuestra ficha de Google Maps.
            </p>
          )}

          <div className={styles.links}>
            <a href={allReviewsUri} className="link" target="_blank" rel="noopener">
              {data ? "Ver todas en Google Maps" : "Ver opiniones en Google Maps"}
            </a>
            {data?.writeReviewUri && (
              <a href={data.writeReviewUri} className="link" target="_blank" rel="noopener">
                Escribir una reseña
              </a>
            )}
          </div>
        </div>

        {data && (
          <div className={styles.body}>
            <ol role="list" className={styles.list}>
              {data.reviews.map((r) => (
                <li key={r.id} className={styles.review}>
                  <Stars value={r.rating} className={styles.reviewStars} />
                  <blockquote className={styles.quote}>
                    <p>{r.text}</p>
                  </blockquote>
                  <footer className={styles.meta}>
                    {r.authorPhoto && (
                      // Foto de perfil servida por Google: se muestra tal cual exige la atribución
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.authorPhoto}
                        alt=""
                        width={36}
                        height={36}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className={styles.avatar}
                      />
                    )}
                    <span className={styles.author}>
                      {r.authorUri ? (
                        <a href={r.authorUri} target="_blank" rel="noopener nofollow" className="link">
                          {r.authorName}
                        </a>
                      ) : (
                        r.authorName
                      )}
                      {r.relativeTime && <span className={styles.time}> · {r.relativeTime}</span>}
                    </span>
                    <span className={styles.actions}>
                      {r.reviewUri && (
                        <a href={r.reviewUri} target="_blank" rel="noopener nofollow" className="link">
                          Ver en Google Maps
                        </a>
                      )}
                      {r.flagUri && (
                        <a href={r.flagUri} target="_blank" rel="noopener nofollow" className="link">
                          Denunciar
                        </a>
                      )}
                    </span>
                  </footer>
                </li>
              ))}
            </ol>
            <p className={`label ${styles.attribution}`}>
              Selección y orden de Google, por relevancia · Reseñas de{" "}
              <span className={styles.googleMaps}>Google Maps</span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
