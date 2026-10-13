# Assets · Centro Abepa (demo privada)

## Qué hay ahora

**Ninguna fotografía ni logotipo real.** El entorno de trabajo no tiene acceso
de red a abepa.es, Facebook ni Google Maps, así que no se ha descargado nada.
Tampoco se ha usado stock para representar al equipo ni al centro.

La demo funciona igual sin fotos:

| Hueco | Dónde | Qué se ve ahora |
|---|---|---|
| `photos.sala` | «Primera cita» | Composición de luz de ventana sobre pared encalada + etiqueta «Foto real · una sala del centro» |
| `photos.centro` | «Equipo», última celda | Misma composición + «Foto real · el equipo en el centro» |
| `portraits[nombre]` | Tarjetas del equipo | Iniciales sobre el color de su área |
| Logotipo | Cabecera y pie | Logotipo provisional: tres «estancias» (añil, teja, olivo) + «abepa» |

## Cómo sustituir

1. Dejar los archivos en esta carpeta (`public/assets/abepa-psicologos-logopedas/`),
   preferiblemente `.webp` o `.jpg` de 1600 px de ancho máximo.
2. Rellenar `src/lib/photos.ts`:
   ```ts
   sala: { src: "/assets/abepa-psicologos-logopedas/sala-logopedia.webp", alt: "Sala de logopedia del centro, con mesa baja y materiales", width: 1600, height: 1200 },
   ```
3. Retratos: `portraits["Paloma Megina"] = { … }` (el componente de equipo ya
   está preparado para leerlos; hoy pinta iniciales).
4. Logo: sustituir `src/components/wordmark.tsx` por el SVG oficial y
   regenerar `src/app/icon.svg`.

## Qué pedir al centro (por orden de impacto)

1. **Logotipo en vector** (SVG, PDF o AI). Si solo hay PNG, mínimo 1000 px.
2. **Fachada o portal** de Av. de los Olivos, 25 — ayuda a las familias a
   reconocer el sitio el primer día.
3. **2–3 fotos de salas** con luz natural: sala de logopedia, despacho de
   psicología, mesa de trabajo de pedagogía. Sin pacientes.
4. **Retratos del equipo** (5 personas), mismo fondo y luz, de pecho para
   arriba, mirada a cámara. Si alguien prefiere no salir, se mantienen las
   iniciales.
5. **Materiales de trabajo** (detalle): libros, juegos de lenguaje, fichas.
   Sin caras de menores.
6. **Permiso para citar 2–3 reseñas reales** de Google con nombre de pila o
   iniciales.
7. Confirmar: **horario**, si hay **sesiones online**, **tarifas** (si quieren
   mostrarlas) y que el **equipo** publicado sigue vigente.

## Qué NO usar

- Fotos de menores identificables, aunque estén en redes del centro.
- Fotos de directorios (Cylex, yellow.place, etc.): derechos dudosos y mala calidad.
- Stock de «niños sonriendo» o batas blancas.
