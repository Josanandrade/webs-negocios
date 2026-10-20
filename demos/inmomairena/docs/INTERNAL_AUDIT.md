# Inmobiliaria Inmomairena · notas internas (no se despliega)

## Datos del lead
- Nombre: Inmobiliaria Inmomairena, Mairena del Aljarafe (Sevilla).
- Teléfono público facilitado por Jose: 633 57 35 99. Usado también como WhatsApp (`CONFIG.whatsapp` en `demo-host/assets/data.js`): **pendiente de confirmar**.
- Búsqueda web del 20/10/2026 sin resultados útiles para "Inmomairena" (ni dirección, ni web, ni email). La demo no muestra dirección, email, cifras ni años de experiencia.

## Contenido de demostración
- 12 inmuebles ficticios (no copiados de portales) en Mairena (Simón Verde, Ciudad Expo, Cavaleri, Lepanto, casco antiguo, Ciudad Aljarafe) y alrededores (Bormujos, Tomares, San Juan, Gelves, Palomares, Almensilla). Estados: 8 disponibles, 2 reservados, 1 vendido, 1 alquilado.
- Imágenes: ilustraciones SVG propias generadas con `demos/inmomairena/tools/gen-images.mjs` (basado en el generador de Julio Puig, con paleta y escenas propias).
- Solicitudes del panel: ejemplos ficticios.

## Identidad
"Atardecer en el Aljarafe": piedra #F7F3EE, noche malva #211B2E, degradado coral #F06A4B → miel #F4AE5E, lavanda #C9C1E6. Red Hat Display + Red Hat Text + Spectral itálica. Hero oscuro con palabra rotativa (comprar/vender/alquilar/vivir), chalet al atardecer con ventanas encendidas y tarjeta "Nuevo en la web" que rota por los destacados.

## Arquitectura
Estático en `demo-host/` (Cloudflare Pages por rama). `assets/data.js` (CONFIG + inmuebles + Store en localStorage), `assets/ui.js` (tarjetas, formularios, mapa SVG), `main.js` (portada), `inmueble/` (ficha `?id=`), `admin-demo/` (panel simulado). noindex en meta, robots.txt y _headers.
