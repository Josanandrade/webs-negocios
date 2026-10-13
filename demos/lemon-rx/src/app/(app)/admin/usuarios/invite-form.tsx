"use client";

import { useActionState } from "react";
import { inviteUser } from "./actions";
import { SubmitButton } from "@/components/submit-button";

export function InviteForm() {
  const [state, action] = useActionState(inviteUser, null);
  return (
    <section className="mt-6 rounded-sm border border-line bg-ink-2 p-4">
      <h2 className="font-display text-[20px] font-bold uppercase">Invitar usuario</h2>
      <p className="mt-1 text-[14px] text-chalk-3">Recibirá un enlace para registrarse. Después seguirá pendiente de activación manual.</p>
      <form action={action} className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end">
        <div className="min-w-0">
          <label htmlFor="invite-email" className="label">Email</label>
          <input id="invite-email" name="email" type="email" required autoComplete="email" defaultValue={state?.email} className="field w-full min-w-0" placeholder="usuario@email.com" />
        </div>
        <SubmitButton pendingLabel="Enviando…" className="btn-primary w-full">Enviar invitación</SubmitButton>
      </form>
      {state?.error && <p role="alert" className="mt-3 border-l-2 border-danger pl-3 text-[15px] text-danger">{state.error}</p>}
      {state?.notice && <p role="status" className="mt-3 border-l-2 border-lemon pl-3 text-[15px] text-chalk-2">{state.notice}</p>}
    </section>
  );
}
