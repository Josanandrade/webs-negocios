# Hogar Inmobiliaria · demo comercial

Web estática publicada desde `demo-host/` en la rama `demo/hogar-inmobiliaria` (Cloudflare Pages, preview por rama).
Esta carpeta solo guarda documentación interna; no se despliega.

- Web pública: `demo-host/index.html` + `main.js`
- Ficha de inmueble: `demo-host/inmueble/?id=<id>` (`inmueble.js`)
- Panel de gestión de demostración: `demo-host/admin-demo/` (`admin.js`, `admin.css`)
- Datos e inmuebles ficticios: `demo-host/assets/data.js` (WhatsApp y teléfono en `CONFIG`, una sola línea)
- Ilustraciones SVG propias: `demo-host/assets/art.js`

El panel guarda los cambios en `localStorage` del navegador para que la web pública del mismo dispositivo los muestre. "Restablecer" vuelve a los datos de serie.
