import { symbol, wordmark } from "./brand";

/**
 * Logotipo oficial de Eferos: símbolo seguido del nombre.
 * Solo para puntos de firma de marca (cabecera, menú, pie), nunca dentro del texto.
 * El nombre toma el color del tono (azul marino sobre claro, claro sobre pino);
 * el símbolo conserva siempre su azul de marca. Al pasar el ratón (o enfocar el
 * enlace con teclado), la «ɘ» invertida del nombre se da la vuelta.
 */
export default function Logo({ tone = "ink" }: { tone?: "ink" | "light" }) {
  return (
    <span className={`logo logo--${tone}`} role="img" aria-label="Eferos">
      <svg
        className="logo__symbol"
        viewBox={`0 0 ${symbol.width} ${symbol.height}`}
        style={{ aspectRatio: `${symbol.width} / ${symbol.height}` }}
        aria-hidden="true"
        focusable="false"
      >
        <path d={symbol.d} fillRule="evenodd" />
      </svg>
      <svg
        className="logo__word"
        viewBox={`0 0 ${wordmark.width} ${wordmark.height}`}
        style={{ aspectRatio: `${wordmark.width} / ${wordmark.height}` }}
        aria-hidden="true"
        focusable="false"
      >
        <path d={wordmark.d} fillRule="evenodd" />
        {/* La «ɘ» invertida: en hover se voltea sobre su centro y queda como una «e» */}
        <path className="logo__flip" d={wordmark.flipD} fillRule="evenodd" />
      </svg>
    </span>
  );
}
