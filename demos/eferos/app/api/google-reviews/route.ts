import { NextResponse } from "next/server";
import { fetchGoogleReviews, isReviewsConfigured } from "@/lib/googleReviews";

// Siempre en tiempo de petición: el contenido de Places no se puede cachear.
export const dynamic = "force-dynamic";

/**
 * Tope de llamadas a Google por instancia, para que un uso abusivo de esta ruta
 * no dispare el coste de la API. Complementa (no sustituye) la cuota diaria que
 * hay que fijar en Google Cloud para la API key.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_CALLS_PER_WINDOW = 60;
let windowStart = 0;
let callsInWindow = 0;

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  if (!isReviewsConfigured()) {
    // Estado normal mientras no haya credenciales: no es un error (evita ruido en consola)
    return NextResponse.json({ configured: false }, { headers: noStore });
  }

  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    callsInWindow = 0;
  }
  if (callsInWindow >= MAX_CALLS_PER_WINDOW) {
    return NextResponse.json({ error: "busy" }, { status: 503, headers: noStore });
  }
  callsInWindow += 1;

  try {
    const payload = await fetchGoogleReviews();
    return NextResponse.json(payload, { headers: noStore });
  } catch (error) {
    console.error("[google-reviews]", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "upstream" }, { status: 502, headers: noStore });
  }
}
