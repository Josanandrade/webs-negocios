"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { bookingThemeStyle, resolveBookingTheme } from "./theme";
import type { BookingError, BookingResult, BookingSetup, BookingSlots, BookingTheme } from "./types";
import styles from "./BookingFlow.module.css";

type Props = {
  /** Ruta del proxy de servidor de la propia web */
  endpoint?: string;
  /** Tema local (se combina con el que pueda servir AvanttAI; el local manda) */
  theme?: Partial<BookingTheme>;
  /** Si se indica, se muestra como casilla obligatoria antes de confirmar */
  consentText?: ReactNode;
  /** Qué mostrar si la reserva online no está disponible (teléfono, WhatsApp…) */
  fallback?: ReactNode;
  /** Contenido extra bajo el resumen (dirección, horario…) */
  aside?: ReactNode;
  /** Prefijo internacional que se añade a móviles locales de 9 cifras */
  phonePrefix?: string;
};

type Phase = { kind: "form" } | { kind: "done"; result: Extract<BookingResult, { ok: true }> };

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s: string) => new Date(`${s}T12:00:00`);
const addDays = (s: string, days: number) => {
  const d = fromIso(s);
  d.setDate(d.getDate() + days);
  return isoDate(d);
};

const longDate = (s: string) =>
  new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(fromIso(s));
const monthLabel = (year: number, month: number) =>
  new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(year, month, 1));
const price = (value: number | null) =>
  value == null ? null : new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

async function readJson<T>(response: Response): Promise<T | BookingError> {
  return (await response.json().catch(() => ({ ok: false, error: "Respuesta no válida del sistema de reservas." }))) as
    | T
    | BookingError;
}

export default function BookingFlow({
  endpoint = "/api/reservas",
  theme,
  consentText,
  fallback,
  aside,
  phonePrefix = "34",
}: Props) {
  const [setup, setSetup] = useState<BookingSetup | null>(null);
  const [setupError, setSetupError] = useState<{ message: string; unavailable: boolean } | null>(null);

  const [serviceId, setServiceId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [view, setView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const [slots, setSlots] = useState<{ key: string; list: string[] } | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "form" });

  const memberStep = useRef<HTMLElement>(null);
  const dateStep = useRef<HTMLElement>(null);
  const timeStep = useRef<HTMLElement>(null);
  const dataStep = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Configuración pública del negocio (servicios, profesionales, reglas)
  useEffect(() => {
    let active = true;
    fetch(endpoint, { cache: "no-store" })
      .then((response) => readJson<BookingSetup>(response).then((body) => ({ response, body })))
      .then(({ response, body }) => {
        if (!active) return;
        if (!body.ok) {
          setSetupError({ message: body.error, unavailable: response.status === 503 || response.status === 404 });
          return;
        }
        setSetup(body);
        // Un único servicio: se selecciona solo
        if (body.services.length === 1) setServiceId(body.services[0].id);
      })
      .catch(() => active && setSetupError({ message: "No hemos podido cargar la reserva online.", unavailable: true }));
    return () => {
      active = false;
    };
  }, [endpoint]);

  const resolvedTheme = useMemo(() => resolveBookingTheme(setup?.theme, theme), [setup?.theme, theme]);
  const service = setup?.services.find((s) => s.id === serviceId) ?? null;
  const eligibleMembers = useMemo(
    () => (setup && serviceId ? setup.members.filter((m) => m.serviceIds.length === 0 || m.serviceIds.includes(serviceId)) : []),
    [setup, serviceId],
  );
  // Con un solo profesional posible no se pregunta
  const effectiveMemberId = eligibleMembers.length === 1 ? eligibleMembers[0].id : memberId;
  const member = setup?.members.find((m) => m.id === effectiveMemberId) ?? null;
  const needsMember = eligibleMembers.length > 1;
  const readyForDate = Boolean(service) && (!needsMember || Boolean(memberId));

  const today = isoDate(new Date());
  const lastDay = setup ? addDays(today, Math.max(1, setup.booking.maxAdvanceDays)) : today;
  const slotsKey = `${serviceId}|${effectiveMemberId}|${date}`;
  const currentSlots = slots?.key === slotsKey ? slots.list : null;

  const reveal = (ref: React.RefObject<HTMLElement | null>) =>
    requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      ref.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      ref.current?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
    });

  async function fetchSlots(forDate: string, sId = serviceId, mId = effectiveMemberId): Promise<string[] | null> {
    const query = new URLSearchParams({ serviceId: sId, date: forDate });
    if (mId) query.set("memberId", mId);
    const response = await fetch(`${endpoint}?${query}`, { cache: "no-store" });
    const body = await readJson<BookingSlots>(response);
    if (!body.ok) {
      setNotice(body.error);
      return null;
    }
    return body.slots;
  }

  async function chooseDate(next: string) {
    setDate(next);
    setTime("");
    setNotice(null);
    setSlotsLoading(true);
    const list = await fetchSlots(next);
    setSlots({ key: `${serviceId}|${effectiveMemberId}|${next}`, list: list ?? [] });
    setSlotsLoading(false);
    reveal(timeStep);
  }

  async function findNextAvailable() {
    if (!date) return;
    setSearching(true);
    setNotice(null);
    let cursor = addDays(date, 1);
    for (let i = 0; i < 21 && cursor <= lastDay; i++, cursor = addDays(cursor, 1)) {
      const list = await fetchSlots(cursor);
      if (list && list.length) {
        const d = fromIso(cursor);
        setView({ year: d.getFullYear(), month: d.getMonth() });
        setDate(cursor);
        setTime("");
        setSlots({ key: `${serviceId}|${effectiveMemberId}|${cursor}`, list });
        setSearching(false);
        return;
      }
    }
    setSearching(false);
    setNotice("No hemos encontrado huecos en las próximas tres semanas. Prueba más adelante o contacta con el centro.");
  }

  function chooseService(id: string) {
    setServiceId(id);
    setMemberId("");
    setDate("");
    setTime("");
    setNotice(null);
    const eligible = setup?.members.filter((m) => m.serviceIds.length === 0 || m.serviceIds.includes(id)) ?? [];
    reveal(eligible.length > 1 ? memberStep : dateStep);
  }

  function chooseMember(id: string) {
    setMemberId(id);
    setDate("");
    setTime("");
    reveal(dateStep);
  }

  function chooseTime(slot: string) {
    setTime(slot);
    reveal(dataStep);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!service || !date || !time) return;
    const form = new FormData(event.currentTarget);
    const digits = String(form.get("phone") ?? "").replace(/\D/g, "");
    setSubmitting(true);
    setNotice(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          memberId: effectiveMemberId || null,
          date,
          time,
          name: String(form.get("name") ?? "").trim(),
          phone: digits.length === 9 ? `${phonePrefix}${digits}` : digits,
          email: String(form.get("email") ?? "").trim(),
          notes: String(form.get("notes") ?? "").trim(),
        }),
      });
      const body = await readJson<BookingResult>(response);
      if (!body.ok) {
        setNotice(body.error);
        // Si el hueco se ha ocupado mientras tanto, se refrescan las horas
        if (response.status === 409) {
          const list = await fetchSlots(date);
          setSlots({ key: slotsKey, list: list ?? [] });
          setTime("");
          reveal(timeStep);
        }
        return;
      }
      setPhase({ kind: "done", result: body });
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ block: "start" });
        resultRef.current?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
      });
    } catch {
      setNotice("No hemos podido enviar la reserva. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setPhase({ kind: "form" });
    setDate("");
    setTime("");
    setSlots(null);
    setNotice(null);
  }

  const themeStyle = bookingThemeStyle(resolvedTheme);

  // ---------- Estados de carga / no disponible ----------
  if (setupError) {
    return (
      <div className={styles.root} style={themeStyle}>
        {/* Misma estructura que la carga: el contenido no salta */}
        <div className={styles.layout}>
          <div className={`${styles.steps} ${styles.loading}`}>
            <div className={styles.unavailable} role="status">
              <p className={styles.eyebrow}>Reserva online</p>
              <h2 className={styles.title}>{setupError.unavailable ? "La reserva online no está disponible ahora mismo" : "No hemos podido cargar la reserva"}</h2>
              <p className={styles.muted}>{setupError.message}</p>
              {fallback}
            </div>
          </div>
          <BookingAside aside={aside} />
        </div>
      </div>
    );
  }

  if (!setup) {
    return (
      <div className={styles.root} style={themeStyle} aria-busy="true">
        {/* Misma estructura que el flujo, para que nada salte al llegar los datos */}
        <div className={styles.layout}>
          <div className={`${styles.steps} ${styles.loading}`}>
            <p className={styles.muted} role="status">
              Cargando servicios y disponibilidad…
            </p>
          </div>
          <BookingAside aside={aside} />
        </div>
      </div>
    );
  }

  // ---------- Resultado ----------
  if (phase.kind === "done") {
    const r = phase.result;
    const health = r.healthOnboardingRequired === true;
    return (
      <div className={styles.root} style={themeStyle}>
        <div ref={resultRef} className={styles.result}>
          <p className={styles.eyebrow} data-tone={health ? "accent" : "success"}>
            {health ? "Último paso" : "Reserva confirmada"}
          </p>
          <h2 className={styles.title} tabIndex={-1}>
            {health ? "Completa tu registro de primera visita" : "Tu cita está reservada"}
          </h2>
          <dl className={styles.summaryList}>
            <div>
              <dt>Servicio</dt>
              <dd>{r.booking.serviceName}</dd>
            </div>
            {member && (
              <div>
                <dt>{member.type === "resource" ? "Sala" : "Profesional"}</dt>
                <dd>{member.name}</dd>
              </div>
            )}
            <div>
              <dt>Fecha</dt>
              <dd className={styles.capitalize}>{longDate(r.booking.date)}</dd>
            </div>
            <div>
              <dt>Hora</dt>
              <dd className={styles.tabular}>
                {r.booking.time} · {r.booking.durationMinutes} min
              </dd>
            </div>
          </dl>
          {health ? (
            <>
              <p className={styles.lead}>
                Como es tu primera visita, necesitamos tus datos de paciente y la señal para confirmar la cita. Te guardamos
                el hueco hasta las{" "}
                <strong className={styles.tabular}>
                  {new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(r.expiresAt))}
                </strong>
                .
              </p>
              <a className={styles.primary} href={r.onboardingUrl}>
                Completar registro <span aria-hidden="true">→</span>
              </a>
            </>
          ) : (
            <>
              <p className={styles.lead}>
                Si has indicado tu email, te llegará la confirmación con un enlace para cambiar o cancelar la cita.
              </p>
              <button type="button" className={styles.secondary} onClick={restart}>
                Hacer otra reserva
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ---------- Calendario ----------
  const first = new Date(view.year, view.month, 1);
  const lead = (first.getDay() + 6) % 7; // semana empieza en lunes
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: Array<string | null> = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => isoDate(new Date(view.year, view.month, i + 1))),
  ];
  const canPrev = isoDate(new Date(view.year, view.month, 0)) >= today;
  const canNext = isoDate(new Date(view.year, view.month + 1, 1)) <= lastDay;
  const moveMonth = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const required = setup.booking.requiredCustomerData ?? {};
  let step = 0;
  const n = () => String(++step).padStart(2, "0");

  return (
    <div className={styles.root} style={themeStyle}>
      <div className={styles.layout}>
        <div className={styles.steps}>
          {/* Servicio */}
          <section className={styles.step} aria-labelledby="bk-service">
            <header className={styles.stepHead}>
              <span className={styles.stepNum}>{n()}</span>
              <h2 id="bk-service" className={styles.stepTitle} tabIndex={-1}>
                Elige el servicio
              </h2>
            </header>
            <ul role="list" className={styles.options}>
              {setup.services.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={styles.option}
                    aria-pressed={s.id === serviceId}
                    onClick={() => chooseService(s.id)}
                  >
                    <span className={styles.optionName}>{s.name}</span>
                    <span className={styles.optionMeta}>
                      {s.durationMinutes} min{price(s.price) ? ` · ${price(s.price)}` : ""}
                    </span>
                    {s.notes && <span className={styles.optionNote}>{s.notes}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Profesional (solo si hay varios posibles) */}
          {service && needsMember && (
            <section ref={memberStep} className={styles.step} aria-labelledby="bk-member">
              <header className={styles.stepHead}>
                <span className={styles.stepNum}>{n()}</span>
                <h2 id="bk-member" className={styles.stepTitle} tabIndex={-1}>
                  {eligibleMembers.some((m) => m.type === "resource") ? "Elige sala o recurso" : "Elige profesional"}
                </h2>
              </header>
              <ul role="list" className={styles.options}>
                {eligibleMembers.map((m) => (
                  <li key={m.id}>
                    <button type="button" className={styles.option} aria-pressed={m.id === memberId} onClick={() => chooseMember(m.id)}>
                      <span className={styles.optionName}>{m.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Fecha */}
          {readyForDate && (
            <section ref={dateStep} className={styles.step} aria-labelledby="bk-date">
              <header className={styles.stepHead}>
                <span className={styles.stepNum}>{n()}</span>
                <h2 id="bk-date" className={styles.stepTitle} tabIndex={-1}>
                  Elige el día
                </h2>
              </header>
              <div className={styles.calendar}>
                <div className={styles.calendarHead}>
                  <button type="button" className={styles.navBtn} onClick={() => moveMonth(-1)} disabled={!canPrev} aria-label="Mes anterior">
                    ←
                  </button>
                  <p className={styles.monthLabel} aria-live="polite">
                    {monthLabel(view.year, view.month)}
                  </p>
                  <button type="button" className={styles.navBtn} onClick={() => moveMonth(1)} disabled={!canNext} aria-label="Mes siguiente">
                    →
                  </button>
                </div>
                <div className={styles.weekdays} aria-hidden="true">
                  {WEEKDAYS.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className={styles.days}>
                  {cells.map((cell, i) =>
                    cell ? (
                      <button
                        key={cell}
                        type="button"
                        className={styles.day}
                        aria-pressed={cell === date}
                        aria-label={longDate(cell)}
                        data-today={cell === today || undefined}
                        disabled={cell < today || cell > lastDay}
                        onClick={() => chooseDate(cell)}
                      >
                        {Number(cell.slice(8))}
                      </button>
                    ) : (
                      <span key={`e${i}`} />
                    ),
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Hora */}
          {readyForDate && date && (
            <section ref={timeStep} className={styles.step} aria-labelledby="bk-time">
              <header className={styles.stepHead}>
                <span className={styles.stepNum}>{n()}</span>
                <h2 id="bk-time" className={styles.stepTitle} tabIndex={-1}>
                  Elige la hora <span className={styles.stepHint}>{longDate(date)}</span>
                </h2>
              </header>
              <div aria-live="polite">
                {(slotsLoading || searching) && (
                  <p className={styles.muted}>{searching ? "Buscando el siguiente día con huecos…" : "Consultando disponibilidad…"}</p>
                )}
                {!slotsLoading && !searching && currentSlots && currentSlots.length === 0 && (
                  <div className={styles.empty}>
                    <p className={styles.muted}>No quedan huecos este día.</p>
                    <button type="button" className={styles.secondary} onClick={findNextAvailable}>
                      Buscar el siguiente día con huecos
                    </button>
                  </div>
                )}
                {!slotsLoading && !searching && currentSlots && currentSlots.length > 0 && (
                  <ul role="list" className={styles.slots}>
                    {currentSlots.map((slot) => (
                      <li key={slot}>
                        <button type="button" className={styles.slot} aria-pressed={slot === time} onClick={() => chooseTime(slot)}>
                          {slot}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          {/* Datos */}
          {time && service && (
            <section ref={dataStep} className={styles.step} aria-labelledby="bk-data">
              <header className={styles.stepHead}>
                <span className={styles.stepNum}>{n()}</span>
                <h2 id="bk-data" className={styles.stepTitle} tabIndex={-1}>
                  Tus datos
                </h2>
              </header>
              <form className={styles.form} onSubmit={submit}>
                <label className={styles.field}>
                  <span>Nombre y apellidos</span>
                  <input name="name" required autoComplete="name" maxLength={120} />
                </label>
                <label className={styles.field}>
                  <span>Teléfono</span>
                  <span className={styles.phone}>
                    <span aria-hidden="true">+{phonePrefix}</span>
                    <input
                      name="phone"
                      required
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      pattern="[0-9 ]{9,11}"
                      title="Móvil o fijo de 9 cifras"
                      maxLength={11}
                    />
                  </span>
                </label>
                <label className={styles.field}>
                  <span>Email{required.email ? "" : " (opcional)"}</span>
                  <input name="email" type="email" required={Boolean(required.email)} autoComplete="email" maxLength={160} />
                </label>
                <label className={`${styles.field} ${styles.full}`}>
                  <span>Motivo de la consulta{required.notes ? "" : " (opcional)"}</span>
                  <textarea name="notes" required={Boolean(required.notes)} rows={3} maxLength={1000} />
                </label>
                {consentText && (
                  <label className={`${styles.consent} ${styles.full}`}>
                    <input type="checkbox" name="consent" required />
                    <span>{consentText}</span>
                  </label>
                )}
                <div className={`${styles.submitRow} ${styles.full}`}>
                  <p className={styles.submitSummary}>
                    <strong>{service.name}</strong>
                    <span className={styles.capitalize}>
                      {longDate(date)} · <span className={styles.tabular}>{time}</span>
                    </span>
                  </p>
                  <button type="submit" className={styles.primary} disabled={submitting}>
                    {submitting ? "Confirmando…" : "Confirmar reserva"}
                    {!submitting && <span aria-hidden="true">→</span>}
                  </button>
                </div>
              </form>
            </section>
          )}

          {notice && (
            <p className={styles.notice} role="alert">
              {notice}
            </p>
          )}
        </div>

        {/* Resumen */}
        <BookingAside
          aside={aside}
          rows={[
            { label: "Servicio", value: service?.name },
            ...(needsMember || member
              ? [{ label: member?.type === "resource" ? "Sala" : "Profesional", value: member?.name }]
              : []),
            { label: "Día", value: date ? longDate(date) : undefined, className: styles.capitalize },
            {
              label: "Hora",
              value: time ? `${time}${service ? ` · ${service.durationMinutes} min` : ""}` : undefined,
              className: styles.tabular,
            },
          ]}
        />
      </div>
    </div>
  );
}

type SummaryRow = { label: string; value?: string; className?: string };

/** Resumen de la reserva + contenido lateral de la web anfitriona */
function BookingAside({ rows, aside }: { rows?: SummaryRow[]; aside?: ReactNode }) {
  return (
    <aside className={styles.aside} aria-label={rows ? "Resumen de tu reserva" : undefined}>
      {rows && (
        <div className={styles.summary}>
          <p className={styles.eyebrow}>Tu reserva</p>
          <dl className={styles.summaryList}>
            {rows.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd className={row.value ? row.className : undefined}>
                  {row.value ?? <span className={styles.placeholder}>Sin elegir</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {aside}
    </aside>
  );
}
