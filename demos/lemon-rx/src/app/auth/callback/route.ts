import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { siteOrigin } from "@/lib/site";

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

  const supabase = await createClient();
  let ok = false;

  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  }

  if (!ok) return NextResponse.redirect(`${origin}/login?aviso=enlace-caducado`);
  return NextResponse.redirect(`${origin}${next}`);
}
