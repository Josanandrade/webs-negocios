// Logotipo tipográfico provisional (no hay logo oficial publicado).
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark__name">Helena García</span>
      <span className="wordmark__tag">beauty salon</span>
    </span>
  );
}
