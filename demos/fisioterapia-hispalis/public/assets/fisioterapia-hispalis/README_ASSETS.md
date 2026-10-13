# Fisioterapia Híspalis · Recursos gráficos pendientes

Uso interno. Esta demo se ha diseñado para funcionar **sin fotografías**: no se
han podido obtener fotos propias del negocio con calidad suficiente y no se usan
fotos de stock, de otras clínicas ni personas generadas por IA.

Cuando la clínica nos facilite material, basta con:

1. Guardar el archivo en esta carpeta con el nombre indicado.
2. En `lib/assets.ts`, sustituir `src: null` por la ruta (`/assets/fisioterapia-hispalis/<archivo>`).

El marco en arco ya está maquetado: la foto sustituye a la composición abstracta
sin tocar el diseño.

## Fotografías

| Archivo | Tamaño mínimo | Dónde se usa | Qué debería mostrar |
| --- | --- | --- | --- |
| `hero-clinica.webp` | 1600 × 2000 (vertical 4:5) | Hero (arco verde) | Angélica tratando a un paciente, luz natural, plano medio. Es la foto más importante. |
| `angelica-retrato.webp` | 1000 × 1250 (vertical 4:5) | Sección «Quién te atiende» | Retrato cercano de Angélica, mirando a cámara, fondo neutro o la propia clínica. |
| `consulta-01.webp` | 1600 × 1100 | Reservado (sección de la clínica) | Sala de tratamiento ordenada, camilla, luz natural. |
| `tratamiento-01.webp` | 1600 × 1100 | Reservado | Detalle de manos trabajando (terapia manual / ejercicio). |
| `fachada.webp` | 1600 × 1100 | Reservado (ubicación) | Entrada del local en C/ Betis, 7 para que el paciente la reconozca. |

Formato recomendado: WebP calidad 80, perfil sRGB, sin texto incrustado.
Necesitamos autorización expresa de las personas que aparezcan (pacientes incluidos).

## Logotipo

No se ha podido descargar el logotipo original (la web oficial no es accesible
desde el entorno de trabajo). La demo usa un **logotipo tipográfico provisional**
(`components/Logo.tsx`): arco + «Fisioterapia Híspalis».

Pedir a la clínica: logotipo en SVG (o PNG ≥ 1000 px con fondo transparente) y, si
existe, su manual o colores corporativos.

## Otros datos a confirmar con la clínica

- Horario actual (las fuentes públicas no coinciden). Rellenar `business.hours`.
- Si los precios publicados siguen vigentes (`business.showPrices`).
- Ficha de Google: enlace exacto y número actual de reseñas, para mostrar reseñas reales con permiso.
