/*
  Sello circular de la marca: texto en círculo alrededor de un pompón.
  Gira muy despacio; con movimiento reducido se queda quieto.
*/
export function Stamp({ className = "" }: { className?: string }) {
  return (
    <svg className={`stamp ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id="stamp-circle" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" />
      </defs>
      <circle cx="100" cy="100" r="98" className="stamp__bg" />
      <g className="stamp__ring">
        <text className="stamp__text">
          <textPath href="#stamp-circle" textLength="462">
            Peluquería y estética canina · Tomares ·
          </textPath>
        </text>
      </g>
      <circle cx="100" cy="100" r="22" className="stamp__pom" />
    </svg>
  );
}
