import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Registro" };

export default function SignupPage() {
  return (
    <>
      <h1 className="font-display text-[34px] font-bold uppercase leading-none">Crear cuenta</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-chalk-3">
        Cuando te registres, Fran o Andrade activarán tu acceso a la programación.
      </p>
      <div className="mt-8">
        <SignupForm />
      </div>
      <p className="mt-10 text-[15px] text-chalk-3">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="inline-flex h-11 items-center font-semibold text-chalk underline decoration-lemon decoration-2 underline-offset-4">
          Entra
        </Link>
      </p>
    </>
  );
}
