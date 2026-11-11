import Link from "next/link";
import { business } from "@/content/mgi";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`wordmark ${className ?? ""}`} aria-label="MG&I">
      MG<em>&amp;</em>I
    </span>
  );
}

export function DemoBar() {
  return (
    <aside className="demobar" aria-label="Aviso de demo">
      <span className="long">Propuesta de diseño privada · no es la web oficial de {business.legalLabel}</span>
      <span className="short">Demo privada · no es la web oficial</span>
      <Link href="/propuesta">Ver la propuesta</Link>
    </aside>
  );
}
