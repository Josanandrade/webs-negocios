# Sinfo Daza Peluquería · demo comercial (Benacazón)

Demo no indexable para **Sinfo Daza Peluquería** (C/ Ben a Cassun, 3 · 41805 Benacazón, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica solo esa carpeta y crea la preview de la rama `demo/sinfo-daza`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la cita se prepara como mensaje de WhatsApp en el navegador.

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos de contacto

- Teléfono: buscar `623580199` / `623 58 01 99` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (apunta al móvil público, sin confirmar que tenga WhatsApp).
- Horario: hero (tarjeta "Horario"), "Sobre el salón" y tarjeta "Horario" de Contacto. En `main.js` el formulario bloquea la tarde del sábado.

Investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos visuales en [docs/README_ASSETS.md](docs/README_ASSETS.md).
