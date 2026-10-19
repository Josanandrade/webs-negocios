# Sonia, Peluquería y Salón de Belleza · demo comercial (Espartinas)

Demo no indexable para **Sonia, Peluquería y Salón de Belleza** (Urb. Los Castaños, 27 · Novo Parque · 41807 Espartinas, Sevilla).

Enfoque: el salón ya tiene presencia online (blog en Blogspot, 2013–2014). La demo enseña cómo se vería esa misma presencia llevada a una web actual, conservando su contenido y su voz ("Tu peluquera, Sonia"), sin mencionar ni criticar el blog en la web.

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta como preview de la rama `demo/sonia-espartinas`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la solicitud de cita prepara un mensaje de WhatsApp en el navegador.

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos de contacto

- Teléfonos: buscar `954113620` / `616499044` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (ahora el móvil de Fresha, sin confirmar que tenga WhatsApp).
- Horario: bloque `.hours` en `demo-host/index.html`.

Investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos visuales en [docs/README_ASSETS.md](docs/README_ASSETS.md).
