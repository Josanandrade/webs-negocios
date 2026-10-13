import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listProfiles } from "@/lib/users";
import { InviteForm } from "./invite-form";
import { UsersManager } from "./users-manager";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsersPage({ searchParams }: PageProps<"/admin/usuarios">) {
  const sp = await searchParams;
  const [{ settings, profile }, profiles] = await Promise.all([requireAdmin(), listProfiles()]);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <h1 className="font-display text-[40px] font-extrabold uppercase leading-none md:text-[48px]">Usuarios</h1>
      <InviteForm />
      <UsersManager
        profiles={profiles}
        settings={settings}
        meId={profile.id}
        initialQuery={typeof sp.q === "string" ? sp.q : ""}
        initialFilter={typeof sp.filtro === "string" ? sp.filtro : "todos"}
      />
    </main>
  );
}
