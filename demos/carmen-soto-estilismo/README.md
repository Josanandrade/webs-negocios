# Carmen Soto Peluquería & Estilismo · demo comercial (Gines)

Demo no indexable para **Carmen Soto Peluquería & Estilismo** (Gines, Sevilla).

- **Versión publicable:** `demo-host/` (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta y crea la preview de la rama `demo/carmen-soto-estilismo`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: el formulario de cita y el test de estilo preparan un mensaje de WhatsApp en el navegador.
- No indexable por tres vías: `<meta name="robots">` en `index.html`, `demo-host/robots.txt` (`Disallow: /`) y `demo-host/_headers` (`X-Robots-Tag: noindex, nofollow, noarchive`).

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Antes de enviar: rellenar el teléfono

El teléfono no se ha podido confirmar (solo existe la página de Facebook y el contenedor no puede leerla).
Poner el móvil en `CONFIG.PHONE` de `demo-host/main.js` (solo 9 dígitos). Con eso:
- los botones de WhatsApp abren el chat del salón con el mensaje preparado (sin número abren el selector de contactos);
- aparecen los botones "Llamar al salón" y la tarjeta "Teléfono" (ocultos mientras esté vacío).

Si se confirma la dirección, añadirla en la sección `#ubicacion` (lista `.where__list`) y en el enlace "Cómo llegar" (ahora busca "Carmen Soto Peluquería Gines Sevilla" en Google Maps).

Detalle en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y [docs/README_ASSETS.md](docs/README_ASSETS.md).
