"use client";

import { useEffect, useId, useState } from "react";
import { animals, categories, site, type AnimalId, type CategoryId } from "@/content/site";

export type AskDetail = { animal?: AnimalId; category?: CategoryId };
export const ASK_EVENT = "animalex:ask";

function buildMessage(animal: AnimalId, category: CategoryId | null, text: string) {
  const who = animals.find((a) => a.id === animal)?.forLabel ?? "mi mascota";
  const what = category ? categories.find((c) => c.id === category)?.short : null;
  const raw = text.trim();
  const detail = raw && !/[.?!]$/.test(raw) ? `${raw}.` : raw;
  let body: string;
  if (what && detail) body = `Busco ${what} para ${who}: ${detail} ¿Qué tenéis?`;
  else if (what) body = `¿Qué tenéis de ${what} para ${who}?`;
  else if (detail) body = `Una consulta para ${who}: ${detail}`;
  else body = `Quería haceros una consulta para ${who}.`;
  return `Hola, Animalex. ${body} Gracias.`;
}

export function Consulta() {
  const id = useId();
  const [animal, setAnimal] = useState<AnimalId>("perro");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const onAsk = (e: Event) => {
      const d = (e as CustomEvent<AskDetail>).detail ?? {};
      if (d.animal) setAnimal(d.animal);
      if (d.category) setCategory(d.category);
    };
    window.addEventListener(ASK_EVENT, onAsk);
    return () => window.removeEventListener(ASK_EVENT, onAsk);
  }, []);

  const message = buildMessage(animal, category, text);
  const wa = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="ask">
      <form className="ask__form" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="ask__group">
          <legend className="ask__legend">
            <span className="ask__step">1</span> ¿Para quién?
          </legend>
          <div className="chips">
            {animals.map((a) => (
              <label key={a.id} className="chip">
                <input
                  type="radio"
                  name={`${id}-animal`}
                  value={a.id}
                  checked={animal === a.id}
                  onChange={() => setAnimal(a.id)}
                />
                <span>{a.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="ask__group">
          <legend className="ask__legend">
            <span className="ask__step">2</span> ¿Qué buscas?
          </legend>
          <div className="chips">
            {categories.map((c) => (
              <label key={c.id} className={`chip chip--${c.tone}`}>
                <input
                  type="radio"
                  name={`${id}-cat`}
                  value={c.id}
                  checked={category === c.id}
                  onChange={() => setCategory(c.id)}
                />
                <span>{c.name}</span>
              </label>
            ))}
            {category && (
              <button type="button" className="chip chip--clear" onClick={() => setCategory(null)}>
                Quitar
              </button>
            )}
          </div>
        </fieldset>

        <div className="ask__group">
          <label className="ask__legend" htmlFor={`${id}-text`}>
            <span className="ask__step">3</span>
            <span>
              Marca, producto o duda <span className="ask__opt">· opcional</span>
            </span>
          </label>
          <textarea
            id={`${id}-text`}
            className="ask__text"
            rows={3}
            maxLength={280}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ej.: el pienso que toma ahora, para un cachorro de 4 meses"
          />
        </div>
      </form>

      <div className="ticket" aria-live="polite">
        <p className="ticket__head">
          <span>Tu consulta</span>
          <span aria-hidden="true">Animalex · El Cerro</span>
        </p>
        <p className="ticket__msg">{message}</p>
        <div className="ticket__actions">
          {site.whatsappEnabled && (
            <a className="btn btn--wa" href={wa} target="_blank" rel="noopener noreferrer">
              Enviar por WhatsApp
            </a>
          )}
          <a className="btn btn--ghost-ink" href={site.phoneHref}>
            Llamar y preguntar
          </a>
        </div>
        <p className="ticket__note">
          Esta web no envía nada: {site.whatsappEnabled ? "se abre WhatsApp con el mensaje para que lo revises." : "llama y léeles tu consulta."}
        </p>
      </div>
    </div>
  );
}
