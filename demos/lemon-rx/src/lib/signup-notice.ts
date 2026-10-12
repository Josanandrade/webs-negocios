import "server-only";
import { after } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import { emailConfigured, newSignupEmail, sendEmails } from "@/lib/email";

type Row = { user_id: string; full_name: string; email: string; admin_email: string; admin_name: string };

/**
 * Avisa a los admins de un registro nuevo. Se llama con la sesión del propio
 * usuario en cuanto la tiene (al confirmar su email). La base de datos solo
 * devuelve algo la primera vez, así que nunca se avisa dos veces. El envío se
 * hace después de responder, para no retrasar la entrada del usuario.
 */
export async function notifyAdminsOfSignup(supabase: Awaited<ReturnType<typeof createClient>>, origin: string) {
  if (!emailConfigured()) return;
  const { data, error } = await supabase.rpc("claim_signup_notification");
  const rows = (data ?? []) as Row[];
  if (error || rows.length === 0) return;

  const url = `${origin}/admin/usuarios/${rows[0].user_id}`;
  const emails = rows.map((r) =>
    newSignupEmail({ email: r.admin_email, full_name: r.admin_name }, { full_name: r.full_name, email: r.email }, url),
  );
  after(async () => {
    try {
      await sendEmails(emails);
    } catch (err) {
      console.error("Aviso de nuevo registro no enviado", err);
    }
  });
}
