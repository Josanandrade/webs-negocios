import { Wordmark } from "@/components/wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[26rem] flex-col px-5 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <Wordmark className="text-[40px]" />
      <p className="mt-2 text-[15px] text-chalk-3">Programación de CrossFit</p>
      <div className="mt-12 flex-1">{children}</div>
    </main>
  );
}
