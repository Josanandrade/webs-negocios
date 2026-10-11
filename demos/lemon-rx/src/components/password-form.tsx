"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function PasswordForm({ cta = "Cambiar contraseña", primary = false }: { cta?: string; primary?: boolean }) {
  const [state, action] = useActionState(updatePassword, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="password" className="label">
          Contraseña nueva
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="field"
        />
        <p className="mt-2 text-[14px] text-chalk-3">Mínimo 8 caracteres.</p>
      </div>
      <FormMessage error={state?.error} notice={state?.notice} />
      <SubmitButton className={primary ? "btn-primary w-full" : "btn-secondary"} pendingLabel="Guardando…">
        {cta}
      </SubmitButton>
    </form>
  );
}
