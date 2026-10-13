"use client";

import { areas, audiences } from "@/lib/site";
import { selectAudience } from "./audience-event";
import { ArrowIcon } from "./icons";

const tones = ["bg-blush/70 hover:bg-blush", "bg-sage/80 hover:bg-sage", "bg-sand-deep/70 hover:bg-sand-deep"];

export function AudienceCards() {
  return (
    <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
      {audiences.map((a, i) => (
        <li key={a.id}>
          <a
            href="#que-tratamos"
            onClick={() => selectAudience(a.id)}
            className={`group flex h-full flex-col rounded-[28px] p-6 transition-colors duration-300 md:p-7 ${tones[i]}`}
          >
            <span className="eyebrow text-terracotta">{a.eyebrow}</span>
            <h3 className="mt-3 text-[1.6rem] md:text-[1.75rem]">{a.title}</h3>
            <p className="mt-3 text-ink-soft">{a.text}</p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Áreas relacionadas">
              {a.areas.map((id) => (
                <li key={id} className="rounded-full bg-paper/80 px-3 py-1 text-sm">
                  {areas.find((x) => x.id === id)?.title}
                </li>
              ))}
            </ul>
            <span className="mt-auto inline-flex items-center gap-2 pt-6 font-bold text-green-deep">
              Ver en qué podemos ayudar
              <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
