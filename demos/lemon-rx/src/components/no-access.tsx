export function NoAccess({ name, pending }: { name: string; pending: boolean }) {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-md flex-col justify-center px-5 pb-16">
      <h1 className="font-display text-[40px] font-bold uppercase leading-[0.95] text-balance">
        {pending ? "Tu acceso está pendiente" : "Tu acceso no está activo"}
      </h1>
      <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-chalk-2">
        {pending ? (
          <p>
            {name ? `${name}, tu` : "Tu"} cuenta está creada. En cuanto Fran o Jose la activen podrás ver la
            programación aquí.
          </p>
        ) : (
          <p>Tu acceso a Lemon RX no está activo actualmente.</p>
        )}
        <p>Si crees que se trata de un error, habla con Fran o con el equipo de Lemon RX.</p>
      </div>
      <form action="/auth/signout" method="post" className="mt-12">
        <button className="btn-secondary w-full sm:w-auto">Cerrar sesión</button>
      </form>
    </main>
  );
}
