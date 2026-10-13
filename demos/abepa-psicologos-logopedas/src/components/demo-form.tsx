"use client";

import { useState, type FormEvent } from "react";
import { primaryPhone, site } from "@/lib/site";

// Formulario de demostración: no envía, no guarda y no hace peticiones de red.
// Pide lo mínimo para devolver una llamada y avisa de no incluir datos de salud.
export function DemoForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    e.currentTarget.reset();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="form form--done" role="status">
        <p className="form__done-title">Así se vería la confirmación.</p>
        <p>
          Esto es una demo: <strong>no se ha enviado ni guardado nada</strong>. En la web real, el centro
          recibiría el aviso y te llamaría en la franja que elijas.
        </p>
        <p>
          Si quieres contactar ya con el centro, llama al{" "}
          <a href={primaryPhone.href}>{primaryPhone.display}</a> o escribe a{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <button type="button" className="btn btn--soft" onClick={() => setSent(false)}>
          Volver al formulario
        </button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false} aria-describedby="form-note">
      <p id="form-note" className="form__note">
        <strong>Formulario de demostración.</strong> No envía ni guarda datos. Para pedir cita
        hoy, usa el teléfono.
      </p>

      <div className="field">
        <label htmlFor="f-name">Nombre</label>
        <input id="f-name" name="name" type="text" autoComplete="given-name" required maxLength={60} />
      </div>

      <div className="field">
        <label htmlFor="f-phone">Teléfono</label>
        <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required pattern="[0-9 +]{9,15}" maxLength={15} />
      </div>

      <fieldset className="field field--choices">
        <legend>La cita es para</legend>
        <div className="choices">
          {["Un niño o niña", "Un adolescente", "Una persona adulta"].map((v, i) => (
            <label key={v} className="choice">
              <input type="radio" name="who" value={v} required={i === 0} />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="f-area">Área</label>
        <select id="f-area" name="area" defaultValue="">
          <option value="">No lo sé, orientadme</option>
          <option>Psicología</option>
          <option>Logopedia</option>
          <option>Pedagogía</option>
        </select>
      </div>

      <fieldset className="field field--choices">
        <legend>¿Cuándo te llamamos?</legend>
        <div className="choices">
          {["Por la mañana", "Por la tarde"].map((v, i) => (
            <label key={v} className="choice">
              <input type="radio" name="when" value={v} required={i === 0} />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="form__privacy">
        No escribas aquí detalles de salud: los hablamos en persona, con calma y en confianza.
      </p>

      <button type="submit" className="btn btn--solid btn--block">
        Quiero que me llaméis
      </button>
    </form>
  );
}
