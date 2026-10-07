/**
 * Proxy de servidor hacia la API pública de reservas de AvanttAI.
 *
 * La web llama a su propia ruta (p. ej. /api/reservas) y esta reenvía a
 * `${AVANTTAI_BOOKING_API_URL}/api/public/booking/${AVANTTAI_BOOKING_SLUG}`.
 * Así:
 * - el navegador no necesita CORS ni conoce la URL del motor;
 * - toda la lógica (huecos, reglas, creación, emails) sigue en AvanttAI;
 * - aquí solo se filtra lo que se reenvía y se limitan tamaños.
 *
 * Uso en Next.js (app/api/reservas/route.ts):
 *   export const dynamic = "force-dynamic";
 *   export const { GET, POST } = createBookingProxy();
 */

type ProxyOptions = {
  /** Por defecto: process.env.AVANTTAI_BOOKING_API_URL */
  apiUrl?: string;
  /** Por defecto: process.env.AVANTTAI_BOOKING_SLUG */
  slug?: string;
  timeoutMs?: number;
  /** Reservas por IP y minuto (protección básica; AvanttAI mantiene sus propios límites) */
  maxBookingsPerMinute?: number;
};

const noStore = { "Cache-Control": "no-store" };
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...noStore } });

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function createBookingProxy(options: ProxyOptions = {}) {
  const timeoutMs = options.timeoutMs ?? 12000;
  const maxPerMinute = options.maxBookingsPerMinute ?? 6;
  const recent = new Map<string, number[]>();

  const target = (): string | null => {
    const base = (options.apiUrl ?? process.env.AVANTTAI_BOOKING_API_URL ?? "").trim().replace(/\/+$/, "");
    const slug = (options.slug ?? process.env.AVANTTAI_BOOKING_SLUG ?? "").trim();
    if (!/^https?:\/\//.test(base) || !/^[a-z0-9-]{1,80}$/i.test(slug)) return null;
    return `${base}/api/public/booking/${encodeURIComponent(slug)}`;
  };

  async function forward(url: string, init: RequestInit, ip: string): Promise<Response> {
    try {
      const upstream = await fetch(url, {
        ...init,
        cache: "no-store",
        headers: { ...(init.headers ?? {}), "X-Forwarded-For": ip, Accept: "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      const body = await upstream.json().catch(() => null);
      if (!body || typeof body !== "object") {
        return json({ ok: false, error: "El sistema de reservas no ha respondido correctamente." }, 502);
      }
      // Se devuelve tal cual el estado y el mensaje del motor (409, 400…)
      return json(body, upstream.status);
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      console.error("[avanttai-booking] proxy", timedOut ? "timeout" : error);
      return json({ ok: false, error: "No hemos podido conectar con el sistema de reservas. Inténtalo de nuevo en unos minutos." }, 502);
    }
  }

  async function GET(request: Request): Promise<Response> {
    const url = target();
    if (!url) return json({ ok: false, code: "BOOKING_NOT_CONFIGURED", error: "La reserva online no está disponible ahora mismo." }, 503);

    const params = new URL(request.url).searchParams;
    const query = new URLSearchParams();
    const serviceId = text(params.get("serviceId"), 100);
    const date = text(params.get("date"), 10);
    const memberId = text(params.get("memberId"), 100);
    if (serviceId || date) {
      if (!serviceId || !DATE.test(date)) return json({ ok: false, error: "Consulta de disponibilidad no válida." }, 400);
      query.set("serviceId", serviceId);
      query.set("date", date);
      if (memberId) query.set("memberId", memberId);
    }
    const qs = query.toString();
    return forward(qs ? `${url}?${qs}` : url, { method: "GET" }, clientIp(request));
  }

  async function POST(request: Request): Promise<Response> {
    const url = target();
    if (!url) return json({ ok: false, code: "BOOKING_NOT_CONFIGURED", error: "La reserva online no está disponible ahora mismo." }, 503);

    const ip = clientIp(request);
    const now = Date.now();
    const hits = (recent.get(ip) ?? []).filter((t) => now - t < 60000);
    if (hits.length >= maxPerMinute) {
      return json({ ok: false, error: "Has hecho demasiados intentos seguidos. Espera un minuto y vuelve a probar." }, 429);
    }
    hits.push(now);
    recent.set(ip, hits);
    if (recent.size > 5000) recent.clear();

    if (Number(request.headers.get("content-length") ?? 0) > 8192) {
      return json({ ok: false, error: "Solicitud demasiado grande." }, 413);
    }
    const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!raw) return json({ ok: false, error: "Solicitud no válida." }, 400);

    // Solo se reenvían los campos que entiende el motor
    const body = {
      serviceId: text(raw.serviceId, 100),
      memberId: text(raw.memberId, 100) || null,
      date: text(raw.date, 10),
      time: text(raw.time, 5),
      name: text(raw.name, 120),
      phone: text(raw.phone, 20).replace(/[^\d+]/g, ""),
      email: text(raw.email, 160),
      notes: text(raw.notes, 1000),
    };
    if (!body.serviceId || !DATE.test(body.date) || !TIME.test(body.time) || !body.name || !body.phone) {
      return json({ ok: false, error: "Faltan datos obligatorios." }, 400);
    }

    return forward(url, { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }, ip);
  }

  return { GET, POST };
}
