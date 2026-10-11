import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./env";

const PUBLIC_PATHS = ["/login", "/registro", "/recuperar", "/auth"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Refresca la sesión de Supabase en cada petición y hace la comprobación
// optimista de login. La autorización real (rol, acceso) se hace en el
// servidor de cada página y en la RLS de la base de datos.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = supabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const { pathname } = request.nextUrl;

  if (!signedIn && !isPublic(pathname)) {
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    to.search = "";
    if (pathname !== "/") to.searchParams.set("next", pathname);
    return redirectWithCookies(to, response);
  }

  if (signedIn && (pathname === "/login" || pathname === "/registro")) {
    const to = request.nextUrl.clone();
    to.pathname = "/";
    to.search = "";
    return redirectWithCookies(to, response);
  }

  return response;
}

function redirectWithCookies(to: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(to);
  from.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}
