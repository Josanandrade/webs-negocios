"use client";

import { useEffect, useRef, useState } from "react";
import { academy } from "@/content/site";

// Solicitud simulada en el navegador: no hace ninguna petición de red,
// no guarda nada y no registra alumnos ni matrículas.

type Mode = "info" | "matricula";
type Who = "familia" | "alumno";

const needs = ["Conocer las opciones", "Resolver una duda", "Empezar cuanto antes", "Otra cosa"] as const;
const stepNames = ["Quién eres", "Qué necesitas", "Cómo te contactamos"] as const;

const empty = {
  who: "" as Who | "",
  name: "",
  student: "",
  need: "" as (typeof needs)[number] | "",
  message: "",
  phone: "",
  email: "",
  via: "llamada" as "llamada" | "email",
  slot: "Me da igual",
  ok: false,
};

export function Solicitud() {
  const [mode, setMode] = useState<Mode>("info");
  const [step, setStep] = useState(0);
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<{ ref: string } | null>(null);
  const top = useRef<HTMLDivElement>(null);

  // Los botones «Quiero apuntarme» de la página llegan con #apuntarme.
  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#apuntarme") setMode("matricula");
      if (window.location.hash === "#solicitud") setMode("info");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => {
    setF((s) => ({ ...s, [k]: v }));
    setErrors((e) => {
      const { [k]: _drop, ...rest } = e;
      void _drop;
      return rest;
    });
  };

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!f.who) e.who = "Elige una opción.";
      if (f.name.trim().length < 2) e.name = "Escribe tu nombre.";
    }
    if (s === 1) {
      if (!f.need) e.need = "Elige una opción.";
      if (f.need === "Otra cosa" && f.message.trim().length < 5) e.message = "Cuéntanos brevemente qué necesitas.";
    }
    if (s === 2) {
      const phone = f.phone.replace(/\s/g, "");
      if (!phone && !f.email.trim()) e.phone = "Déjanos un teléfono o un email.";
      if (phone && !/^(\+34)?[6789]\d{8}$/.test(phone)) e.phone = "Revisa el teléfono (9 cifras).";
      if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Revisa el email.";
      if (f.via === "llamada" && !phone) e.phone = "Para llamarte necesitamos un teléfono.";
      if (f.via === "email" && !f.email.trim()) e.email = "Para escribirte necesitamos un email.";
      if (!f.ok) e.ok = "Necesitamos tu permiso para contactarte.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const focusTop = () => top.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const next = () => {
    if (!validate(step)) return;
    if (step < 2) {
      setStep(step + 1);
      focusTop();
      return;
    }
    const ref = `AD-${Math.floor(1000 + Math.random() * 9000)}`;
    setSent({ ref });
    focusTop();
  };

  const reset = () => {
    setF(empty);
    setStep(0);
    setSent(null);
    setErrors({});
  };

  const progress = sent ? 100 : Math.round(((step + 0.5) / 3) * 100);

  return (
    <div className="form-shell" ref={top}>
      <div className="mode" role="tablist" aria-label="Tipo de solicitud">
        <button type="button" role="tab" aria-selected={mode === "info"} className={mode === "info" ? "on" : ""} onClick={() => setMode("info")} disabled={!!sent}>
          Pedir información
        </button>
        <button type="button" role="tab" aria-selected={mode === "matricula"} className={mode === "matricula" ? "on" : ""} onClick={() => setMode("matricula")} disabled={!!sent}>
          Quiero apuntarme
        </button>
      </div>

      <div className="meter" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <ol className="meter-steps">
        {stepNames.map((s, i) => (
          <li key={s} className={sent || i < step ? "done" : i === step ? "now" : ""}>
            {s}
          </li>
        ))}
      </ol>

      {sent ? (
        <div className="sent" role="status" aria-live="polite">
          <div className="sent-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48"><path d="M13 25l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h3>{mode === "matricula" ? "¡Ya estás en camino!" : "¡Solicitud recibida!"}</h3>
          <p>
            Gracias, {f.name.trim().split(" ")[0]}. {academy.name} te contactará por {f.via === "llamada" ? "teléfono" : "email"}
            {f.slot !== "Me da igual" ? ` por la ${f.slot.toLowerCase()}` : ""}
            {mode === "matricula" ? " para explicarte cómo formalizar la matrícula." : " para resolver tus dudas."}
          </p>
          <dl className="ticket">
            <div><dt>Referencia</dt><dd>{sent.ref}</dd></div>
            <div><dt>Tipo</dt><dd>{mode === "matricula" ? "Quiero apuntarme" : "Información"}</dd></div>
            <div><dt>Quién</dt><dd>{f.who === "familia" ? `Familia${f.student.trim() ? ` de ${f.student.trim()}` : ""}` : "Alumno/a"}</dd></div>
            <div><dt>Necesita</dt><dd>{f.need}</dd></div>
            <div><dt>Contacto</dt><dd>{f.via === "llamada" ? f.phone : f.email}</dd></div>
          </dl>
          <p className="sim-note">Esto es una simulación: no se ha enviado ni guardado ningún dato.</p>
          <button type="button" className="btn btn-ghost" onClick={reset}>Hacer otra solicitud</button>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          {step === 0 && (
            <fieldset>
              <legend>{mode === "matricula" ? "Genial, empecemos. ¿Quién nos escribe?" : "¿Quién nos escribe?"}</legend>
              <div className="choice-row">
                {(["familia", "alumno"] as Who[]).map((w) => (
                  <label key={w} className={`choice ${f.who === w ? "on" : ""}`}>
                    <input type="radio" name="who" value={w} checked={f.who === w} onChange={() => set("who", w)} />
                    <strong>{w === "familia" ? "Familia" : "Alumno/a"}</strong>
                    <span>{w === "familia" ? "Escribo por mi hijo o hija" : "Escribo por mí"}</span>
                  </label>
                ))}
              </div>
              {errors.who && <p className="err">{errors.who}</p>}
              <label className="field">
                <span>Tu nombre</span>
                <input value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={!!errors.name} />
                {errors.name && <em className="err">{errors.name}</em>}
              </label>
              {f.who === "familia" && (
                <label className="field">
                  <span>Nombre del alumno o alumna <small>(opcional)</small></span>
                  <input value={f.student} onChange={(e) => set("student", e.target.value)} />
                </label>
              )}
            </fieldset>
          )}

          {step === 1 && (
            <fieldset>
              <legend>¿En qué podemos ayudarte?</legend>
              <div className="chips">
                {needs.map((n) => (
                  <label key={n} className={`chip ${f.need === n ? "on" : ""}`}>
                    <input type="radio" name="need" value={n} checked={f.need === n} onChange={() => set("need", n)} />
                    {n}
                  </label>
                ))}
              </div>
              {errors.need && <p className="err">{errors.need}</p>}
              <label className="field">
                <span>Cuéntanos un poco más {f.need !== "Otra cosa" && <small>(opcional)</small>}</span>
                <textarea
                  rows={4}
                  value={f.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder={f.who === "familia" ? "Por ejemplo: qué curso hace, qué le cuesta o qué os gustaría conseguir." : "Por ejemplo: qué estudias, qué te cuesta o qué quieres conseguir."}
                  aria-invalid={!!errors.message}
                />
                {errors.message && <em className="err">{errors.message}</em>}
              </label>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset>
              <legend>¿Cómo prefieres que te contactemos?</legend>
              <div className="choice-row compact">
                {(["llamada", "email"] as const).map((v) => (
                  <label key={v} className={`choice ${f.via === v ? "on" : ""}`}>
                    <input type="radio" name="via" value={v} checked={f.via === v} onChange={() => set("via", v)} />
                    <strong>{v === "llamada" ? "Llamada" : "Email"}</strong>
                  </label>
                ))}
              </div>
              <div className="two">
                <label className="field">
                  <span>Teléfono {f.via === "email" && <small>(opcional)</small>}</span>
                  <input inputMode="tel" autoComplete="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} />
                  {errors.phone && <em className="err">{errors.phone}</em>}
                </label>
                <label className="field">
                  <span>Email {f.via === "llamada" && <small>(opcional)</small>}</span>
                  <input type="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} />
                  {errors.email && <em className="err">{errors.email}</em>}
                </label>
              </div>
              <label className="field">
                <span>¿Cuándo te viene mejor?</span>
                <select value={f.slot} onChange={(e) => set("slot", e.target.value)}>
                  <option>Me da igual</option>
                  <option>Mañana</option>
                  <option>Tarde</option>
                </select>
              </label>
              <label className="check">
                <input type="checkbox" checked={f.ok} onChange={(e) => set("ok", e.target.checked)} />
                <span>Acepto que {academy.name} use estos datos solo para responder a mi solicitud.</span>
              </label>
              {errors.ok && <p className="err">{errors.ok}</p>}
            </fieldset>
          )}

          <div className="form-nav">
            {step > 0 ? (
              <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
                Atrás
              </button>
            ) : (
              <span className="form-hint">Paso 1 de 3 · menos de un minuto</span>
            )}
            <button type="submit" className="btn btn-primary">
              {step < 2 ? "Continuar" : mode === "matricula" ? "Enviar solicitud de matrícula" : "Enviar solicitud"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
