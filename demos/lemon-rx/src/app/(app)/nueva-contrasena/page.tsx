import type { Metadata } from "next";
import Link from "next/link";
import { PasswordForm } from "@/components/password-form";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default function NewPasswordPage() {
  return (
    <main className="mx-auto max-w-[26rem] px-5 pb-16 pt-10">
      <h1 className="font-display text-[34px] font-bold uppercase leading-none">Nueva contraseña</h1>
      <p className="mt-3 text-[15px] text-chalk-3">Elige la contraseña con la que entrarás a partir de ahora.</p>
      <div className="mt-8">
        <PasswordForm cta="Guardar contraseña" primary />
      </div>
      <p className="mt-8">
        <Link href="/" className="press inline-flex h-11 items-center text-[15px] font-semibold text-chalk-2 hover:text-chalk">
          Ir a la programación
        </Link>
      </p>
    </main>
  );
}
