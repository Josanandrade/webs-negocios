// Logotipo de la demo: una etiqueta de precio con la «A» y el nombre en
// tipografía de rótulo. No es el logotipo oficial del negocio (no se ha
// encontrado ninguno).
export function Mark({ className = "" }: { className?: string }) {
  return (
    <span className={`mark ${className}`}>
      <svg className="mark__tag" viewBox="0 0 40 28" aria-hidden="true" focusable="false">
        <path d="M0 3a3 3 0 0 1 3-3h24.6a3 3 0 0 1 2.2 1l9.5 11a3 3 0 0 1 0 4l-9.5 11a3 3 0 0 1-2.2 1H3a3 3 0 0 1-3-3Z" />
        <circle cx="30.5" cy="14" r="2.6" className="mark__hole" />
        <path d="M6.5 22 12.3 6h3.4l5.8 16h-3.6l-1.2-3.6h-5.7L9.9 22Zm5.1-6.5h3.8l-1.9-5.8Z" className="mark__a" />
      </svg>
      <span className="mark__word">Animalex</span>
    </span>
  );
}
