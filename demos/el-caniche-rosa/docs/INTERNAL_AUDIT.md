# El Caniche Rosa — auditoría interna (no se publica)

Documento de trabajo. Vive fuera de `public/` y de `src/app/`, así que no
forma parte de la preview. Fecha de la investigación: 13 de octubre de 2026.

## 1. Presencia digital encontrada

| Canal | Dato | Notas |
| --- | --- | --- |
| Booksy | [El caniche rosa · Tomares](https://booksy.com/es-es/106635_el-caniche-rosa_servicios-para-mascotas_29919_tomares) | Canal de reserva real. 5,0 de valoración; el número de reseñas varía entre páginas de Booksy (155, 201, 206, 209). |
| Instagram | [@elcanicherosa.tomares](https://www.instagram.com/elcanicherosa.tomares/) | Bio: «Peluquería y estilismo canino · dermocosmética · CITAS POR BOOKSY». ~1.880 seguidores, ~150 publicaciones. |
| TikTok | [@elcanicherosa](https://www.tiktok.com/@elcanicherosa) | Vídeos de trabajos (caniches, pomeranias). |
| Facebook | [elcanicherosa.pelucanina](https://www.facebook.com/elcanicherosa.pelucanina/) | Categoría «Pet groomer», ~195 «me gusta». |
| Directorio | [info.peluqueriacanina.com.es/sevilla/tomares](https://info.peluqueriacanina.com.es/sevilla/tomares/) | Ficha con teléfono, horario y dirección. Página de hace ~2 años. |
| Directorio | pelucanes.com | Solo aparece como alternativa en fichas de otras peluquerías. |
| Google Business | No accesible | No se ha podido abrir la ficha de Google Maps ni leer sus reseñas. |

Limitación del entorno: Booksy, Instagram, Facebook, TikTok, Google Maps y los
directorios están bloqueados por la red del entorno de trabajo. Todo lo de
arriba sale de resultados de buscador (fragmentos indexados), no de la página
abierta. Por eso se ha sido conservador en todo.

## 2. ¿Tiene web propia?

**No.** Ninguna búsqueda devuelve un dominio propio, ningún directorio enlaza a
una web y la bio de Instagram manda directamente a Booksy. Su presencia es
Booksy + redes. **Esa es la oportunidad principal**: una casa digital propia que
explique servicios, genere confianza y empuje a la reserva que ya funciona
(Booksy) sin sustituirla.

## 3. Dirección

| Fuente | Dirección |
| --- | --- |
| Booksy (fragmentos de buscador) | Avenida del Mediterráneo 6, 41940 Tomares |
| Directorio info.peluqueriacanina.com.es (~2 años) | C. Virgen de las Nieves, 1, 41940 Tomares |

**No verificada.** Booksy suele ser más actual (lo mantiene el negocio), pero no
se ha podido abrir la ficha ni contrastarla con Google Maps. Siguiendo el
criterio del encargo, la web dice solo «Tomares, Sevilla». El botón «Cómo
llegar» abre una búsqueda en Google Maps por nombre del negocio, que lleva a
su ficha sea cual sea la dirección actual, y el texto indica que Booksy da la
dirección exacta al reservar.

**Pendiente:** confirmar con el negocio. Si es Av. del Mediterráneo 6, añadirla
en `src/content/site.ts` y cambiar `maps` por la búsqueda de la dirección.

## 4. Teléfono, WhatsApp y horario

- **Teléfono 611 50 05 43**: dado en el encargo y en el directorio. Se usa para
  llamar.
- **WhatsApp**: sin confirmar que el número lo atienda. Desactivado
  (`whatsappEnabled: false`); la demo no muestra WhatsApp.
- **Horario**: Booksy y el directorio coinciden en el patrón (lunes, miércoles
  y viernes por la mañana; martes y jueves por la tarde; fin de semana sin
  horario). El directorio da horas concretas (L-X-V 8:30–16:00; M-J
  14:00–21:30) pero tiene ~2 años: no se publican las horas, solo el patrón, y
  se remite a Booksy para las horas exactas.

## 5. Servicios

**Publicados en la demo (aparecen en su agenda de Booksy):**

- Baño y corte (máquina o tijera), por tamaño de perro.
- Baño y arreglo (higiénico).
- Baño y deslanado.
- Corte de uñas.

**Incluido en los paquetes de baño según Booksy:** baño, secado, cepillado,
vaciado de muda, corte de uñas, limpieza de oídos, rasurado de zona sanitaria.

**Descartados por no verificables:**

| Dato | Motivo |
| --- | --- |
| Stripping | Solo aparece en una página de Booksy de Gines sin atribución clara al negocio. |
| Servicio de cachorro | No aparece en ninguna fuente. |
| Spa / tratamientos | No aparece en ninguna fuente. |
| «Dermocosmética» como servicio | Está en la bio de Instagram, pero no como servicio reservable. No se menciona hasta confirmar qué es exactamente. |
| Gatos | Un directorio dice que atiende gatos. Sin fuente propia. |
| Precios (uñas desde 6 €, baño y deslanado desde 30 €, baño y corte desde 32 €, baño y arreglo 38 €, baño toy desde 18 €) | Orientativos, de fechas distintas y dependientes del manto. No se publican; la web remite a Booksy. |
| Nombres «Ángela» (titular según buscador) y «Javi» (en reseñas) | Sin confirmación de que quieran aparecer. No se nombra a nadie. |
| Número exacto de reseñas | Varía entre páginas; se dice «más de 200 opiniones» (las cifras más recientes son 206 y 209). Revisar al validar. |
| Dirección exacta | Ver punto 3. |

## 6. Reseñas

No se citan textos literales (sin permiso). Se resumen los dos temas que
aparecen en los fragmentos de reseñas: **trato cariñoso** y
**profesionalidad**.

## 7. Textos de la demo que conviene validar con el negocio

Son textos de marca escritos para la demo, razonables para una peluquería
canina pero sin confirmar:

- «A su ritmo… Si necesita una pausa, la tiene.»
- «Si hay muchos nudos, lo sabrás antes de empezar.» / «se habla contigo
  antes» (Booksy sí avisa de que el precio varía por nudos).
- «Una peluquería de barrio, con tiempo para cada perro.»
- Frecuencias orientativas (corte cada 6–8 semanas, deslanado en cada muda):
  conocimiento general de peluquería, presentado como orientación.
- «Tráelo igualmente… a veces un corte más corto es la opción más amable.»
- Lista de razas de ejemplo por tipo de manto.

## 8. Concepto visual — «Pompones»

- **Idea:** el caniche es el único perro cuyo corte clásico está hecho de
  círculos. La marca se construye solo con pompones: el logotipo es un caniche
  geométrico de círculos y barras redondeadas; los marcos de foto son círculos;
  los botones son píldoras; los puntos de color marcan ritmo; un sello circular
  con texto («Peluquería y estética canina · Tomares») hace de firma.
- **Color:** azul noche `#1B2340` (confianza, contraste), crema `#FBF5EC`
  (calidez) y un rosa caniche `#F07C9A` usado con cuentagotas (oreja del logo,
  subrayados de rotulador, puntos, cierre). Rosa claro `#F8C3CF` y bruma
  `#F6E4DF` como apoyos. Nada de rosa chicle ni dorados.
- **Tipografía:** Bricolage Grotesque condensada y muy negra para titulares
  (personalidad, simpatía sin infantilismo) y Figtree para leer.
- **Evitado a propósito:** huellas, huesos, ilustración cartoon, rosa
  dominante, estética de pet shop.
- **Diferencia con otras demos:** nada de negro/tinta de tatuaje (Factoría
  Tattoo) ni del verde/azul clínico de una veterinaria; tampoco el «tocador»
  porcelana + Bodoni de Pura Bellezza.

## 9. Movimiento y criterios de interfaz

Las skills de Emil Kowalski (emil-design-eng, review-animations,
improve-animations, performance-cheatsheet) **no están instaladas en este
entorno**; se han aplicado sus principios a mano:

- Curvas propias (`--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`), nunca
  `ease-in` en entradas; duraciones de interfaz de 160–280 ms.
- Solo se animan `transform` y `opacity` (y `block-size` en el acordeón, con
  mejora progresiva vía `::details-content`).
- Una sola secuencia de entrada (hero escalonado 70 ms); el resto del
  movimiento responde a acciones: botones que ceden a `scale(0.97)`, punto del
  selector que crece, tarjeta de resultado que cambia con desplazamiento corto,
  pompones del logotipo que rebotan al pasar el ratón.
- Hover solo con `(hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion`: todo se desactiva, el sello deja de girar.

## 10. Privacidad de la demo

- `robots.txt` con `Disallow: /`, `<meta name="robots" content="noindex,
  nofollow">` y cabecera `X-Robots-Tag` en todas las rutas.
- Sin analytics, sin píxeles, sin cookies, sin mapas incrustados, sin fuentes
  de terceros en tiempo de ejecución (next/font las autoaloja).
- No crea citas: todos los «Reservar» llevan a la ficha pública de Booksy; los
  «Llamar» a `tel:`.
- Pie con aviso: «Web de demostración. No es la web oficial del negocio…».
- `README_ASSETS.md` bloqueado con 404 por `src/proxy.ts`.

## 11. QA (13/10/2026)

| Prueba | Resultado |
| --- | --- |
| `npm run build` | OK, todo estático (`/`, `/robots.txt`, `/icon.svg`) |
| `npm run lint` | 0 errores, 0 avisos |
| `npm run typecheck` | OK |
| axe-core (WCAG 2.2 AA + buenas prácticas) en escritorio 1440, iPhone 13, Pixel 7 y 375 px con movimiento reducido | 0 violaciones |
| Desbordamiento horizontal a 320/360/375/390/412/1440 px | Ninguno |
| Consola y peticiones fallidas | Sin errores |
| `prefers-reduced-motion` | Animaciones a 0,01 ms, sello sin giro |
| Teclado | Selector «¿Qué le toca?» con flechas; FAQ con Enter/Espacio; enlace «Saltar al contenido» |
| Lighthouse móvil | Rendimiento 97 · Accesibilidad 100 · Buenas prácticas 100 · SEO 63 (por el noindex intencionado) |
| Lighthouse escritorio | 100 · 100 · 100 · SEO 63 (noindex) |
| `README_ASSETS.md` en la URL pública | 404 |

## 12. Qué pedir al negocio

1. Dirección actual confirmada.
2. ¿El 611 50 05 43 atiende WhatsApp?
3. Horas exactas de apertura.
4. Las fotos de `public/assets/el-caniche-rosa/README_ASSETS.md`.
5. Logotipo si existe.
6. Qué entienden por «dermocosmética», si atienden gatos y si hacen stripping.
7. Si quieren que aparezcan nombres o fotos del equipo.
8. Permiso para citar 2–3 reseñas literales de Booksy.
