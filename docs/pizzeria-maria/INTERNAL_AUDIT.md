# Pizzería María · Auditoría interna (no se despliega)

Fecha: 2026-11-23. Estado: cliente cerrado, entrega prevista hoy.

## Dónde está la web

- Código: `demos/pizzeria-maria/` (HTML estático + `menu-data.js` + `menu.js`). Se sirve en Vercel desde la raíz del repo en `/demos/pizzeria-maria/`.
- Carta original exportada de Selfibar (https://www.selfibar.com/digital-menu/pizzeria-maria/menu, importada el 2026-11-18): `docs/pizzeria-maria/carta-source.tsv`. `menu-data.js` se genera limpiando ese TSV (nombres, tildes, erratas).

## Datos verificados del negocio

| Dato | Web | Fuentes públicas | Estado |
|---|---|---|---|
| Dirección | C. el Campo de la Verdad, 3 · 41020 Sevilla | Igual (GastroRanking, Wanderlog) | OK |
| Teléfono | 954 40 46 08 | Igual | OK |
| Horario L-V | 20:00–23:40 | Google: 20:00–00:00 | Confirmar con el cliente (¿23:40 es el último pedido?) |
| Horario S-D | 13:30–15:40 · 20:00–23:40 | Google: 13:30–16:00 · 20:00–00:00 | Confirmar |
| Web actual | — | GastroRanking enlaza https://pizzeriamariasevilla.com/ | Preguntar: ¿dominio propio que hay que reutilizar? |
| Instagram | @pizzeria_maria | No aparece en fichas | Confirmar que es su cuenta |
| A domicilio / para llevar | Sí | Reseñas lo mencionan | OK |
| Terraza | Sí | Sin confirmar | Confirmar |
| "Junto al Hotel Vértice" | Sí | Sin confirmar | Confirmar referencia |
| Valoración | — | Google 4,5 (≈730 reseñas) | Posible sección de reseñas |

## Errores encontrados (antes de esta revisión)

1. `noindex,nofollow,noarchive`: Google no habría indexado la web del cliente.
2. Foto principal enlazada desde ABC Gurmé (`ditaly2…`): foto de prensa de otro restaurante, con derechos. Retirada.
3. Foto de interior enlazada desde RestaurantGuru: derechos de terceros y hotlink. Retirada.
4. Carta con erratas y formato de TPV: "MAGHERITA", "CHAMPIOÑES", "HUEVO GRUDO", "ZUMA", "SOPRESA", "VEGETARIA", "DIABOLA", "GNOCCI", "RIGATONNI", "4 QUESO", numeración interna (26 repetido), sufijos "G", comas sin espacio, "d.o", todo en mayúsculas.
5. 10 productos sin precio mostrados como «No disponible».
6. Sin meta description, Open Graph, favicon ni datos estructurados.
7. Animaciones `.reveal` ocultaban el contenido si JavaScript fallaba.
8. En móvil, el hero tenía un hueco vacío de ~130 px (min-height de escritorio).
9. Sello «+20 sabores» cuando hay 41 pizzas en carta.
10. Imágenes sin `width/height` ni `loading="lazy"` (CLS y peso); `target="_blank"` sin `rel="noopener"`.
11. Sin aviso de alérgenos (Reglamento UE 1169/2011 exige poder informar antes de la compra).
12. Footer sin dirección ni teléfono.
13. El TSV de origen se publicaba junto a la web.

## Corregido en esta revisión

Todo lo anterior salvo lo que depende del cliente. Productos sin precio ocultos (no se inventan precios). Suplemento «Crema de Módena» descrito como suplemento de ensalada. Los sufijos "G" de las pizzas Burrata, Cabramelizada, Jack Daniel's y Piamontesa se han quitado: confirmar qué significan.

## Pendiente (decide Jose / necesita al cliente)

Alta prioridad para hoy:
- Confirmar horario, terraza, Instagram, referencia del Hotel Vértice.
- Fotos reales del local y de sus pizzas (ahora son de Unsplash, libres de uso). Verificar en la preview que la foto principal nueva (Unsplash 1513104890138) carga.
- Aviso legal, política de privacidad y cookies: hace falta razón social, NIF y dirección fiscal del titular (LSSI). No se han creado páginas vacías.
- Dominio: ¿reutilizar pizzeriamariasevilla.com? Mover a repo/proyecto propio `client-pizzeria-maria-web` según el README.
- Precios de: Coca-Cola Light, zumos de melocotón y piña, ensaladas Primavera, Tropical, Rita, Vegetariana, Tortellini, Cannelloni, Gnocchi.

Mejoras propuestas (después de la entrega):
- Autoalojar Google Fonts (RGPD) y servir imágenes propias en WebP.
- Sección de reseñas con la valoración de Google.
- Tabla de alérgenos por plato.
- Enlace directo a pedido online (si usan Selfibar u otra plataforma) y botón de WhatsApp.
- Menú móvil con enlaces a Carta y Visítanos.
- Mapa embebido con consentimiento.
