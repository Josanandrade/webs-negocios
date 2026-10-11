import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { siteOrigin } from "@/lib/site";

async function signOut(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${siteOrigin(request)}/login?aviso=sesion-cerrada`, { status: 303 });
}

export const POST = signOut;
export const GET = signOut;
