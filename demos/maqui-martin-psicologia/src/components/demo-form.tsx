"use client";

import { useState } from "react";

// Formulario SOLO visual. No hay endpoint, ni fetch, ni almacenamiento:
// al enviarlo se descarta todo y se explica que es una demo.
// Pide únicamente datos básicos de contacto, nunca información de salud.
export function DemoForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="demo-form demo-form--done" role="status">
        <p className="demo-form__title">Gracias.</p>
        <p>
          En la web definitiva, este aviso llegaría a Maqui para devolverte la llamada. <strong>Esto es una demo:</strong>{" "}
          no se ha enviado ni guardado ningún dato.
        </p>
        <button type="button" className="link-button" onClick={() => setSent(false)}>
          Volver al formulario
        </button>
      </div>
    );
  }

  return (
    <form
      className="demo-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.currentTarget.reset();
        setSent(true);
      }}
    >
      <p className="demo-form__title">¿Prefieres que te llame ella?</p>
      <p className="demo-form__hint">Deja solo un nombre y un teléfono. No hace falta que expliques el motivo.</p>
      <div className="field">
        <label htmlFor="f-nombre">Nombre</label>
        <input id="f-nombre" name="nombre" type="text" autoComplete="given-name" required />
      </div>
      <div className="field">
        <label htmlFor="f-telefono">Teléfono</label>
        <input id="f-telefono" name="telefono" type="tel" inputMode="tel" autoComplete="tel" required />
      </div>
      <fieldset className="field field--choice">
        <legend>Mejor momento para llamarte</legend>
        <label>
          <input type="radio" name="franja" value="manana" defaultChecked /> Mañana
        </label>
        <label>
          <input type="radio" name="franja" value="tarde" /> Tarde
        </label>
      </fieldset>
      <button type="submit" className="btn btn--light">
        Solicitar llamada
      </button>
      <p className="demo-form__legal">
        Demo privada: este formulario no envía ni almacena datos. Por favor, no incluyas información sobre tu salud.
      </p>
    </form>
  );
}
