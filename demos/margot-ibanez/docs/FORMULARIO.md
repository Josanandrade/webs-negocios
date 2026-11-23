# Formulario de contacto por email · Margot Ibáñez

El cierre de la web ("Tu mirada, tu esencia.") tiene un formulario con nombre, email, teléfono opcional, tratamiento, mensaje y casilla de consentimiento. Los mensajes llegan al **correo de Margot** (el que Jose facilitó; no se escribe aquí porque el repositorio es público) a través de [Web3Forms](https://web3forms.com), un servicio gratuito pensado para webs estáticas como esta.

## Estado actual: sin activar

Mientras no haya clave, el formulario valida los campos pero **no envía**: al pulsar "Enviar mensaje" avisa de que aún no está activo e invita a escribir por WhatsApp. **Hay que activar Web3Forms para que funcione.**

## Cómo activarlo (5 minutos)

1. Entrar en https://web3forms.com y pulsar "Create your Access Key".
2. Escribir el email de destino: el correo de Gmail de Margot. Web3Forms envía la clave **a ese correo**, así que Margot tiene que reenviártela (o hacerlo ella).
3. En `demo-host/index.html`, buscar `name="access_key"` y pegar la clave en `value=""`.
4. Hacer commit y push: Cloudflare Pages publica la web sola.
5. Enviar un mensaje de prueba desde la web y comprobar que llega a Margot (la primera vez puede caer en spam: marcarlo como "no es spam").

La clave de Web3Forms es pública por diseño (solo permite enviar al email con el que se creó), así que puede ir en el HTML; no es una contraseña.

## Qué recibe Margot

Un email con asunto "Consulta web: [tratamiento] ([nombre])", con el nombre, email, teléfono, tratamiento y mensaje. Al pulsar "Responder" contesta directamente a la clienta.

## Detalles técnicos

- Validación en el navegador con mensajes accesibles por campo, foco en el primer error, estado "Enviando…" y avisos de éxito o error (`role="status"`).
- Antispam: campo trampa `botcheck` (honeypot) de Web3Forms.
- Sin JavaScript el formulario hace un POST normal a Web3Forms (cuando hay clave).
- Código: `demo-host/main.js`, bloque "FORMULARIO DE CONTACTO POR EMAIL".

## Pendiente legal

La casilla de consentimiento está, pero falta una **política de privacidad** (y aviso legal) con los datos fiscales de Margot, enlazada junto a la casilla. Hay que pedirle los datos.
