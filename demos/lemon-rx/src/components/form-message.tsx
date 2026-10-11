export function FormMessage({ error, notice }: { error?: string | null; notice?: string | null }) {
  if (error)
    return (
      <p role="alert" className="enter border-l-2 border-danger pl-3 text-[15px] text-danger">
        {error}
      </p>
    );
  if (notice)
    return (
      <p role="status" className="enter border-l-2 border-lemon pl-3 text-[15px] text-chalk">
        {notice}
      </p>
    );
  return null;
}
