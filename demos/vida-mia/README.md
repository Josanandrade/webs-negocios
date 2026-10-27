# Vida Mía · Centro boutique de entrenamiento (demo comercial)

Demo estática publicada por Cloudflare Pages desde `demo-host/` en la rama `demo/vida-mia`.
No indexable: meta robots noindex, `robots.txt` Disallow y `_headers` con `X-Robots-Tag: noindex`.

## Cómo sustituir fotos y logo

1. Sube las fotos a `demo-host/assets/fotos/` con estos nombres (JPG, ~1600 px de lado largo):
   - `hero.jpg` (vertical 4:5, la sala con el ladrillo y el cronómetro)
   - `sala-1.jpg` La sala (grande) · `sala-2.jpg` Remo y air bike · `sala-3.jpg` Zona de fuerza
   - `sala-4.jpg` Trabajo con sacos · `sala-5.jpg` El equipo
2. Añade cada nombre a `CONFIG.fotos` en `demo-host/main.js` (p. ej. `fotos: ["hero", "sala-1"]`).
   La foto aparece con un fundido sobre el hueco ilustrado y la etiqueta desaparece.
3. Logo: guarda `demo-host/assets/logo.png` (o .svg) y pon `logo: "assets/logo.png"` en `CONFIG`.

## Datos de contacto

Todo en `CONFIG` al principio de `demo-host/main.js`: `whatsapp`, `telefono`, `email`, `direccion`,
`mapsUrl`, `horario`. Con `whatsapp` relleno, el formulario abre WhatsApp con el mensaje redactado;
vacío, simula el envío. Los canales sin dato se muestran como "Por confirmar".

## Contenido provisional

Entrenamientos (`TRAININGS`) y tarifas (`PLANS`) en `main.js` son de ejemplo y se muestran con la
etiqueta "Contenido de ejemplo" / "Precios de ejemplo". Las cifras de la franja de extras están en
`index.html` (sección `#tarifas`).

Documentación interna (no se despliega): `docs/INTERNAL_AUDIT.md`.
