# Emails de Lemon RX (Supabase → Authentication → Emails → Templates)

| Plantilla de Supabase | Asunto | Archivo |
| --- | --- | --- |
| Confirm signup | Confirma tu email · Lemon RX | confirmar-registro.html |
| Reset password | Crea una contraseña nueva · Lemon RX | recuperar-contrasena.html |
| Change email address | Confirma tu nuevo email · Lemon RX | cambio-email.html |

En cada plantilla: pega el asunto, cambia el cuerpo a "Source"/HTML, pega el archivo entero y guarda.

## Envío con Resend (dominio de AvanttAI), solo para Lemon RX

El SMTP y las plantillas se configuran por proyecto de Supabase. Todo esto se hace solo en el proyecto "Lemon RX", así que los emails de AvanttAI no cambian.

1. Resend → API Keys → Create API key. Nombre "Lemon RX", permiso "Sending access", dominio el de AvanttAI. Copia la clave (no la pegues en el chat).
2. Supabase, proyecto Lemon RX → Authentication → Emails → SMTP Settings → Enable Custom SMTP:
   - Sender email: lemonrx@<dominio de AvanttAI>
   - Sender name: Lemon RX
   - Host: smtp.resend.com · Port: 465 · Username: resend · Password: la clave del paso 1
3. Mismo proyecto → Authentication → Emails → Templates: pega los tres asuntos y archivos de la tabla de arriba.
4. No toques los proyectos de Supabase de AvanttAI ni sus plantillas.
