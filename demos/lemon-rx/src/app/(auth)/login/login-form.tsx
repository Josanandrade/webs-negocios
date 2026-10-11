"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action] = useActionState(signIn, null);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state?.email}
          className="field"
        />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="label">
            Contraseña
          </label>
          <Link href="/recuperar" className="press -my-3 inline-flex h-11 items-center text-[14px] text-chalk-3 hover:text-chalk">
            ¿La olvidaste?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
        />
      </div>
      <FormMessage error={state?.error} notice={state ? undefined : notice} />
      <SubmitButton pendingLabel="Entrando…">Entrar</SubmitButton>
    </form>
  );
}
