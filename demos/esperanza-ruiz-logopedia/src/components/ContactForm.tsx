"use client";

import { useId, useState } from "react";
import { site } from "@/lib/site";
import { ArrowIcon, CheckIcon, PhoneIcon } from "./icons";

type Errors = Partial<Record<"nombre" | "contacto" | "privacidad", string>>;

const forOptions = ["Mi hijo o mi hija", "Para mí", "Un familiar con daño neurológico", "Otro / no lo tengo claro"];

/**
 * Solicitud de cita. Esta demo no tiene servidor ni guarda datos: al enviar,
 * prepara un correo dirigido al email público del centro en la aplicación de
 * correo del visitante. En producción se conectaría a un envío real (p. ej.
 * Resend) manteniendo la misma interfaz.
 */
export function ContactForm() {
  const id = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nombre = String(data.get("nombre") ?? "").trim();
    const contacto = String(data.get("contacto") ?? "").trim();
    const para = String(data.get("para") ?? "");
    const motivo = String(data.get("motivo") ?? "").trim();
    const franja = String(data.get("franja") ?? "");

    const next: Errors = {};
    if (nombre.length < 2) next.nombre = "Escribe tu nombre para que sepamos a quién llamar.";
    const phoneOk = /^[+\d][\d\s-]{7,}$/.test(contacto);
    const mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto);
    if (!phoneOk && !mailOk) next.contacto = "Indica un teléfono o un email válido.";
    if (!data.get("privacidad")) next.privacidad = "Necesitamos tu permiso para responderte.";
    setErrors(next);

    const firstError = Object.keys(next)[0];
    if (firstError) {
      form.querySelector<HTMLElement>(`[name="${firstError}"]`)?.focus();
      return;
    }

    const body = [
      `Nombre: ${nombre}`,
      `Contacto: ${contacto}`,
      `Para quién: ${para}`,
      franja ? `Mejor franja para llamar: ${franja}` : null,
      "",
      "Motivo de consulta:",
      motivo || "(sin detallar)",
    ]
      .filter((l) => l !== null)
      .join("\n");
    const subject = `Solicitud de cita — ${nombre}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="rounded-[28px] bg-paper p-7 text-ink ring-1 ring-ink/10 md:p-9">
        <span className="grid size-12 place-items-center rounded-full bg-sage text-green-deep">
          <CheckIcon className="size-6" />
        </span>
        <h3 className="mt-5 text-[1.75rem]">Tu solicitud está lista</h3>
        <p className="mt-3 text-ink-soft">
          Se ha abierto tu aplicación de correo con el mensaje preparado. Solo tienes que enviarlo. Si lo prefieres,
          también puedes llamar directamente.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href={site.phoneHref} className="btn btn-primary">
            <PhoneIcon /> {site.phone}
          </a>
          <button type="button" className="btn btn-ghost" onClick={() => setSent(false)}>
            Volver al formulario
          </button>
        </div>
      </div>
    );
  }

  const field =
    "mt-2 block w-full rounded-2xl border-0 bg-paper px-4 py-3.5 text-base text-ink ring-1 ring-ink/15 placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-green aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-terracotta";
  const label = "text-[0.95rem] font-bold text-ink";
  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${id}-${k}-error`} className="mt-2 text-sm font-bold text-terracotta">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="rounded-[28px] bg-sand p-6 text-ink ring-1 ring-ink/10 md:p-9"
      aria-describedby={`${id}-intro`}
    >
      <h3 className="text-[1.75rem]">Pide tu primera cita</h3>
      <p id={`${id}-intro`} className="mt-2 text-ink-soft">
        Cuéntanos brevemente qué ocurre y te contactamos para orientarte.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-nombre`} className={label}>
            Nombre
          </label>
          <input
            id={`${id}-nombre`}
            name="nombre"
            autoComplete="name"
            className={field}
            aria-invalid={!!errors.nombre}
            aria-describedby={errors.nombre ? `${id}-nombre-error` : undefined}
          />
          {err("nombre")}
        </div>
        <div>
          <label htmlFor={`${id}-contacto`} className={label}>
            Teléfono o email
          </label>
          <input
            id={`${id}-contacto`}
            name="contacto"
            autoComplete="tel"
            className={field}
            aria-invalid={!!errors.contacto}
            aria-describedby={errors.contacto ? `${id}-contacto-error` : undefined}
          />
          {err("contacto")}
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className={label}>¿Para quién es la consulta?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {forOptions.map((o, i) => (
            <label
              key={o}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl bg-paper px-4 py-2.5 ring-1 ring-ink/15 has-[:checked]:ring-2 has-[:checked]:ring-green"
            >
              <input
                type="radio"
                name="para"
                value={o}
                defaultChecked={i === 0}
                className="size-4 accent-[var(--color-green)]"
              />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5">
        <label htmlFor={`${id}-motivo`} className={label}>
          ¿Qué os preocupa? <span className="font-normal text-ink-soft">(opcional)</span>
        </label>
        <textarea
          id={`${id}-motivo`}
          name="motivo"
          rows={4}
          className={field}
          placeholder="Por ejemplo: tiene 4 años y le cuesta pronunciar la r…"
        />
      </div>

      <div className="mt-5">
        <label htmlFor={`${id}-franja`} className={label}>
          Mejor momento para llamarte <span className="font-normal text-ink-soft">(opcional)</span>
        </label>
        <select id={`${id}-franja`} name="franja" className={field} defaultValue="">
          <option value="">Indiferente</option>
          <option>Por la mañana</option>
          <option>Por la tarde</option>
        </select>
      </div>

      <div className="mt-6">
        <label className="flex cursor-pointer items-start gap-3 text-[0.95rem]">
          <input
            type="checkbox"
            name="privacidad"
            className="mt-1 size-5 shrink-0 accent-[var(--color-green)]"
            aria-invalid={!!errors.privacidad}
            aria-describedby={errors.privacidad ? `${id}-privacidad-error` : undefined}
          />
          <span className="text-ink-soft">
            Acepto que el centro use estos datos únicamente para responder a mi solicitud de cita.
          </span>
        </label>
        {err("privacidad")}
      </div>

      <button type="submit" className="btn btn-primary mt-7 w-full sm:w-auto">
        Enviar solicitud <ArrowIcon className="size-4" />
      </button>
      <p className="mt-4 text-sm text-ink-soft">
        ¿Prefieres hablar ya? Llama al{" "}
        <a href={site.phoneHref} className="link-underline font-bold text-ink">
          {site.phone}
        </a>
        .
      </p>
    </form>
  );
}
