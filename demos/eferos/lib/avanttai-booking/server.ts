/**
 * Proxy de servidor hacia la experiencia pública de reservas de AvanttAI.
 *
 * La web llama a su propia ruta (p. ej. /api/reservas) y esta reenvía al
 * motor único de AvanttAI. La web aporta únicamente el canal/origen; reglas,
 * disponibilidad, creación, onboarding y atribución siguen en AvanttAI.
 */

type BookingContext = "direct" | "embed" | "marketplace";

type ProxyOptions = {
  /** Por defecto: process.env.AVANTTAI_BOOKING_API_URL */
  apiUrl?: string;
  /** Por defecto: process.env.AVANTTAI_BOOKING_SLUG */
  slug?: string;
  /** Las webs integradas usan embed; Marketplace usará marketplace. */
  experienceContext?: BookingContext;
  /** Identificador analítico estable del punto de entrada. */
  experienceSource?: string;
  timeoutMs?: number;
  /** Reservas por IP y minuto (AvanttAI mantiene además sus propios límites). */
  maxBookingsPerMinute?: number;
};

type ProxyResult = {
  body: Record<string, unknown>;
  status: number;
};

const noStore = { "Cache-Control": "no-store" };
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...noStore } });

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function sourceKey(value: unknown, fallback: string): string {
  const normalized = text(value, 80).toLowerCase().replace(/[^a-z0-9_-]/g, "_").replace(/_+/g, "_");
  return normalized || fallback;
}

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function createBookingProxy(options: ProxyOptions = {}) {
  const timeoutMs = options.timeoutMs ?? 12000;
  const maxPerMinute = options.maxBookingsPerMinute ?? 6;
  const context = options.experienceContext ?? "embed";
  const source = sourceKey(options.experienceSource, "embedded_web");
  const recent = new Map<string, number[]>();

  let setupCache: { expiresAt: number; result: ProxyResult } | null = null;
  let setupInFlight: Promise<ProxyResult> | null = null;
  const setupTtlMs = 60_000;

  const apiBase = (): string | null => {
    const base = (options.apiUrl ?? process.env.AVANTTAI_BOOKING_API_URL ?? "").trim().replace(/\/+$/, "");
    return /^https?:\/\//.test(base) ? base : null;
  };

  const target = (): string | null => {
    const base = apiBase();
    const slug = (options.slug ?? process.env.AVANTTAI_BOOKING_SLUG ?? "").trim();
    if (!base || !/^[a-z0-9-]{1,80}$/i.test(slug)) return null;
    return `${base}/api/public/booking-experience/${encodeURIComponent(slug)}`;
  };

  function withExperience(url: string, params?: URLSearchParams) {
    const upstream = new URL(url);
    upstream.searchParams.set("context", context);
    upstream.searchParams.set("source", source);
    params?.forEach((value, key) => upstream.searchParams.set(key, value));
    return upstream.toString();
  }

  async function forwardData(url: string, init: RequestInit, ip: string): Promise<ProxyResult> {
    try {
      const upstream = await fetch(url, {
        ...init,
        cache: "no-store",
        headers: {
          ...(init.headers ?? {}),
          "X-Forwarded-For": ip,
          "X-AvanttAI-Booking-Context": context,
          "X-AvanttAI-Booking-Source": source,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
      const body = (await upstream.json().catch(() => null)) as Record<string, unknown> | null;
      if (!body) {
        return {
          body: { ok: false, error: "El sistema de reservas no ha respondido correctamente." },
          status: 502,
        };
      }

      // El onboarding pertenece al motor de AvanttAI. Si llega relativo, se convierte
      // en absoluto para mantener el salto web del negocio → onboarding tematizado.
      if (typeof body.onboardingUrl === "string" && body.onboardingUrl.startsWith("/")) {
        const base = apiBase();
        if (base) body.onboardingUrl = `${base}${body.onboardingUrl}`;
      }

      return { body, status: upstream.status };
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      console.error("[avanttai-booking] proxy", timedOut ? "timeout" : error);
      return {
        body: { ok: false, error: "No hemos podido conectar con el sistema de reservas. Inténtalo de nuevo en unos minutos." },
        status: 502,
      };
    }
  }

  async function forward(url: string, init: RequestInit, ip: string): Promise<Response> {
    const result = await forwardData(url, init, ip);
    return json(result.body, result.status);
  }

  async function GET(request: Request): Promise<Response> {
    const baseTarget = target();
    if (!baseTarget) return json({ ok: false, code: "BOOKING_NOT_CONFIGURED", error: "La reserva online no está disponible ahora mismo." }, 503);

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

    const ip = clientIp(request);
    const setupRequest = query.size === 0;

    if (setupRequest) {
      const now = Date.now();
      if (setupCache && setupCache.expiresAt > now) {
        return json(setupCache.result.body, setupCache.result.status);
      }

      if (!setupInFlight) {
        setupInFlight = forwardData(withExperience(baseTarget), { method: "GET" }, ip)
          .then((result) => {
            if (result.status === 200) setupCache = { expiresAt: Date.now() + setupTtlMs, result };
            return result;
          })
          .finally(() => {
            setupInFlight = null;
          });
      }

      const result = await setupInFlight;
      return json(result.body, result.status);
    }

    return forward(withExperience(baseTarget, query), { method: "GET" }, ip);
  }

  async function POST(request: Request): Promise<Response> {
    const baseTarget = target();
    if (!baseTarget) return json({ ok: false, code: "BOOKING_NOT_CONFIGURED", error: "La reserva online no está disponible ahora mismo." }, 503);

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

    return forward(withExperience(baseTarget), {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }, ip);
  }

  return { GET, POST };
}
