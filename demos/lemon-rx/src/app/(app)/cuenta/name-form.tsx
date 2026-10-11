"use client";

import { useActionState } from "react";
import { updateName } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function NameForm({ name }: { name: string }) {
  const [state, action] = useActionState(updateName, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="label">
          Nombre
        </label>
        <input id="full_name" name="full_name" defaultValue={name} required maxLength={120} autoComplete="name" className="field" />
      </div>
      <FormMessage error={state?.error} notice={state?.notice} />
      <SubmitButton className="btn-secondary" pendingLabel="Guardando…">
        Guardar nombre
      </SubmitButton>
    </form>
  );
}
