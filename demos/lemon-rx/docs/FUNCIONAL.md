# Lemon RX — Funcional

> Documento vivo de comportamiento funcional. Describe qué puede hacer cada tipo de usuario y qué reglas de negocio están vigentes. Se distingue entre funcionalidad validada y funcionalidad desplegada pendiente de validación.

## 1. Propósito

Lemon RX permite publicar y consumir programación semanal de CrossFit de forma privada, controlando acceso, pagos, actividad, resultados, rankings, historial y evolución del atleta.

Usuarios principales:
- Administrador/coach.
- Atleta.

Un administrador también puede participar como atleta en la evolución si tiene activada esa opción.

## 2. Registro y acceso

### Registro

El usuario introduce:
- nombre;
- email;
- contraseña de mínimo 8 caracteres;
- sexo: **Hombre o Mujer**.

Comportamiento:
- se crea usuario en Supabase Auth;
- se crea perfil;
- entra como `athlete`;
- queda pendiente de acceso/aprobación según el flujo vigente;
- si la confirmación de email está activa, debe confirmar antes de iniciar sesión;
- los admins pueden recibir Web Push por nuevo registro;
- el usuario puede llegar también mediante invitación por email, sin eliminar la aprobación manual del admin.

Estado del campo sexo: **VALIDADO**.

Regla: nunca inferir sexo por nombre.

### Login y recuperación

- email + contraseña;
- tratamiento neutro de errores sensibles;
- recuperación por email;
- nueva contraseña mediante callback;
- si ya existe sesión, `/login` y `/registro` redirigen a la app.

## 3. Acceso a programación

Un atleta puede ver programación publicada solo si cumple las reglas de acceso y pago configuradas.

Estados actuales:
- `pending`;
- `active`;
- `blocked`.

Pago:
- `paid`;
- `pending`.

El admin puede ver también borradores.

## 4. Programación semanal — Admin

El admin puede:
- ver semana actual;
- crear/editar semana;
- guardar borrador;
- publicar/despublicar;
- borrar cuando corresponda;
- crear días y bloques;
- ordenar bloques;
- elegir tipo de resultado/seguimiento.

Reglas protegidas:
- semana única por fecha de inicio;
- preservar IDs de bloques al editar;
- no romper resultados, logs ni historial existentes.

## 5. Strength / Weightlifting

Estado: **VALIDADO 22/10/2026**.

Incluye:
- catálogo de movimientos;
- movimientos programables que pueden quedar fuera de RM mediante elegibilidad independiente;
- constructor unificado de Strength/Weightlifting;
- series y reps estructuradas;
- porcentajes sobre RM;
- RM entre 1 y 5;
- cálculo orientativo de kilos por porcentaje;
- Complex;
- EMOM;
- bloques A.1/A.2/A.3…;
- accesorios;
- registro real de pesos por serie/ronda;
- volumen total movido;
- ranking por carga total;
- compatibilidad con bloques antiguos.

### Registro por movimiento — Kilos / Hecho

Estado: **VALIDADO 22/10/2026**.

Al crear o editar un bloque de Strength/Weightlifting, cada movimiento puede definir cómo registrará el atleta su ejecución:
- **Kilos**: el atleta introduce los kilos usados en las series/rondas correspondientes.
- **Hecho**: el atleta marca el movimiento como realizado sin informar peso.

Ambos modos pueden coexistir dentro del mismo bloque. Ejemplo validado:
- Front Squat → Kilos.
- Air Cossack Squat → Hecho.

Reglas:
- no obligar a informar kilos en movimientos que no los necesitan;
- los movimientos con Kilos siguen alimentando volumen/carga cuando corresponda;
- marcar un accesorio como Hecho no debe alterar artificialmente el ranking de carga;
- resultados históricos siguen siendo compatibles.

Regla de producto:
**La app informa. El coach decide.**

No introducir escalado, readiness, pacing, estrategia o decisiones automáticas que sustituyan al coach/programador.

## 6. Tipos de resultado

### Sin resultado — `none`
Hecho + nota, sin ranking.

### Tiempo — `time`
- tiempo;
- time cap;
- reps si llega al cap.

Ranking:
- menor tiempo gana entre finalizados;
- en cap, mayor número de reps;
- empates comparten posición.

### AMRAP — `rounds_reps`
- rondas;
- reps;
- mayor resultado gana.

### Reps/calorías — `reps`
- mayor resultado gana.

### Peso competitivo — `weight`

Estado: **VALIDADO**.

- el atleta informa pesos de las rondas/series que correspondan;
- el sistema calcula el total de kilos movidos;
- el ranking usa ese total cuando el bloque se define con este criterio;
- los datos anteriores se preservan.

### Intervalos / EMOM — `intervals`
- RX o Intermedio cuando aplica;
- puede indicar si mantuvo la programación completa;
- si adapta, puede detallar reps por ronda.

## 7. Vista del atleta

El atleta con acceso puede:
- ver programación publicada;
- navegar por semanas permitidas;
- abrir bloques;
- marcar hecho;
- guardar nota;
- guardar resultado;
- ver ranking cuando corresponda;
- consultar historial;
- consultar su evolución en `Cuenta → Mi evolución`.

### Navegación de Semana

Estado: **VALIDADO 24/10/2026**.

- los siete días pueden permanecer cerrados;
- en móvil, con todos cerrados, se conserva el comportamiento de scroll ya validado;
- al abrir un día se posiciona correctamente bajo la cabecera;
- los bloques de un día se preparan al abrirlo por primera vez;
- al cerrar un día, el contenido pesado se desmonta para evitar que la página conserve una altura/scroll excesivo;
- los componentes pesados de registro de resultados, Strength/Weightlifting, historial contextual y ranking de fuerza se cargan cuando hacen falta, no como coste obligatorio al entrar en Semana;
- desde Rendimiento Fase 3, entrar en Semana no descarga la clasificación completa de la semana;
- al abrir un día con bloques puntuables se carga únicamente el leaderboard de ese día;
- si ese día se cierra y vuelve a abrirse durante la misma visita, la clasificación ya cargada se reutiliza;
- desde Rendimiento Fase 4, Semana solo carga los movimientos realmente utilizados en la semana visible, no el catálogo completo.

## 8. Actividad, notas y resultados

- Cada atleta modifica su propia actividad.
- Notas privadas para atleta + admins.
- Guardar resultado marca el bloque como hecho.
- El backend determina el tipo real del bloque.
- No se permite que un atleta altere arbitrariamente el tipo de resultado.

## 9. Ranking

Ruta principal: `/ranking`.

Reglas validadas:
- ranking por bloque;
- RX e Intermedio separados cuando corresponde;
- empates comparten posición;
- resultados privados no se abren directamente a otros atletas;
- General / Masculina / Femenina;
- Strength/Weightlifting usa ranking único por carga cuando no aplica RX/Intermedio;
- en la vista detallada se puede pulsar un atleta para ver su sesión completa, incluidos resultados y notas visibles dentro de este contexto;
- desde Rendimiento Fase 3, solo se descargan los resultados puntuables del día visible, manteniendo exactamente las mismas posiciones, empates, divisiones y cargas que antes;
- desde Rendimiento Fase 4, solo se cargan los movimientos que intervienen en los bloques del día visible.

### Navegación de filtros

Estado: **VALIDADO 16/10/2026**.

General / Masculina / Femenina se cambian de forma inmediata con los datos ya cargados, sin una nueva navegación completa al servidor.

## 10. Historial

### Atleta
Debe incluir bloques donde haya:
- marcado hecho;
- nota;
- resultado/carga.

### Admin
Puede consultar el historial completo del atleta desde su ficha.

### Presentación de fuerza
Estado: **VALIDADO**.

Los bloques Strength/Weightlifting no deben mostrar códigos JSON/técnicos. Los resultados estructurados se traducen a información humana: sección, movimiento, pesos, movimientos marcados como hechos y volumen cuando corresponda.

## 11. Historial contextual de movimiento

Estado: **VALIDADO 16/10/2026**.

En bloques Strength/Weightlifting aparece **Ver historial**.

Comportamiento:
- detecta movimientos del bloque;
- permite cambiar entre ellos si hay varios;
- muestra los últimos 3 entrenamientos anteriores completados del mismo movimiento;
- si existen solo 1 o 2, muestra los disponibles;
- si no hay ninguno: `Aún no has registrado ningún bloque de este movimiento.`;
- excluye el entrenamiento actual;
- puede mostrar fecha, prescripción recuperable, pesos reales, volumen y nota;
- funciona con bloques antiguos y con el constructor unificado.

## 12. Mi evolución — atleta

Estado: **VALIDADO**.

Ubicación:
- `Cuenta → Mi evolución`.

Periodos:
- 4 semanas;
- 8 semanas;
- 12 semanas.

Métricas principales:
- cumplimiento hasta HOY;
- posición WOD media como `posición/participantes`;
- volumen y sesiones de fuerza;
- evolución de RM desde que existe histórico;
- comparación con periodo anterior cuando hay datos suficientes.

## 13. Evolución — coach/admin

Estado: **VALIDADO**.

Ubicación:
- panel principal del Admin.

El Panel carga primero la información esencial y deja **Seguimiento** plegado por defecto. Los datos de seguimiento se solicitan cuando el admin abre ese bloque.

Ventanas disponibles:
- Semana en curso;
- 4 semanas;
- 8 semanas;
- 12 semanas.

Dentro de Cumplimiento medio existe acceso a usuarios con bloques pendientes, ordenados de menor a mayor cumplimiento.

## 14. Admin como atleta

Estado: **VALIDADO**.

- Un admin puede tener también evolución deportiva.
- Ajuste individual: **Mostrar mi evolución como atleta**.
- Para admins, el valor por defecto vigente es **activado**.
- Desactivarlo no cambia ni limita su rol administrativo.

## 15. Cuenta y perfil

El atleta gestiona únicamente los datos permitidos.

Reglas protegidas:
- no puede cambiarse el rol;
- no puede marcarse pagado;
- no puede activar su propio acceso.

El admin puede editar el sexo Hombre/Mujer del usuario desde su perfil.

## 16. Panel Admin

Estado de la carga principal: **VALIDADO 21/10/2026**.

Primera vista:
- semana actual;
- estado;
- KPI de atletas/accesos/pagos;
- accesos rápidos.

`Seguimiento` es plegable y no debe cargar evolución, notas o registros pendientes hasta abrirse.

## 17. Gestión de usuarios

El admin puede:
- listar/filtrar;
- entrar en ficha;
- activar/bloquear;
- cambiar pago;
- cambiar rol dentro de las reglas vigentes;
- editar sexo;
- consultar actividad e historial.

Desde 21/10/2026 `Usuarios` se accede desde `Ajustes → Usuarios`.

## 18. Ajustes y comunicaciones

### Ajustes
- bloqueo automático por impago;
- visibilidad de semanas pasadas;
- gestión de Usuarios;
- Mostrar mi evolución como atleta para admins.

### Email al publicar
- aviso al publicar una semana por primera vez;
- evita duplicados al republicar;
- se gestiona mediante Resend cuando está configurado.

### Invitaciones
- existe flujo de invitación por email;
- la invitación no sustituye la aprobación manual del admin.

### Web Push y campana
Estado funcional: **VALIDADO 21/10/2026**.

- Todos los roles disponen de campana de notificaciones.
- El centro persistente informa de reacciones, comentarios, respuestas y reacciones a comentarios.
- No se notifica una acción propia al mismo usuario.
- Web Push es opcional y requiere permiso explícito.

## 19. Rendimiento y navegación

### Fase 1
Estado: **VALIDADO 16/10/2026**.

Comportamientos protegidos:
- Ranking filtra localmente;
- Semana prepara cada día solo cuando se abre;
- Panel y Cuenta muestran primero el contenido principal;
- componentes pesados se cargan cuando hacen falta.

### Fase 2
Estado: **VALIDADO 22/10/2026 / ONLINE EN VERCEL**.

- una pulsación móvil provoca una sola navegación;
- se elimina la precarga automática global de rutas privadas;
- prefetch solo con hover real en escritorio;
- Home carga 15 publicaciones por página;
- runtime productivo Node 22;
- producción estable en `https://lemon-rx.vercel.app`;
- Functions en región Dublín.

### Fase 3
Estado: **VALIDADO 23/10/2026 / ONLINE EN VERCEL**.

- Ranking solicita únicamente la clasificación del día visible, no toda la semana;
- Semana no descarga ningún leaderboard global al entrar;
- al abrir un día con bloques puntuables se carga solo la clasificación de ese día;
- la clasificación diaria ya cargada se reutiliza durante esa visita;
- Home deja de invalidar el layout privado completo al reaccionar o comentar y refresca solo Home;
- no cambia ningún criterio de posición, empate, sexo, división, peso o `total_load`.

### Fase 4
Estado: **VALIDADO 24/10/2026 / ONLINE EN VERCEL**.

- Home conserva el comentario/hilo más reciente visible por defecto.
- Los comentarios anteriores ya no forman parte de la carga inicial de los 15 posts: se cargan únicamente al pulsar `Ver comentarios anteriores`.
- Comentar, responder y reaccionar a comentarios se mantiene igual para el usuario.
- Las reacciones de post siguen siempre visibles con sus contadores y nombres.
- Las lecturas independientes de Home se paralelizan.
- Semana y Ranking dejan de cargar el catálogo completo de movimientos y solicitan solo los movimientos necesarios para la vista actual.
- No cambia ningún criterio de ranking, peso, RM, resultado, nota o programación.
- Jose valida la Preview el 24/10/2026 y la versión queda online en `https://lemon-rx.vercel.app`.

## 20. Comportamientos que no debemos romper

- Registro/login/recuperación.
- Campo sexo Hombre/Mujer y prohibición de inferirlo por nombre.
- Acceso condicionado por estado/pago.
- RLS real.
- Programación y publicación.
- Preservación de IDs de bloques.
- Marcar hecho/notas/resultados.
- Pesos por ronda y total.
- Constructor unificado Strength/Weightlifting.
- Registro por movimiento `Kilos` / `Hecho` dentro de Strength/Weightlifting.
- Rankings General/Masculina/Femenina.
- Ranking de Strength/Weightlifting.
- Ranking diario debe mantener exactamente reglas/posiciones aunque la lectura esté optimizada por día.
- Semana no debe volver a cargar leaderboard semanal completo como coste obligatorio inicial.
- Historial legible sin JSON técnico.
- Historial contextual de movimientos.
- Mi evolución y panel del coach.
- Cumplimiento calculado solo hasta hoy.
- Admins como atletas con opt-out individual.
- Gestión de usuarios.
- Emails sin duplicados.
- Campana y Push.
- Home social automático y una sola publicación diaria por atleta.
- Notas visibles antes de desplegar un bloque de Home.
- Detalle `Ver entrenamiento` dentro del bloque social.
- Navegación móvil inferior y Home como inicio de atletas.
- Todos los emojis sociales visibles por defecto.
- Resumen por emoji con contador y nombres de quienes reaccionaron.
- Comentario más reciente visible por defecto y comentarios anteriores cargados bajo demanda.

## 21. Estrategia comercial futura — no funcional todavía

Hipótesis comercial a conservar:
- 35 €/mes hasta 70 atletas activos;
- desde el atleta 71, +0,50 €/mes por atleta activo adicional;
- coaches/admins fuera del cómputo;
- cobrar por atletas activos, no por cuentas históricas.

Nada de este bloque se considera todavía funcionalidad implementada.

## 22. Home social — VALIDADO 24/10/2026

- Home es la pantalla de entrada por defecto del atleta y de la PWA.
- El sistema crea automáticamente como máximo una publicación por atleta y fecha de entrenamiento.
- Marcar más bloques el mismo día actualiza esa publicación en lugar de crear otra.
- No existe creación manual de posts.
- La tarjeta muestra bloques completados, resultado, división cuando corresponde, kilos/series y nota.
- `Ver entrenamiento` muestra la programación original del bloque.
- Reacciones disponibles y siempre visibles por defecto: 👍 ❤️ 🔥 💪 👏 😂 🍆 🍑 💦 🔩 🦍 🍼 🛴 😍.
- Debajo se muestra el total de reacciones y, para cada emoji usado, el número y los nombres de quienes reaccionaron.
- Comentarios a nivel de publicación, respuestas y reacciones a comentarios.
- La sección de comentarios aparece abierta por defecto con el hilo más reciente visible.
- Los comentarios anteriores se cargan bajo demanda al pulsar `Ver comentarios anteriores` y después pueden minimizarse.
- La sección completa de comentarios puede minimizarse.

## 23. Navegación móvil — VALIDADO 21/10/2026

Atleta móvil:
- barra fija inferior;
- orden principal: `Home · Semana · Ranking · RM's · Historial`;
- Cuenta y campana permanecen en cabecera;
- el logo Lemon RX lleva a Home.

Admin móvil:
- navegación inferior propia;
- `CREAR` centrado físicamente en cabecera;
- `Usuarios` se gestiona desde Ajustes.

## 24. Hosting productivo — VALIDADO 24/10/2026

- URL estable que se comparte con usuarios: `https://lemon-rx.vercel.app`.
- Cada deployment puede tener una URL técnica única, pero los usuarios deben usar siempre la URL estable.
- Tras cada despliegue validado, debe verificarse que `lemon-rx.vercel.app` apunta exactamente al deployment READY correcto antes de cerrar el bloque.
- Rendimiento Fase 4 queda en producción sobre commit `8e3a3ee6003ee9fc8f127c2c25dcd33452714fd3`.
- Railway queda como fallback temporal hasta cerrar configuración/rotación de secretos y comunicaciones.

## 25. Método para nuevas funcionalidades

### Necesidad
Problema real a resolver.

### Comportamiento actual
Qué hace Lemon RX hoy.

### Cambio propuesto
Qué debería hacer.

### Riesgo de regresión
Qué podría romperse.

### Prueba
Pasos concretos.

### Resultado
- PROPUESTO
- DESPLEGADO / PENDIENTE DE VALIDACIÓN
- VALIDADO
- REVERTIDO

## 26. Nuevos RM, ranking inmediato y compartir en Home — VALIDADO 28/10/2026

- Tras guardar, editar o eliminar un resultado, el ranking del día abierto se actualiza sin que el atleta tenga que salir y volver a entrar.
- Si un atleta registra en Strength/Weightlifting una carga superior a su 1RM actual de ese movimiento, Lemon RX actualiza automáticamente el 1RM al nuevo máximo registrado.
- La mejora manual de un RM usa el mismo flujo de reconocimiento del logro.
- Conseguir un nuevo RM muestra una celebración a pantalla completa y claramente protagonista.
- La celebración incluye el movimiento, el nuevo RM y, cuando existe marca anterior, la mejora conseguida.
- El RM queda guardado independientemente de que el atleta decida compartirlo o no.
- La publicación del logro en Home es voluntaria.
- La casilla `Compartir este logro en HOME` viene desmarcada por defecto.
- Si el atleta continúa sin marcarla, no se crea ninguna publicación social por ese RM.
- Si la marca, el logro se publica en Home y utiliza el sistema existente de reacciones y comentarios.
- Cerrar la celebración tampoco publica el logro.
- Los logros ya compartidos anteriormente se conservan; la nueva regla aplica al flujo de nuevos logros.
- Jose valida expresamente este comportamiento completo el 28/10/2026.