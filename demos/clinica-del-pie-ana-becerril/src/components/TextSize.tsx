"use client";

import { useEffect, useState } from "react";

// Botón para agrandar la letra de toda la página. Se recuerda en este
// navegador si se puede; si no, simplemente no se recuerda.
export default function TextSize() {
  const [big, setBig] = useState(false);

  useEffect(() => {
    let saved = false;
    try {
      saved = window.localStorage.getItem("letra") === "grande";
    } catch {}
    const t = window.setTimeout(() => setBig(saved), 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("text-big", big);
    try {
      window.localStorage.setItem("letra", big ? "grande" : "normal");
    } catch {}
  }, [big]);

  return (
    <button type="button" className="textsize" aria-pressed={big} onClick={() => setBig(!big)}>
      <span aria-hidden="true" className="textsize__a">A</span>
      <span aria-hidden="true" className="textsize__A">A</span>
      {big ? "Letra normal" : "Letra más grande"}
    </button>
  );
}
