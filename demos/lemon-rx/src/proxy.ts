import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const LEGACY_RAILWAY_HOST = "lemon-rx-production.up.railway.app";
const VERCEL_ORIGIN = "https://webs-negocios.vercel.app";

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  if (host === LEGACY_RAILWAY_HOST) {
    const destination = new URL(request.nextUrl.pathname + request.nextUrl.search, VERCEL_ORIGIN);
    return NextResponse.redirect(destination, 308);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
