"use client";

import { useId, useState } from "react";
import { whatsappHref } from "@/content/clinic";
import { Icon } from "./Icon";

const REASONS = ["Revisión", "Vacunas", "Peluquería", "Otra consulta"] as const;
const ANIMALS = ["Perro", "Gato", "Otro"] as const;

// Prepara un mensaje de WhatsApp para pedir cita. No envía ni guarda nada:
// solo abre WhatsApp con el texto escrito, y el usuario decide si lo manda.
export function WhatsAppComposer() {
  const [reason, setReason] = useState<(typeof REASONS)[number]>("Revisión");
  const [animal, setAnimal] = useState<(typeof ANIMALS)[number]>("Perro");
  const [name, setName] = useState("");
  const nameId = useId();

  const pet = name.trim() ? `${animal.toLowerCase()}, ${name.trim()}` : `${animal.toLowerCase()}`;
  const text = `Hola, quería pedir cita para mi ${pet}. Motivo: ${reason.toLowerCase()}. ¿Qué hueco tenéis?`;

  return (
    <div className="composer">
      <fieldset className="composer__group">
        <legend>¿Para quién es?</legend>
        <div className="chips">
          {ANIMALS.map((a) => (
            <label key={a} className="chip">
              <input
                type="radio"
                name="animal"
                value={a}
                checked={animal === a}
                onChange={() => setAnimal(a)}
              />
              <span>{a}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="composer__group">
        <legend>Motivo</legend>
        <div className="chips">
          {REASONS.map((r) => (
            <label key={r} className="chip">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              <span>{r}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="composer__group">
        <label htmlFor={nameId} className="composer__label">
          Su nombre <span>(el de tu animal, opcional)</span>
        </label>
        <input
          id={nameId}
          className="composer__input"
          type="text"
          autoComplete="off"
          maxLength={30}
          placeholder="Ej.: Lola"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <p className="composer__preview" aria-live="polite">
        <span className="sr-only">Mensaje que se enviará: </span>
        {text}
      </p>

      <a
        className="btn btn--wa btn--block"
        href={whatsappHref(text)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="whatsapp" />
        Abrir en WhatsApp
      </a>
      <p className="composer__note">
        Se abrirá WhatsApp con este texto. Nada se envía hasta que tú lo mandes.
      </p>
    </div>
  );
}
