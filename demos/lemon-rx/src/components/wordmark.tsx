export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display font-extrabold uppercase italic leading-none tracking-[0.02em] ${className}`}
    >
      Lemon<span className="text-lemon"> RX</span>
    </span>
  );
}
