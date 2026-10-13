# Assets · Maqui Martín Hernández

La demo funciona **sin fotografías**: el arco de luz del inicio es una ilustración
SVG abstracta (`src/components/arch.tsx`). En la investigación no se encontró
ninguna fotografía que pudiera identificarse con seguridad como de Maqui ni de su
consulta, así que no se ha usado ninguna imagen de terceros, de stock ni generada
por IA.

## Fotografías que pediríamos

Todas en `.webp` (calidad ~80), sRGB, sin texto incrustado y con autorización
expresa de la profesional. Luz natural, tonos cálidos, sin retoque excesivo.

| Archivo | Uso en la web | Dimensiones | Proporción | Notas |
| --- | --- | --- | --- | --- |
| `maqui-retrato.webp` | Dentro del arco del inicio y en «Sobre Maqui» | 1500 × 2100 px | 5:7 vertical | Retrato de medio cuerpo, mirada a cámara o ligeramente lateral, expresión tranquila. Espacio libre por arriba (el arco recorta la parte superior). Fondo neutro o la propia consulta desenfocada. |
| `consulta-01.webp` | Sección «La consulta» | 2400 × 1600 px | 3:2 horizontal | Vista general del despacho: sillones/zona de conversación, luz de ventana. Sin personas. |
| `consulta-02.webp` | Sección «Primera cita» o galería | 1600 × 2000 px | 4:5 vertical | Rincón de la consulta (butaca, lámpara, estantería). |
| `detalle-despacho.webp` | Detalle decorativo | 1600 × 1600 px | 1:1 | Detalle de textura: una taza, libros, una planta, la luz sobre la mesa. Nada que identifique a pacientes. |

Peso objetivo: < 250 KB por imagen.

## Cómo activarlas

1. Copiar los archivos en esta carpeta (`public/assets/maqui-martin-psicologia/`).
2. En `src/app/page.tsx`, pasar la ruta al arco del inicio:
   `<Arch src="/assets/maqui-martin-psicologia/maqui-retrato.webp" alt="Maqui Martín Hernández en su consulta" />`
3. Revisar el `alt` de cada imagen con la profesional.

## Lo que NO debe usarse

- Fotografías de directorios cuyo origen no pueda confirmarse (muchos usan
  imágenes genéricas o de Unsplash).
- Personas de stock presentadas como Maqui o fotos de otras consultas.
- Retratos generados por IA.
