# Cristina García Peluquería & Estética · Investigación interna

> Documento interno. No se despliega: está fuera de `public/` y `src/app/`, y `scripts/postbuild.mjs` falla si se cuela texto de este tipo en la exportación.

Fecha de la investigación: 14/10/2026. Demo no solicitada por el negocio (campaña de prospección).

## 1. Presencia digital actual

| Canal | Estado | Fuente |
|---|---|---|
| Web propia | **No existe.** El enlace «web» de su ficha de Google apunta a Booksy (`booksy.com/es-es/dl/show-business/124211`, según la ficha no afiliada de Fresha que replica Google). Probados `cristinagarciapeluqueria.com/.es`, `cristinagarciapeluqueriaestetica.com`, `cristinagpeluqueriaestetica.com`, `cristinagpeluqueria.com`, `cristinagarcia.es`: no se pudieron resolver desde el entorno (sin pruebas de que existan). Ninguna búsqueda devuelve dominio propio. | Búsquedas web, directorios |
| Booksy | Ficha muy completa: unos 160 servicios en 14 categorías, 5 profesionales, 4,9 sobre 378 reseñas, +77 fotos. Es su canal real de reserva. | booksy.com/es-es/124211_… |
| Google Business | Existe (4,8). Los directorios que la copian dan 92 o 74 reseñas: dato inconsistente, no se usa. | bellecenter.es, lolaylluch.es |
| Instagram | @cristinagpeluqueriaestetica (enlazado desde Booksy). No se pudo abrir: bloqueado (robots). | Booksy |
| Facebook | facebook.com/Cristinagpeluqueriaestetica (enlazado desde Booksy). Bloqueado. | Booksy |
| TikTok | No se encontró nada. | Búsqueda |
| Bodas.net | Ficha «Cristina García» (e68455), misma dirección: 5,0 con 4 opiniones (2018–2019), novias, invitadas, domicilio, «equipo de 5 personas», «más de 18 años». | bodas.net |
| Fresha | Ficha no afiliada (generada desde Google), sin reservas. | fresha.com |
| Yelp | Ficha antigua «Peluquería Cristina García», con dirección en Calle Larga. Bloqueado (robots). Posible ubicación anterior: no se usa. | Búsqueda |

**Conclusión: no hay web corporativa propia. Depende de Booksy y redes → se continúa.**

## 2. Datos verificados

- Nombre comercial: Cristina García Peluquería & Estética. Titular en Booksy: Cristina García Lorenzo.
- Dirección: Avenida del Aljarafe, 1, 41110 Bollullos de la Mitación (Sevilla). Booksy, Google y Bodas.net coinciden.
- Teléfono: 954 49 15 88 (fijo). Coincide en tres directorios que copian Google.
- Horario: martes a viernes 10:00–14:00 y 15:00–19:00; sábado 9:00–13:00; domingo y lunes cerrado. Dos directorios y Booksy («hoy» miércoles 10–14 y 15–19) coinciden; un tercer directorio omite las tardes.
- Reseñas Booksy: 4,9 / 378 (367·7·1·1·2 por estrellas).
- Equipo (Booksy): Cristina García, Mercedes, Jennifer, María José, Arantxa. Sin cargos publicados.
- Descripción propia (Booksy): «Nuestro centro está formado por un gran equipo de profesionales donde nos avalan más de 18 años de experiencia».
- Comodidades (Booksy): aparcamiento, tarjeta, accesible, adaptado a niños, wifi, programa de fidelidad.
- Solo con cita previa; política de depósito enlazada en Booksy (sin detalle). Rayos UVA sin cita.

## 3. Servicios verificados (categorías Booksy y nº de servicios)

Mechas y balayage (17), Color (10), Corte (11), Peinados (9), Tratamiento capilar (12), Eventos especiales (8), Manos y pies (13), Pestañas y cejas (7), Tratamientos faciales (26), Tratamientos corporales (5), Depilación láser (11 + 9 + 5), Cera (20), Rayos UVA (2), Extensiones de cabello (2).

Lo más reservado según Booksy: Corte mujer, Cejas señora, Cejas y labio.

Marcas citadas por el propio centro: Montibello, ARÛDE, Dermapen, Eclat, Decode Zero / HOP, Reset rituals.

**Lectura comercial:** es un salón integral, no una peluquería pura. Lo más fuerte por volumen y ticket: color y mechas, faciales (la carta más amplia), depilación láser por zonas y novias (pack de 300 €, presencia en Bodas.net). La reputación (378 reseñas, 97 % de cinco estrellas) es el mejor argumento y va en portada.

## 4. Decisiones de contenido

- Carta agrupada en 8 áreas (no en las 14 de Booksy): Corte y peinado (incluye capilar y extensiones), Color y mechas, Novias y eventos, Cejas y pestañas, Manos y pies, Faciales, Corporal y bronceado (incluye UVA), Depilación láser y cera.
- En faciales y cera solo se muestran los servicios que Booksy dejó visibles; se remite al resto en la agenda.
- Variantes de uñas (1 color, francesa, deco) y dos precios de color extra largo ambiguos: descartados.
- Citas de reseñas: solo dos frases cortas literales (Artacho, Mercedes).

## 5. Datos descartados

- WhatsApp: no hay número verificado. El fijo no sirve para WhatsApp. No se muestra botón de WhatsApp.
- Recuento de reseñas de Google (92 vs 74 según directorio).
- Roles del equipo (solo se indica que Cristina García está al frente, por ser la titular).
- Dirección de Calle Larga (Yelp, probablemente antigua).
- Precio de Bodas.net «desde 50 € hasta 280 €» (desfasado frente a Booksy).
- Ficha homónima de Bodas.net en Padrón (A Coruña): otro negocio.
- Servicios a domicilio de novia completa: Booksy solo lista domicilio para invitadas.

## 6. Fotografía

No se ha podido descargar ninguna foto: el entorno bloquea el CDN de Booksy (cloudfront), Instagram, Facebook y Google. Existen en Booksy foto principal, logo, 5 trabajos, 3 fotos de clientes, portafolio por servicio y una foto por profesional. Ver `public/assets/cristina-garcia-peluqueria-estetica/README_ASSETS.md`.

## 7. Bloqueos del entorno

Bloqueados: booksy.com y su CDN por curl (WebFetch sí leyó Booksy), Instagram, Facebook, Yelp, Google Maps, *.railway.app.
