import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

const NOTICES: Record<string, string> = {
  confirmado: "Email confirmado. Ya puedes entrar.",
  "enlace-caducado": "El enlace ha caducado o ya se usó. Pide uno nuevo.",
  "sesion-cerrada": "Has cerrado sesión.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/";
  const notice = typeof sp.aviso === "string" ? NOTICES[sp.aviso] : undefined;

  return (
    <>
      <h1 className="font-display text-[34px] font-bold uppercase leading-none">Entrar</h1>
      <div className="mt-8">
        <LoginForm next={next} notice={notice} />
      </div>
      <p className="mt-10 text-[15px] text-chalk-3">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="inline-flex h-11 items-center font-semibold text-chalk underline decoration-lemon decoration-2 underline-offset-4">
          Regístrate
        </Link>
      </p>
    </>
  );
}
