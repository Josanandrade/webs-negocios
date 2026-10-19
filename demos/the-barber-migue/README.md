# The Barber Migue · demo comercial (Pilas)

Demo no indexable para **The Barber Migue**, barbería en Pilas (Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta y crea la preview de la rama `demo/the-barber-migue`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics. La reserva prepara un mensaje de WhatsApp en el navegador; no se envían datos a ningún servidor.

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Rellenar datos reales

Todo está en las constantes del principio de `demo-host/main.js`:

- `PHONE`: móvil sin prefijo. Activa los botones "Llamar" y muestra el número.
- `WA_NUMBER`: con prefijo 34. Sin él, WhatsApp abre el chat para elegir contacto.
- `INSTAGRAM`: URL del perfil.
- `ADDRESS`: dirección completa (sustituye "Pilas · 41840 Sevilla" y afina "Cómo llegar").

Investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos visuales en [docs/README_ASSETS.md](docs/README_ASSETS.md).
