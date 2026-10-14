"use client";

import { useState } from "react";
import { audiences } from "@/content/site";

type Key = keyof typeof audiences;

export function Audience() {
  const [who, setWho] = useState<Key>("familia");
  const a = audiences[who];
  return (
    <div className="audience">
      <div className="switch" role="tablist" aria-label="¿Quién eres?">
        {(Object.keys(audiences) as Key[]).map((k) => (
          <button key={k} role="tab" type="button" aria-selected={who === k} aria-controls="audience-panel" className={who === k ? "on" : ""} onClick={() => setWho(k)}>
            {audiences[k].label}
          </button>
        ))}
      </div>
      <div id="audience-panel" role="tabpanel" className={`audience-panel tone-${who}`} key={who}>
        <div>
          <h3>{a.title}</h3>
          <p>{a.intro}</p>
          <a className="btn btn-dark" href={who === "familia" ? "#solicitud" : "#apuntarme"}>
            {who === "familia" ? "Pedir información" : "Quiero apuntarme"}
          </a>
        </div>
        <ol>
          {a.points.map((p, i) => (
            <li key={p.k}>
              <span className="bullet">{i + 1}</span>
              <div>
                <strong>{p.k}</strong>
                <span>{p.v}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
