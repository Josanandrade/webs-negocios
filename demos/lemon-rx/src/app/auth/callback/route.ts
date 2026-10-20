import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { siteOrigin } from "@/lib/site";

function redirectNoStore(url: string | URL) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

// Destino de los enlaces de email (confirmación de registro y recuperación).
// Soporta tanto el flujo PKCE (?code=) como token_hash (?token_hash=&type=).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = siteOrigin(request);
  const rawNext = searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Un código PKCE solo puede intercambiarse una vez. En recuperación evitamos
  // consumirlo dentro de este callback porque algunos navegadores/clientes de correo
  // pueden solicitar/cancelar la URL más de una vez. La página pública de handoff lo
  // intercambia cuando la navegación ya se ha cargado de verdad.
  if (code && next === "/nueva-contrasena") {
    const handoff = new URL("/auth/recovery", origin);
    handoff.searchParams.set("code", code);
    const flowId = searchParams.get("sb_flow_id");
    if (flowId) handoff.searchParams.set("sb_flow_id", flowId);
    return redirectNoStore(handoff);
  }

  const supabase = await createClient();
  let ok = false;
  let destination = next;

  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
    if (ok && type === "recovery") destination = "/nueva-contrasena";
  }

  if (!ok) return redirectNoStore(`${origin}/login?aviso=enlace-caducado`);
  return redirectNoStore(`${origin}${destination}`);
}
