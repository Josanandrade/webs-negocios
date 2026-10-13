export function Avatar({
  url,
  name,
  size = "md",
  className = "",
}: {
  url?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-[12px]",
    lg: "h-14 w-14 text-[17px]",
    xl: "h-24 w-24 text-[28px]",
  };
  const initials = (name || "Atleta")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full border border-line-strong bg-ink-2 items-center justify-center font-display font-bold text-chalk-2 ${sizes[size]} ${className}`}
    >
      {url ? <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" /> : initials}
    </span>
  );
}
