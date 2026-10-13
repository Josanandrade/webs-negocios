import { site } from "@/lib/site";

/**
 * Marca tipográfica provisional para la demo. Si el centro facilita su logotipo
 * en vectorial (ver public/assets/esperanza-ruiz-logopedia/README_ASSETS.md),
 * se sustituye aquí sin tocar el resto de la web.
 */
export function Wordmark({ tone = "ink", compact = false }: { tone?: "ink" | "light"; compact?: boolean }) {
  const color = tone === "light" ? "text-paper" : "text-ink";
  return (
    <span className={`inline-flex items-center gap-3 ${color}`}>
      <span
        aria-hidden
        className={`grid size-10 shrink-0 place-items-center rounded-[14px] ${tone === "light" ? "bg-paper text-green-deep" : "bg-green text-paper"}`}
      >
        <svg viewBox="0 0 40 40" className="size-10">
          <path
            d="M8 25c2.7-4 5.3-4 8 0s5.3 4 8 0 5.3-4 8 0"
            fill="none"
            stroke="#d9a547"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <text
            x="20"
            y="19.5"
            textAnchor="middle"
            fontFamily="var(--font-fraunces), Georgia, serif"
            fontStyle="italic"
            fontSize="15"
            fill="currentColor"
          >
            er
          </text>
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className="font-serif text-[1.2rem] tracking-[-0.01em]"
          style={{ fontVariationSettings: '"SOFT" 100, "opsz" 48' }}
        >
          {site.shortName}
        </span>
        {!compact && (
          <span
            className={`mt-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] ${tone === "light" ? "text-paper/75" : "text-ink-soft"}`}
          >
            Centro de logopedia
          </span>
        )}
      </span>
    </span>
  );
}
