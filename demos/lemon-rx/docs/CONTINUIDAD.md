# Lemon RX — Continuidad

> Documento vivo de continuidad del proyecto. Se actualiza con decisiones, cambios de estado y funcionalidades confirmadas o desplegadas, distinguiendo siempre entre VALIDADO y PENDIENTE DE VALIDACIÓN.

## 1. Objetivo actual

Lemon RX es la plataforma de programación de CrossFit de Lemon RX. Los administradores crean y publican semanas, gestionan usuarios y consultan su actividad. Los atletas consultan la programación, registran resultados, pesos, tiempos, rondas, reps, notas e historial y participan en rankings.

Además, desde el 15/10/2026 se conserva como dirección estratégica futura convertir Lemon RX en una plataforma comercializable para otras programaciones de CrossFit/CrossTraining, idealmente con personalización de marca. Esta vía NO debe distraer del objetivo inmediato: primero hacerla funcionar durante meses con usuarios reales de Lemon RX, detectar problemas y estabilizarla.

## 2. Regla de trabajo

1. No romper ni sustituir una funcionalidad ya validada sin una razón explícita.
2. Antes de modificar producción, entender el flujo actual y sus dependencias.
3. Hacer cambios pequeños, reversibles y verificables.
4. No considerar una mejora VALIDADA hasta que Jose la pruebe y la confirme.
5. Una mejora puede estar DESPLEGADA/PENDIENTE DE VALIDACIÓN sin considerarse todavía contrato definitivo.
6. Actualizar `CONTINUIDAD.md`, `FUNCIONAL.md` y/o `TECNICO.md` conforme avancemos.
7. No introducir cambios de arquitectura de forma silenciosa.
8. Mantener Lemon RX separado de AvanttAI salvo decisión expresa.
9. Antes de cualquier cambio con riesgo, identificar qué funcionalidades existentes pueden verse afectadas.
10. En Vercel, no cerrar un despliegue como productivo hasta verificar que `lemon-rx.vercel.app` apunta al deployment READY del commit validado.

## 3. Infraestructura y accesos

- Repositorio: `Josanandrade/webs-negocios`
- Aplicación: `demos/lemon-rx`
- Rama productiva: `main`
- Rama documental: `docs/lemon-rx-continuidad`
- Producción web actual: Vercel, alias estable `https://lemon-rx.vercel.app`
- Región Functions Vercel: Dublín (`dub1`)
- Railway project: `terrific-compassion` (se mantiene como fallback temporal)
- Railway service: `Lemon Rx`
- Dominio Railway: `lemon-rx-production.up.railway.app`
- Supabase: conexión `Lemon RX` disponible desde 13/10/2026 y utilizable para verificar/gestionar el proyecto real.
- GitHub: acceso disponible.
- Railway: acceso disponible.
- Resend: integración existente en la aplicación.

La mención antigua de que Supabase Lemon RX no era accesible queda superada.

## 4. Línea base funcional existente

### Acceso y usuarios
- Registro con email y contraseña.
- Confirmación de email mediante Supabase Auth cuando aplica.
- Recuperación/cambio de contraseña.
- Roles `admin` y `athlete`.
- Nuevos usuarios entran pendientes de aprobación/acceso y pago.
- El admin gestiona rol, acceso y pago.
- Invitaciones por email integradas manteniendo aprobación manual del usuario.
- Sexo Hombre/Mujer validado; no inferir sexo por nombre.
- Los admins pueden aparecer también como atletas en el panel de evolución; esta opción queda activada por defecto y cada admin puede desactivarla individualmente.

### Programación
- Semanas en borrador/publicadas.
- Editor por días y bloques.
- Solo admin crea, edita, publica o elimina programación.
- Atletas solo leen programación a la que tienen acceso.
- Navegación entre semanas.
- IDs de bloques preservados al editar para no romper actividad, resultados ni historial.
- Constructor unificado de Strength/Weightlifting validado, incluyendo bloques libres, series, reps, porcentajes, Complex y EMOM.

### Seguimiento y resultados
- Marcar bloque como hecho.
- Notas por bloque.
- Resultados por tiempo, rondas+reps, reps/calorías, peso y cargas estructuradas.
- RX e Intermedio cuando corresponde.
- Historial individual.
- Strength/Weightlifting con porcentajes sobre RM, RM 1–5, cálculo de kilos, Complex y volumen total.
- En Strength/Weightlifting cada movimiento puede configurarse para registrar `Kilos` o `Hecho`, pudiendo coexistir ambos modos dentro del mismo bloque.
- En historial no deben mostrarse códigos JSON/técnicos; los resultados de fuerza se traducen a texto humano.

### Ranking
- Ranking por bloque.
- Empates comparten posición.
- Datos expuestos mediante flujo controlado de ranking, no abriendo directamente los resultados privados.
- Ranking de Strength/Weightlifting implementado como ranking único, ordenado por mayor carga, sin RX/Intermedio.
- Rankings competitivos separados por sexo cuando corresponde.
- En vistas donde hay clasificación general diaria, el orden se recalcula por resultado y mantiene separación RX/Intermedio.
- Desde Fase 3, el Ranking principal carga únicamente el día visible y Semana solicita clasificaciones solo al abrir el día correspondiente.

### Evolución
- Historial contextual de movimientos validado: desde Strength/Weightlifting se pueden consultar los últimos 3 entrenamientos previos del mismo movimiento.
- Motor de evolución validado para 4/8/12 semanas.
- Cumplimiento calculado solo con bloques programados hasta HOY; los días futuros no penalizan.
- WOD: posición media visible como `posición/participantes` usando WODs comparables y misma división.
- Fuerza: sesiones realizadas/programadas y volumen total.
- Histórico de RM guardado desde la implantación del motor; no inventar histórico anterior que no existía.
- Atleta: `Cuenta → Mi evolución`.
- Coach/admin: panel principal con evolución de atletas y acceso a usuarios con menor cumplimiento.

### Comunicaciones
- Email al publicar una semana por primera vez mediante Resend si está configurado.
- Evita duplicados al despublicar/republicar.
- Web Push a administradores por nuevos registros si lo activan.

## 5. Bloques validados y protegidos

### 13–16/10/2026 — Strength / Weightlifting
Estado: **VALIDADO**.

- Catálogo compartido de movimientos.
- Elegibilidad independiente para RM.
- Constructor unificado para Strength/Weightlifting.
- Series/reps estructuradas y porcentajes sobre 1RM.
- RM entre 1 y 5.
- Cálculo de kilos según RM/porcentaje.
- Complex y EMOM.
- A.1/A.2/A.3… y bloques accesorios.
- Registro por series/rondas y cálculo de volumen total.
- Ranking por carga total.
- Compatibilidad con programación/resultados antiguos.

### 13–16/10/2026 — Sexo y rankings
Estado: **VALIDADO**.

- Registro obliga a indicar Hombre o Mujer.
- Admin puede editarlo.
- No inferir sexo por nombre.
- Ranking permite General / Masculina / Femenina.
- La clasificación diaria general mantiene el orden real del resultado.

### 13–16/10/2026 — Peso por ronda y total de kilos
Estado: **VALIDADO**.

- El atleta registra los pesos reales por ronda/serie.
- El sistema calcula el total de kilos movidos.
- El ranking utiliza el total cuando corresponde.
- Los datos previos se han preservado.

### 13/10/2026 — Invitaciones
Estado: **VALIDADO / ONLINE**.

- Invitación por email añadida.
- La invitación no elimina la revisión/aprobación manual del alta por parte del admin.

### 16/10/2026 — Historial contextual de movimientos
Estado: **VALIDADO**.

- `Ver historial` dentro de Strength/Weightlifting.
- Últimos 3 entrenamientos anteriores completados del mismo movimiento.
- Compatible con bloques antiguos y constructor unificado.
- Relación por movimiento, no por texto visible.
- No reescribe resultados antiguos.

### 16/10/2026 — Motor y pantallas de evolución
Estado: **VALIDADO**.

- Periodos 4/8/12 semanas.
- Cumplimiento en tiempo real hasta hoy.
- Posición WOD media por atleta, mostrada como `5/14` o equivalente.
- Fuerza mostrada como `realizadas/programadas` y volumen total.
- Histórico de RM a partir del momento en que se implantó.
- `Mi evolución` en Cuenta.
- Panel coach/admin con cumplimiento medio, atletas que mejoran y listado de menor cumplimiento.
- Los admins aparecen como atletas por defecto; pueden desactivarlo individualmente en Ajustes.

### 16/10/2026 — Rendimiento Fase 1
Estado: **VALIDADO**.

- Ranking General/Masculina/Femenina filtrado localmente sin nueva navegación al servidor.
- Menos precargas automáticas innecesarias en navegación, periodos y fichas.
- Semana monta los bloques de cada día solo al abrirlo por primera vez; después mantiene el contenido montado.
- Panel y Cuenta muestran el contenido principal antes de esperar a Evolución.
- Ampliación validada de navegación en frío: al entrar en Lemon RX se preparan de forma secuencial en segundo plano las rutas principales, priorizando Semana y Usuarios, evitando disparar muchas peticiones simultáneas.
- Semana difiere también la descarga del código pesado de trackers, historial y ranking de fuerza hasta que se abre un día por primera vez.
- La causa observada de la lentitud inicial no era el volumen actual de datos, sino el coste ocasional de la primera comunicación Railway → Supabase; las consultas SQL internas eran rápidas.
- Resultado validado por Jose: la navegación inicial se percibe mucho más fluida.
- No se tocaron Supabase, resultados, notas, programación, IDs de bloques ni `save_week_content`.

### 21/10/2026 — UX móvil, Panel, Home social y notificaciones
Estado: **VALIDADO**.

- Corregido el scroll excesivo de Semana: al cerrar un día se desmonta el contenido pesado y la página recupera su altura real.
- Panel Admin aligerado: primera vista centrada en KPI; `Seguimiento` queda plegado y carga sus datos solo al abrirlo.
- Seguimiento permite `Semana en curso`, `4 semanas`, `8 semanas` y `12 semanas`.
- `Usuarios` sale de la navegación principal Admin y queda dentro de `Ajustes`, conservando invitación, búsqueda, filtros y ficha.
- Home social automático: máximo un post por atleta y día; los bloques posteriores actualizan el mismo post.
- Cada post muestra resultados, kilos y notas; cada bloque permite desplegar la programación original del día mediante `Ver entrenamiento`.
- Reacciones validadas: 👍 ❤️ 🔥 💪 👏 😂 🍆 🍑 💦 🔩 🦍 🍼 🛴 😍.
- Comentarios, respuestas y reacciones a comentarios validados.
- Campana de notificaciones para todos los roles, con contador de no leídas y centro persistente.
- Se notifican reacciones a entrenamientos, comentarios, respuestas y reacciones a comentarios; no se generan avisos por acciones propias.
- Web Push generalizado a usuarios activos que concedan permiso.
- Se creó un aviso interno de activación para las 13 cuentas existentes en el momento de la implantación.
- El botón `CREAR` de Admin vuelve a estar centrado físicamente en móvil.
- Atletas entran por defecto en `Home`; el logo Lemon RX y la PWA también usan Home como inicio.
- Navegación del atleta en móvil queda fija abajo; en escritorio se conserva navegación superior.
- Jose confirma el 21/10/2026 que todo este bloque está validado.

### 22/10/2026 — Vercel, Rendimiento Fase 2, fuerza mixta y social visible
Estado: **VALIDADO / ONLINE**.

- Producción principal de Lemon RX pasa a Vercel con URL estable `https://lemon-rx.vercel.app`; Railway se conserva temporalmente como fallback.
- Vercel ejecuta Functions en Dublín (`dub1`) y Node 22.
- Rendimiento Fase 2 validado en uso real: se eliminan warm-up global y prefetch móvil duplicado; Home queda paginado a 15 publicaciones por página.
- Strength/Weightlifting: cada movimiento puede configurarse individualmente como `Kilos` o `Hecho`.
- Un mismo bloque puede mezclar ambos tipos, por ejemplo Front Squat con kilos y Air Cossack Squat marcado como hecho.
- Resultados históricos siguen siendo compatibles y no se cambian IDs de bloques.
- Home mantiene todos los emojis visibles por defecto.
- Debajo de las reacciones se muestra el total y, por emoji, el número de reacciones y quién reaccionó.
- Comentarios: el hilo más reciente queda visible por defecto; los anteriores se pueden desplegar y la sección completa se puede minimizar.
- Para mostrar nombres de autores de reacciones sin abrir `profiles`, se usa una RPC limitada que solo devuelve nombres de usuarios que realmente tienen reacciones sociales y solo a usuarios activos autenticados.
- Jose valida expresamente este bloque el 22/10/2026.

### 23/10/2026 — Rendimiento Fase 3
Estado: **VALIDADO / ONLINE**.

- Se crea `day_leaderboard_v2` para obtener únicamente el leaderboard del día visible.
- Ranking principal deja de cargar la semana completa.
- Paridad comprobada con datos reales: 21 filas antiguas frente a 21 nuevas y 0 diferencias en posiciones/resultados.
- Esta semana de referencia tenía 120 resultados puntuables totales frente a 21–39 por día; el ahorro evita traer entre 3× y casi 6× más filas de las necesarias según el día.
- Semana ya no descarga un leaderboard global al entrar: solo carga la clasificación del día cuando el usuario abre un día con bloques puntuables.
- Una clasificación diaria ya cargada se reutiliza durante esa visita.
- Home deja de invalidar todo el layout privado después de reaccionar o comentar; solo revalida `/home`.
- No se cambian reglas de ranking, empates, divisiones, sexo, pesos, `total_load`, programación, IDs de bloque ni históricos.
- Preview validada por Jose; PR #40 fusionado a `main` en commit `ba9e97e9bb013d8df67dc2081dcf215da48b3df6`.
- Deployment productivo Vercel READY y `lemon-rx.vercel.app` verificado explícitamente contra ese deployment.

## 6. Estrategia comercial futura — HIPÓTESIS, NO PRODUCTO ACTUAL

Fecha: 15/10/2026.

### Dirección
Cuando Lemon RX esté rodada y probada con usuarios reales, estudiar su comercialización como plataforma para otras programaciones de CrossFit/CrossTraining.

Posicionamiento planteado:
- la empresa de programación mantiene su conocimiento deportivo y su marca;
- Lemon RX aporta la infraestructura tecnológica;
- posible evolución white-label con logo, colores y dominio/subdominio del cliente;
- no competir como software generalista de gestión de gimnasios salvo decisión futura.

### Hipótesis de precio acordada para estudiar al salir al mercado

- **35 €/mes hasta 70 atletas activos incluidos.**
- **A partir del atleta 71: +0,50 €/mes por atleta activo adicional.**
- Coaches y administradores no deberían computar como atletas de pago.
- El criterio debe ser atleta activo, no cuentas históricas registradas.

Equivalencia conceptual:
- 70 atletas = 35 €/mes.
- 100 atletas = 50 €/mes.
- 200 atletas = 100 €/mes.
- 500 atletas = 250 €/mes.
- 1.000 atletas = 500 €/mes.

Argumento comercial de referencia:
- si una programación tiene 200 atletas y cobra solo 10 €/mes por atleta, factura 2.000 €/mes;
- Lemon RX costaría 100 €/mes;
- el software representaría un 5% de esa facturación;
- la idea es que el coste tecnológico escale al mismo ritmo que el negocio del cliente.

Mensaje comercial potencial:
> Desde 0,50 € por atleta activo al mes, con una cuota mínima de 35 €.

Todavía NO es una tarifa publicada ni una decisión irreversible. Debe validarse más adelante con costes reales de infraestructura, soporte, facturación y uso.

## 7. Consideraciones para una futura versión multi-programación

No desarrollar todavía salvo necesidad real, pero evitar decisiones que hagan imposible evolucionar hacia:

Programación/cliente → boxes → atletas.

Esto permitiría en el futuro:
- ranking global de la programación;
- ranking por box;
- ranking general / masculino / femenino;
- varios programas o niveles;
- branding por cliente;
- administración de coaches y atletas por organización.

## 8. Riesgos técnicos abiertos

- Riesgo crítico histórico: `save_week_content` puede eliminar bloques ausentes y las FK de logs/resultados usan `ON DELETE CASCADE`; por tanto, preservar IDs de bloques es obligatorio y no se debe sustituir el RPC sin migración segura.
- Errores puntuales `refresh_token_already_used` a investigar si se reproducen.
- Vulnerabilidades high reportadas por npm: analizar individualmente; no usar `npm audit fix --force` a ciegas.
- Pruebas RLS todavía mejorables/automatizables.
- Pendiente completar en Vercel la migración segura de secretos/servicios de email y Push antes de retirar Railway definitivamente.
- Advisors siguen mostrando FK secundarias sin índice; revisar selectivamente con métricas, no añadir índices indiscriminadamente.

## 9. Método de validación

Para cada mejora:

**PROPUESTO** → se define comportamiento, impacto y riesgos.

**DESPLEGADO / PENDIENTE DE VALIDACIÓN** → build correcto y funcionalidad disponible para probar.

**VALIDADO** → Jose confirma que funciona como se espera; pasa a contrato protegido.

**REVERTIDO** → se documenta motivo y retorno.

## 10. Prioridad actual

La prioridad NO es vender Lemon RX todavía.

Orden:
1. utilizarla con Fran y atletas reales;
2. publicar programación real de forma continuada;
3. registrar tiempos, kilos, rondas, reps y cargas;
4. validar rankings, historial y evolución con uso real;
5. seguir reduciendo fricciones de navegación/guardado;
6. estabilizar el producto;
7. solo entonces preparar la salida comercial a otras programaciones.

### Siguiente bloque técnico propuesto

Tras validar Rendimiento Fase 3, los siguientes candidatos son: comentarios sociales bajo demanda para aligerar Home, cache selectiva de datos compartidos no sensibles, reducir lecturas de catálogos a los IDs realmente necesarios y pruebas de carga 25/50/100 usuarios concurrentes. Revisar también `coach_evolution_metrics` antes de escalar a cientos de atletas. No tocar `save_week_content` ni los IDs de bloques.

## 11. Diagnóstico de escalabilidad — 21/10/2026

Estado: **DIAGNÓSTICO CONFIRMADO / FASE 3 VALIDADA 23/10/2026**.

- Volumen real en el momento del análisis inicial: 13 perfiles, 66 bloques, ~280 logs, ~147 resultados y ~78 posts; no había volumen suficiente para justificar esperas de varios segundos.
- Railway no estaba cerca de saturación: CPU y RAM observadas muy por debajo de capacidad.
- PostgreSQL ejecutaba la mayoría de consultas relevantes en milisegundos.
- Las esperas largas aparecían principalmente en la cadena de peticiones dinámicas Railway → Supabase/gateway/auth, especialmente cuando se lanzaban varias rutas en paralelo.
- Se observaron peticiones móviles duplicadas por combinación de prefetch en `touchstart` + navegación real y precarga secuencial automática de múltiples rutas.
- Fase 2 eliminó esas precargas móviles/globales, paginó Home y llevó producción a Node 22/Vercel Dublín.
- Fase 3 reduce payload y cálculo innecesario en Ranking/Semana y evita invalidación global de layout tras interacción social.
- En la semana usada para validar Fase 3 había 120 resultados puntuables totales y solo 21–39 por día, confirmando el beneficio de lectura diaria.
- Objetivo comercial: 500+ usuarios registrados/activos sigue requiriendo prueba de carga por concurrencia real antes de vender a escala.