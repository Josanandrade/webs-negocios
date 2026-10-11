import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecoverPage() {
  return (
    <>
      <h1 className="font-display text-[34px] font-bold uppercase leading-none">Recuperar contraseña</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-chalk-3">
        Te enviaremos un enlace para crear una contraseña nueva.
      </p>
      <div className="mt-8">
        <ResetForm />
      </div>
      <p className="mt-10 text-[15px]">
        <Link href="/login" className="inline-flex h-11 items-center font-semibold text-chalk underline decoration-lemon decoration-2 underline-offset-4">
          Volver a entrar
        </Link>
      </p>
    </>
  );
}
