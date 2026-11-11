/**
 * Contrato de la API pública de reservas de AvanttAI
 * (`/api/public/booking/[slug]` en saas-web).
 *
 * El kit solo presenta: servicios, profesionales, huecos, validaciones,
 * creación de citas, emails y gestión posterior los resuelve AvanttAI.
 */

export type BookingService = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number | null;
  notes: string | null;
};

export type BookingMember = {
  id: string;
  name: string;
  type: "professional" | "resource";
  serviceIds: string[];
};

export type RequiredCustomerData = {
  name?: boolean;
  phone?: boolean;
  email?: boolean;
  notes?: boolean;
};

/** GET /api/public/booking/[slug] */
export type BookingSetup = {
  ok: true;
  business: {
    name: string;
    type?: string | null;
    timezone: string;
    publicInformation?: Record<string, string | null>;
  };
  services: BookingService[];
  members: BookingMember[];
  booking: {
    maxAdvanceDays: number;
    minAdvanceMinutes: number;
    requiredCustomerData: RequiredCustomerData;
  };
  /** Opcional: tema que AvanttAI pueda servir en el futuro (`bookingTheme`) */
  theme?: Partial<BookingTheme>;
};

/** GET /api/public/booking/[slug]?serviceId&date&memberId */
export type BookingSlots = { ok: true; slots: string[] };

export type BookingRequest = {
  serviceId: string;
  memberId: string | null;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

/** POST /api/public/booking/[slug] */
export type BookingResult =
  | {
      ok: true;
      healthOnboardingRequired?: false;
      booking: { id: string | number; bookingId: string; serviceName: string; date: string; time: string; durationMinutes: number };
    }
  | {
      ok: true;
      /** AvanttAI Health: paciente nuevo. La cita queda retenida hasta completar registro y señal. */
      healthOnboardingRequired: true;
      onboardingUrl: string;
      expiresAt: string;
      booking: { serviceName: string; date: string; time: string; durationMinutes: number };
    };

export type BookingError = { ok: false; error: string; code?: string };

/**
 * Tema visual de la reserva (white-label). Cualquier valor CSS válido:
 * colores, `var(--token-de-la-web)`, familias tipográficas…
 * Mismo esquema que `bookingTheme` en AvanttAI.
 */
export type BookingTheme = {
  /** Botones principales y elementos seleccionados */
  primaryColor: string;
  /** Texto sobre el color principal */
  primaryTextColor: string;
  /** Detalles: marcas, foco, día de hoy */
  accentColor: string;
  /** Fondo del bloque de reserva */
  backgroundColor: string;
  /** Superficies secundarias (resumen, campos) */
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  dangerColor: string;
  successColor: string;
  /** `inherit` = usa la tipografía de la web anfitriona */
  fontFamily: string;
  headingFontFamily: string;
  /** Anchura de la tipografía de titulares (tipografías variables), p. ej. "75%" */
  headingFontStretch: string;
  /** Etiquetas y datos (horas, fechas) */
  labelFontFamily: string;
  borderRadius: string;
  /** Ancho máximo del bloque */
  maxWidth: string;
  logoUrl: string | null;
};
