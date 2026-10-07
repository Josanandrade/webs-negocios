import { createBookingProxy } from "@/lib/avanttai-booking/server";

// Proxy hacia el motor de reservas de AvanttAI (sin caché: la disponibilidad es en vivo).
export const dynamic = "force-dynamic";
export const { GET, POST } = createBookingProxy();
