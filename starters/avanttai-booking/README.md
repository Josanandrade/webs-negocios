# Kit de reserva AvanttAI (white-label)

Reserva online integrada **dentro** de la web de cualquier negocio, con su identidad visual, usando el motor de reservas de AvanttAI como única fuente de verdad.

```text
Web del negocio  /reservas  (presentación con su marca)
        │  fetch same-origin
        ▼
Web del negocio  /api/reservas  (proxy de servidor, este kit)
        │  server-to-server
        ▼
AvanttAI  /api/public/booking/[slug]  (motor: servicios, profesionales,
                                       horarios, bloqueos, festivos,
                                       vacaciones, validaciones, citas,
                                       emails, gestión posterior)
```

- **Sin iframe** y **sin copiar lógica**. Cada hueco, validación y cita la decide AvanttAI. El kit solo pinta y reenvía.
- **Sin CORS ni secretos en el navegador.** El navegador solo habla con la propia web, y la URL del motor y el slug viven en variables de entorno del servidor.
- **White-label por configuración.** Cada negocio aporta un `BookingTheme` (colores, tipografía, radios, ancho, logo). Los valores pueden ser variables CSS de la propia web (`var(--ink)`), así la reserva hereda su sistema de diseño.
- **Preparado para que AvanttAI sirva el tema.** Si la API pública devuelve `theme` (mismo esquema que `bookingTheme`), el kit lo combina con el local, y el local manda. Los valores remotos se sanean para que no puedan inyectar CSS.

## Archivos

| Archivo | Qué hace |
| --- | --- |
| `types.ts` | Contrato de la API pública de AvanttAI y esquema `BookingTheme`. |
| `theme.ts` | Tema por defecto, saneado/combinación de temas y variables `--bk-*`. |
| `server.ts` | `createBookingProxy()`: rutas `GET`/`POST` de Next.js que reenvían al motor (lista blanca de campos, límites de tamaño, *timeout*, sin caché, límite básico por IP). |
| `BookingFlow.tsx` | Componente cliente: servicio → profesional (si hay varios) → día → hora → datos → confirmación. Gestiona huecos ocupados (409), búsqueda del siguiente día con huecos y el paso de primera visita de AvanttAI Health. |
| `BookingFlow.module.css` | Estilos; solo usan variables `--bk-*`. |

## Integrar en una web Next.js

1. Copia esta carpeta dentro de la web, por ejemplo en `lib/avanttai-booking/`. Las webs de este repo deben poder extraerse sin depender de `starters/`.
2. Crea el proxy en `app/api/reservas/route.ts`:

   ```ts
   import { createBookingProxy } from "@/lib/avanttai-booking/server";
   export const dynamic = "force-dynamic";
   export const { GET, POST } = createBookingProxy();
   ```

3. Crea la página `app/reservas/page.tsx` con la cabecera y el pie de la web y:

   ```tsx
   <BookingFlow
     theme={{ primaryColor: "var(--ink)", accentColor: "var(--accent)", fontFamily: "inherit" }}
     consentText="Acepto que el negocio use mis datos para gestionar esta cita."
     fallback={<a href="tel:…">Llámanos</a>}
     aside={<p>Dirección, horario…</p>}
   />
   ```

4. Variables de entorno del servidor de la web:

   | Variable | Ejemplo |
   | --- | --- |
   | `AVANTTAI_BOOKING_API_URL` | `https://avanttai.com` (o la URL de TEST) |
   | `AVANTTAI_BOOKING_SLUG` | el slug público del negocio en AvanttAI (Reservas online → Tu enlace público) |

5. Apunta todos los botones de «Reservar» a `/reservas`.

En AvanttAI, el negocio debe tener la reserva online activada y la agenda en AvanttAI (proveedor `avanttai`). Si no, la API responde 404 y la web muestra el `fallback`.

## Qué sigue en AvanttAI

- **Emails, gestión posterior y primera visita de Health.** Los emails de confirmación y los enlaces de «cambiar/cancelar» los envía AvanttAI y apuntan a sus páginas (`/reserva/gestionar`). El registro de primera visita y la señal de AvanttAI Health también son páginas de AvanttAI.
- **Siguiente paso recomendado (en AvanttAI):**
  - guardar `bookingTheme` por negocio y devolverlo en la API pública;
  - aplicarlo a esas páginas alojadas;
  - permitir una URL de gestión propia por negocio, para que los enlaces de los emails lleven a la web del negocio.
