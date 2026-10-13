"use client";

import { useActionState } from "react";
import { signUp } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";

export function SignupForm() {
  const [state, action] = useActionState(signUp, null);

  if (state?.notice) {
    return (
      <div className="enter space-y-4">
        <h2 className="font-display text-[26px] font-bold uppercase leading-tight">Revisa tu email</h2>
        <p className="text-[17px] leading-relaxed text-chalk-2">{state.notice}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="full_name" className="label">
          Nombre
        </label>
        <input id="full_name" name="full_name" autoComplete="name" required maxLength={120} className="field" />
      </div>
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
        <label htmlFor="sex" className="label">
          Sexo
        </label>
        <select id="sex" name="sex" required defaultValue={state?.sex ?? ""} className="field">
          <option value="" disabled>
            Selecciona una opción
          </option>
          <option value="male">Hombre</option>
          <option value="female">Mujer</option>
        </select>
        <p className="mt-2 text-[14px] text-chalk-3">Se usa para separar correctamente los rankings de hombres y mujeres.</p>
      </div>
      <div>
        <label htmlFor="password" className="label">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          aria-describedby="password-hint"
          className="field"
        />
        <p id="password-hint" className="mt-2 text-[14px] text-chalk-3">
          Mínimo 8 caracteres.
        </p>
      </div>
      <FormMessage error={state?.error} />
      <SubmitButton pendingLabel="Creando cuenta…">Crear cuenta</SubmitButton>
    </form>
  );
}
