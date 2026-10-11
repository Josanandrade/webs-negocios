"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function ResetForm() {
  const [state, action] = useActionState(requestPasswordReset, null);
  return (
    <form action={action} className="space-y-5">
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
      <FormMessage error={state?.error} notice={state?.notice} />
      <SubmitButton pendingLabel="Enviando…">Enviar enlace</SubmitButton>
    </form>
  );
}
