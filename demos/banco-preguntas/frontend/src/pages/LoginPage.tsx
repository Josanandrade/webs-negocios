import { type FormEvent, useState } from "react";
import { useAuth } from "../auth";
import { Button, ErrorBox, Field, inputClass } from "../components/ui";

export function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, name);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/icons/icon.svg" alt="" className="mx-auto mb-3 h-14 w-14" />
          <h1 className="text-2xl font-semibold tracking-tight">Banco de preguntas</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Tests fiables a partir de tu temario</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800" role="tablist">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`rounded-md py-1.5 font-medium ${mode === m ? "bg-white shadow-sm dark:bg-slate-950" : "text-slate-600 dark:text-slate-400"}`}
              >
                {m === "login" ? "Entrar" : "Crear cuenta"}
              </button>
            ))}
          </div>
          {mode === "register" && (
            <Field label="Nombre (opcional)">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </Field>
          )}
          <Field label="Correo electrónico">
            <input className={inputClass} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </Field>
          <Field label="Contraseña" hint={mode === "register" ? "Mínimo 8 caracteres" : undefined}>
            <input
              className={inputClass}
              type="password"
              required
              minLength={mode === "register" ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </Field>
          <ErrorBox error={error} />
          <Button type="submit" busy={busy} className="w-full">
            {mode === "login" ? "Entrar" : "Crear cuenta"}
          </Button>
        </form>
      </div>
    </div>
  );
}
