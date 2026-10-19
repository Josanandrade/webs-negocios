# María Baena Nails & Beauty · demo comercial (Bormujos)

Demo no indexable para **María Baena Nails & Beauty** (Calle Colón · 41930 Bormujos, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta y crea la preview de la rama `demo/maria-baena-nails-beauty`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la solicitud de cita prepara un mensaje de WhatsApp en el navegador.

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos

- Teléfono: buscar `695634092` / `695 63 40 92` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (móvil público, WhatsApp sin confirmar).
- Horario del indicador "Abierto ahora": constante `HOURS` en `demo-host/main.js`.
- Galería: sustituir los SVG de `demo-host/assets/galeria/` por fotos reales (ver [docs/README_ASSETS.md](docs/README_ASSETS.md)).

Investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md).
