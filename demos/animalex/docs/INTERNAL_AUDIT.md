# Animalex — auditoría interna (no se publica)

Documento de trabajo. Vive fuera de `public/` y de `src/app/`, así que no
forma parte de la preview. Fecha de la investigación: 14 de octubre de 2026.

Limitación del entorno: Google Maps/Business, `negocio.site`, Instagram,
Facebook, Foursquare, Cylex, animaldreams.es, discoversevilla.city y
web.archive.org están bloqueados desde la red de trabajo. Todo lo que sigue
sale de directorios que sí se pudieron abrir y de resultados de buscador.
Ningún dato se ha contrastado directamente con la ficha de Google.

## 1. Presencia digital encontrada

| Canal | Dato | Notas |
| --- | --- | --- |
| Google Business | Ficha con place_id `ChIJew6SAO1uEg0R2Rxx2W2lRMo` (enlazada desde mejoresdesevilla.com) | No se ha podido abrir. Coordenadas 37.37402, -5.95949 (madmascotas, firmania, citiservi). |
| negocio.site | `https://animalex-pet-store.negocio.site/?utm_source=gmb…` (guialocal.aedemo.es) | Es la web gratuita que generaba Google Business Profile. Bloqueada desde el entorno. Google dejó de servir estas webs en 2024 (primero redirigían a la ficha, después dejaron de funcionar), así que lo más probable es que hoy no muestre nada. **Inferido, no comprobado.** |
| Instagram / Facebook | No encontrados | Ninguna búsqueda devuelve perfiles; comerciosevilla.es muestra los botones de redes vacíos y dice que si no redirigen es que no hay perfil. |
| Ecommerce | No encontrado | Ningún dominio propio (animalex.es / .com no aparecen asociados), ninguna tienda online. |
| Directorios | madmascotas.es, comerciosevilla.es, firmania.es, guialocal.aedemo.es, mejoresdesevilla.com, desevillalomejor.com, citiservi.es, infoisinfo («Anim Alex»), páginas amarillas, cylex, foursquare («AnimAlex»), animaldreams | Los que se pudieron abrir coinciden en dirección y teléfono. |

## 2. ¿Tiene web propia moderna?

**No.** Su única «web» es la de `negocio.site` generada desde Google Business,
un producto que Google cerró. Sin redes propias ni tienda online localizadas.
Se continúa con la demo, como pide el encargo.

## 3. Datos de contacto

| Dato | Valor | Fuentes | Uso en la demo |
| --- | --- | --- | --- |
| Dirección | C. Lisboa, 49, 41006 Sevilla (El Cerro / Cerro-Amate) | madmascotas, comerciosevilla, firmania, guialocal, mejoresdesevilla, desevillalomejor, citiservi, infoisinfo | Publicada. |
| Teléfono | 607 49 14 86 | madmascotas, comerciosevilla, firmania, guialocal, mejoresdesevilla, desevillalomejor, citiservi | Publicado (llamar). |
| WhatsApp | Mismo móvil | **Sin confirmar** que lo atiendan por WhatsApp | Activado en la demo por ser el canal prioritario del encargo. Se apaga con `whatsappEnabled: false` en `src/content/site.ts`. |
| Horario | L–V 9:30–15:00 y 17:30–21:30; S 9:30–15:00; D cerrado | firmania (fijado 03/07/2026), guialocal, desevillalomejor; madmascotas lo da en el texto | Publicado, con nota «en festivos, mejor llama antes». mejoresdesevilla da solo L–S 9:30–15:00 (discrepancia, minoritaria). |

## 4. Oferta verificada

**Publicado (coincide en al menos dos fuentes o es atributo de la ficha):**

- Alimentación para perros y gatos, de varias marcas (madmascotas; citiservi «comida para animales y perros»; desevillalomejor).
- Juguetes, correas, transportines (madmascotas).
- Accesorios y productos de higiene (madmascotas, comerciosevilla, citiservi).
- Reparto a domicilio (madmascotas «entrega a domicilio», mejoresdesevilla). Se publica sin «gratis»: ver descartes.
- Pago con tarjeta y con móvil NFC; acceso para sillas de ruedas (madmascotas, atributos que suelen venir de Google).
- Tienda pequeña de barrio atendida por su dueño, que asesora (desevillalomejor; reseñas recogidas en mejoresdesevilla: «El chico te aconseja, te asesora…», «Alex es un gran profesional…»).

**No vende online.** La demo es un catálogo de consulta: pasillos, «¿qué animal
tienes?» y un generador de mensaje para WhatsApp/llamada. Sin carrito, sin
precios, sin stock simulado, sin formulario que envíe datos.

**Otras especies:** una reseña habla de «variedad de productos y especies» y
mejoresdesevilla menciona «alimento vivo». Indica que atienden más que perros
y gatos, pero no qué animales exactamente. Por eso existe la tarjeta «Otras
mascotas», que solo invita a preguntar y no nombra especies.

## 5. Información descartada

| Dato | Fuente | Motivo |
| --- | --- | --- |
| Peluquería | comerciosevilla | Una sola fuente, texto genérico de directorio. |
| «Asesoramiento veterinario» | comerciosevilla | Una sola fuente; además implica un servicio sanitario. |
| Aves exóticas y pequeños roedores | comerciosevilla | Una sola fuente, texto genérico. |
| Productos ecológicos / naturales | comerciosevilla, desevillalomejor | Texto genérico de directorio, sin marcas ni detalle. |
| Alimento vivo | mejoresdesevilla | Una sola fuente. Pendiente de confirmar (si es cierto, es un gran reclamo para reptiles/aves). |
| Reparto **gratuito** | mejoresdesevilla | Una sola fuente. Se publica «reparto a domicilio, pregunta condiciones». |
| «Desde 2004» | mejoresdesevilla | Una sola fuente. |
| Valoración 4,6 / 5 | madmascotas, mejoresdesevilla (texto) | No contrastada con Google. No se publica ninguna cifra. |
| Nº de reseñas (369 en madmascotas, 256 en mejoresdesevilla) | — | Las cifras no coinciden. No se publica. |
| Nombre del dueño («Alex») | reseña citada en mejoresdesevilla; el nombre del negocio lo sugiere | Sin confirmar que quiera aparecer. La web dice «su dueño». |
| C. Juan de Ledesma, 58 | Páginas Amarillas (título del resultado) | Ficha vacía al abrirla; probablemente una dirección antigua. Todo lo reciente dice C. Lisboa 49. |
| Marcas concretas | — | Ninguna fuente las nombra. Sin bloque de marcas. |
| Animales vivos a la venta | — | Sin fuente. No se menciona. |

## 6. Reputación

Varios directorios recogen muchas valoraciones con nota alta, pero las cifras
no coinciden y no se pueden comprobar en Google. La demo usa la reputación sin
números: sección «El barrio lo recomienda» con los cuatro temas que se repiten
en las reseñas recogidas (asesoran, buenos precios, variedad, buen trato) y un
enlace a la ficha de Google Maps. No se citan reseñas literales (sin permiso).

## 7. Textos de la demo que conviene validar

- «Lo que necesita tu mascota. Y alguien que sabe aconsejarte.»
- «Aquí no solo te despachan. Te asesoran.»
- Descripciones de cada pasillo (texto comercial genérico, coherente con las categorías verificadas).
- «Te ayudamos a elegir según tamaño y carácter» (juguetes) y «Dinos qué animal y cuánto pesa» (transportines).
- «No vendemos online» (no se ha encontrado tienda online; confirmar).

## 8. Concepto visual — «Señalética de tienda»

- **Idea:** la web funciona como el directorio de una tienda bien organizada.
  Los productos se agrupan en seis «pasillos» numerados con un color cada uno,
  como bandas de packaging o rótulos colgados del techo. El hero es un panel de
  directorio («En tienda»); la dirección se presenta como placa de calle; la
  consulta se imprime como un tique de caja con borde troquelado.
- **Logotipo de la demo:** etiqueta de precio amarilla con la «A» y el nombre en
  rótulo condensado. No es el logotipo oficial (no se ha encontrado ninguno).
- **Color:** papel `#F3F1EA`, tinta `#141414`, amarillo señal `#FFD23F` como
  acento; seis colores de pasillo (naranja, turquesa, amarillo, azul, violeta,
  verde) siempre con texto en tinta para mantener contraste AA.
- **Tipografía:** una sola familia variable, Archivo, usando el eje de anchura:
  condensada al 66–75 % y muy negra para rótulos, anchura normal para leer.
- **Evitado a propósito:** huellas, huesos, ilustraciones infantiles, rosa,
  estética de peluquería (El Caniche Rosa) y el verde/azul clínico de una
  veterinaria (Clínica Veterinaria Camas).

## 9. Arquitectura

1. Hero: estado abierto/cerrado en hora de Madrid, titular, CTA «Consultar un producto» y «Cómo llegar», directorio de pasillos.
2. ¿Qué animal tienes? — Perro, Gato, Otras mascotas; cada tarjeta rellena la consulta.
3. Seis pasillos — cada uno con «Consultar», que rellena la consulta.
4. Asesoramiento — dueño, reparto, pago, accesibilidad.
5. Consulta — elige animal, pasillo y detalle; genera el mensaje y abre WhatsApp o llama. No envía nada desde la web.
6. Reputación sin cifras + enlace a Google Maps.
7. Visita — placa de dirección, horario completo, cómo llegar.
8. Barra fija en móvil: Llamar · WhatsApp · Cómo llegar.

## 10. Movimiento y criterios de interfaz

Las skills de Emil Kowalski (emil-design-eng, review-animations,
improve-animations, performance-cheatsheet) **no están instaladas en este
entorno**; tampoco hay skills de diseño/UX/accesibilidad. Se han aplicado sus
principios a mano:

- Curva propia `cubic-bezier(0.23, 1, 0.32, 1)`; entradas 560 ms escalonadas 70 ms solo en el hero; interacciones de 160–200 ms.
- Solo `transform` y `opacity` (más color en hovers).
- Botones que ceden a `scale(0.97)`; flechas que avanzan 3–4 px en hover; punto de «Abierto» con pulso suave.
- Hover solo con `(hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion`: animaciones y transiciones anuladas, sin pulso, scroll sin suavizado.

## 11. Privacidad de la demo

- `robots.txt` con `Disallow: /`, meta robots noindex/nofollow y cabecera `X-Robots-Tag` en todas las rutas.
- Sin analytics, píxeles, cookies, mapas incrustados ni fuentes de terceros en tiempo de ejecución (`next/font` autoaloja Archivo).
- Sin formularios que envíen datos: la consulta solo compone un enlace `wa.me`/`tel:`.
- Pie con aviso: «Web de demostración. No es la web oficial de Animalex…».
- `README_ASSETS.md` bloqueado con 404 por `src/proxy.ts`; `/docs` no se sirve.

## 12. QA

Ver el apartado de QA en el README y el resumen de entrega en el hilo.

## 13. Qué pedir al negocio

1. ¿El 607 49 14 86 atiende WhatsApp?
2. Horario actual y festivos.
3. ¿Reparto gratuito? ¿En qué zonas?
4. ¿Qué otros animales atienden? ¿Alimento vivo? ¿Venden animales?
5. Marcas principales de alimentación.
6. Si el dueño quiere aparecer con nombre y foto.
7. Las fotos de `public/assets/animalex/README_ASSETS.md` y el logotipo.
8. Permiso para citar 2–3 reseñas literales de Google.
