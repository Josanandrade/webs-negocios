export default function HomeLoading() {
  return <main className="mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-6 md:pb-16 md:pt-10" aria-label="Cargando Home">
    <div className="skeleton h-3 w-20" />
    <div className="skeleton mt-3 h-10 w-32" />
    <div className="mt-8 space-y-5">{[0, 1].map((item) => <div key={item} className="rounded-lg border border-line bg-ink-2 p-4"><div className="flex items-center gap-3"><div className="skeleton h-9 w-9 rounded-full" /><div className="flex-1"><div className="skeleton h-4 w-36" /><div className="skeleton mt-2 h-3 w-24" /></div></div><div className="skeleton mt-5 h-20 w-full" /></div>)}</div>
  </main>;
}
