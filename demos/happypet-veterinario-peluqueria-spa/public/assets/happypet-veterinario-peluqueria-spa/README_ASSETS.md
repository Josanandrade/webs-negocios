# Assets · HappyPet (documento interno, no se publica)

> `scripts/postbuild.mjs` elimina cualquier `.md` de `out/` y falla si aparece
> contenido interno en la exportación. Este fichero nunca llega a la preview.

## Estado (14/10/2026)

No hay ninguna fotografía real del negocio en la demo. Desde el entorno de
trabajo no se pudo descargar nada de Google Business, Facebook ni de los CDN de
imágenes de los directorios (bloqueo de red), y **no se ha usado stock**.

La demo está diseñada para funcionar sin fotos: la portada usa dos "puertas"
gráficas (Veterinaria / Peluquería & Spa) en lugar de una foto, y ninguna
sección depende de imágenes.

## Fotos reales detectadas (sin descargar)

| Fuente | Qué es | URL |
| --- | --- | --- |
| Google Business (vía clinicaveterinariawaksman.es) | Foto principal de la ficha | https://lh3.googleusercontent.com/p/AF1QipN92XmBrb1m35hekr0gGquMH0LfCskJbMOw42TY |
| clinicaveterinaria.es | Miniatura de la ficha (350×215) | https://cdn.hostsrg.com/infovet/media/items/350x215/27177-HAPPYPET-Centro-Veterinario-Peluqueria-Spa-ZzbYb.jpg |
| Facebook "HAPPY PET" | Página del negocio | https://www.facebook.com/Veterinariahappypet76/ |

No se ha podido ver su contenido; hay que revisarlas a mano antes de usarlas y
pedir permiso al negocio.

## Fotos que pedir al negocio (prioridad)

1. Fachada de C. Virgen de la Soledad, 8 (para "Contacto", ayuda a encontrarlo).
2. Consulta veterinaria: sala, mesa de exploración, sin pacientes identificables
   salvo permiso del dueño.
3. Zona de peluquería: bañera, mesa de corte, secado.
4. Equipo (si quieren salir), con nombres y funciones.
5. Trabajos reales de peluquería (antes/después) con permiso de los dueños.
6. Logotipo en vectorial, si existe.

## Dónde irían

- Portada: dentro de las dos puertas (foto de consulta en la verde, de
  peluquería en la albaricoque), recortadas en arco.
- Secciones Veterinaria / Peluquería & Spa: una foto bajo el texto de cabecera.
- "Así es una visita": foto del equipo.
- Contacto: fachada.

Formato recomendado: WebP, 1600 px de ancho máximo, ≤ 250 KB, en esta carpeta.
