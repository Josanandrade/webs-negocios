"use client";

import { useEffect, useRef, useState } from "react";
import type { GalleryPhoto } from "@/lib/types";
import PhotoFrame from "./PhotoFrame";
import styles from "./PhotoStrip.module.css";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Tira horizontal de fotografías.
 *
 * - Es un contenedor con scroll horizontal real: se navega con el dedo, el
 *   trackpad, arrastrando con el ratón, con las flechas o con el teclado.
 * - En escritorio (puntero fino y sin movimiento reducido), el scroll vertical
 *   de la página además desplaza la tira. La posición que elige el usuario se
 *   suma a ese desplazamiento automático en lugar de pelearse con él.
 */
export default function PhotoStrip({ photos, label }: { photos: GalleryPhoto[]; label: string }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  // true mientras el usuario mueve la tira a mano (flechas con scroll suave o arrastre):
  // el desplazamiento automático se pausa para no cortar ni pelear con ese gesto
  const interactingRef = useRef(false);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const driftEnabled = () => fine.matches && !reduce.matches;

    const maxScroll = () => Math.max(0, strip.scrollWidth - strip.clientWidth);
    // 0 cuando la tira asoma por abajo, 1 cuando sale por arriba
    const autoPosition = () => {
      const r = strip.getBoundingClientRect();
      const vh = window.innerHeight;
      return clamp((vh - r.top) / (vh + r.height), 0, 1) * maxScroll();
    };

    let userOffset = 0; // lo que el usuario ha movido a mano sobre la posición automática
    let expected = -1; // scrollLeft que hemos fijado nosotros (para no confundirlo con el usuario)
    let frame = 0;
    let visible = false;

    const syncUi = () => {
      const max = maxScroll();
      const left = strip.scrollLeft;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max ? left / max : 0})`;
      const start = left <= 1;
      const end = left >= max - 1;
      setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };

    const applyDrift = () => {
      frame = 0;
      if (!driftEnabled() || interactingRef.current) return;
      const auto = autoPosition();
      const target = clamp(auto + userOffset, 0, maxScroll());
      userOffset = target - auto; // si choca con un extremo, el exceso se descarta
      expected = Math.round(target);
      strip.scrollLeft = target;
    };

    const onPageScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(applyDrift);
    };

    const onStripScroll = () => {
      if (driftEnabled() && Math.abs(strip.scrollLeft - expected) > 1) {
        userOffset = strip.scrollLeft - autoPosition();
      }
      syncUi();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) onPageScroll();
    });
    io.observe(strip);

    const onResize = () => {
      syncUi();
      onPageScroll();
    };

    window.addEventListener("scroll", onPageScroll, { passive: true });
    window.addEventListener("resize", onResize);
    strip.addEventListener("scroll", onStripScroll, { passive: true });
    syncUi();

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onPageScroll);
      window.removeEventListener("resize", onResize);
      strip.removeEventListener("scroll", onStripScroll);
    };
  }, []);

  // Arrastrar con el ratón (en táctil, el scroll nativo ya lo hace)
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    let startX = 0;
    let startLeft = 0;
    let dragging = false;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      interactingRef.current = true;
      startX = e.clientX;
      startLeft = strip.scrollLeft;
      strip.setPointerCapture(e.pointerId);
      strip.dataset.dragging = "true";
    };
    const move = (e: PointerEvent) => {
      if (dragging) strip.scrollLeft = startLeft - (e.clientX - startX);
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      interactingRef.current = false;
      strip.releasePointerCapture(e.pointerId);
      delete strip.dataset.dragging;
    };
    const noNativeDrag = (e: DragEvent) => e.preventDefault();

    strip.addEventListener("pointerdown", down);
    strip.addEventListener("pointermove", move);
    strip.addEventListener("pointerup", up);
    strip.addEventListener("pointercancel", up);
    strip.addEventListener("dragstart", noNativeDrag);
    return () => {
      strip.removeEventListener("pointerdown", down);
      strip.removeEventListener("pointermove", move);
      strip.removeEventListener("pointerup", up);
      strip.removeEventListener("pointercancel", up);
      strip.removeEventListener("dragstart", noNativeDrag);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const strip = stripRef.current;
    if (!strip) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      // Pausa el desplazamiento automático hasta que termine el scroll suave
      interactingRef.current = true;
      const done = () => {
        interactingRef.current = false;
        strip.removeEventListener("scrollend", done);
        window.clearTimeout(fallback);
      };
      const fallback = window.setTimeout(done, 800); // navegadores sin scrollend
      strip.addEventListener("scrollend", done);
    }
    strip.scrollBy({ left: dir * strip.clientWidth * 0.6, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={styles.root}>
      <div ref={stripRef} className={styles.strip} role="region" aria-label={label} tabIndex={0}>
        <ul role="list" className={styles.track}>
          {photos.map((photo, i) => (
            <li
              key={`${photo.caption}-${i}`}
              className={styles.shot}
              style={{ ["--r" as string]: photo.width / photo.height }}
            >
              <figure>
                <PhotoFrame
                  src={photo.src}
                  alt={photo.alt}
                  label={photo.caption}
                  ratio={`${photo.width} / ${photo.height}`}
                  sizes="(max-width: 900px) 80vw, 45vw"
                  showLabel={false}
                  eager
                />
                <figcaption className="label">{photo.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      <div className={`wrap ${styles.controls}`}>
        <span className={styles.progress} aria-hidden="true">
          <span ref={barRef} className={styles.bar} />
        </span>
        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => step(-1)}
            disabled={edges.start}
            aria-label="Fotos anteriores"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => step(1)}
            disabled={edges.end}
            aria-label="Fotos siguientes"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
