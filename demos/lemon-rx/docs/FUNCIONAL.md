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

Estado: **VALIDADO**.

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

Estado: **VALIDADO**.

- los siete días pueden permanecer cerrados;
- en móvil, con todos cerrados, se conserva el comportamiento de scroll ya validado;
- al abrir un día se posiciona correctamente bajo la cabecera;
- los bloques de un día se preparan al abrirlo por primera vez;
- al cerrar un día, el contenido pesado se desmonta para evitar que la página conserve una altura/scroll excesivo;
- los componentes pesados de registro de resultados, Strength/Weightlifting, historial contextual y ranking de fuerza se cargan cuando hacen falta, no como coste obligatorio al entrar en Semana.

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
- en la vista detallada se puede pulsar un atleta para ver su sesión completa, incluidos resultados y notas visibles dentro de este contexto.

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

Los bloques Strength/Weightlifting no deben mostrar códigos JSON/técnicos. Los resultados estructurados se traducen a información humana: sección, movimiento, pesos y volumen cuando corresponda.

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

### Cumplimiento
- bloques completados / bloques programados;
- porcentaje;
- solo cuenta programación hasta el día de HOY;
- los días futuros no reducen el porcentaje;
- tampoco se penaliza por programación anterior al alta del usuario.

### WOD
- se muestra **Posición WOD media**;
- formato ejemplo: `5/14`;
- el numerador es la posición media conseguida en WODs comparables;
- el denominador representa los participantes medios contra los que realmente se comparó;
- la comparación se mantiene dentro de la misma división;
- no mostrar percentil al usuario.

### Fuerza
- volumen total registrado;
- sesiones realizadas / sesiones programadas hasta hoy, por ejemplo `3/3 sesiones realizadas`.

### RM
- muestra mejoras cuando existe histórico disponible;
- no inventar cambios anteriores al momento en que Lemon empezó a guardar histórico de RM.

### Comparación con periodo anterior
- cumplimiento;
- mejora/empeoramiento de posición media en WODs;
- variación de volumen de fuerza;
- si no hay periodo anterior suficiente, mostrarlo claramente sin fabricar una comparación.

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

Para históricos 4/8/12 semanas se conservan las métricas comparativas validadas. En semana en curso se priorizan cumplimiento, atletas con actividad y bloques completados hasta hoy.

No mostrar una **posición WOD media global** de todos los usuarios, porque no aporta una lectura útil al coach.

### Quién está completando menos bloques

Dentro de Cumplimiento medio existe acceso a una lista de usuarios con bloques pendientes.

Reglas:
- solo contar bloques programados hasta HOY;
- excluir días futuros;
- ordenar desde menos bloques completados a más;
- mostrar realizados/programados y porcentaje;
- permitir entrar en la ficha del usuario.

## 14. Admin como atleta

Estado: **VALIDADO**.

- Un admin puede tener también evolución deportiva.
- Ajuste individual: **Mostrar mi evolución como atleta**.
- Para admins, el valor por defecto vigente es **activado**.
- Si el admin no quiere aparecer, debe desactivarlo en Ajustes.
- Cuando está activado:
  - aparece como un atleta más en la evolución del coach;
  - sus datos son visibles para otros admins/coachs;
  - su Cuenta muestra `Mi evolución`.
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

`Seguimiento` es plegable y no debe cargar evolución, notas o registros pendientes hasta abrirse. La carga de estas métricas no debe bloquear la aparición del Panel principal.

## 17. Gestión de usuarios

El admin puede:
- listar/filtrar;
- entrar en ficha;
- activar/bloquear;
- cambiar pago;
- cambiar rol dentro de las reglas vigentes;
- editar sexo;
- consultar actividad e historial.

Desde 21/10/2026 `Usuarios` ya no ocupa una pestaña principal del Admin. Se accede desde `Ajustes → Usuarios`, conservando invitación, búsqueda por nombre/email/teléfono, filtros y todas las herramientas existentes.

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
Estado: **VALIDADO 21/10/2026**.

- Todos los roles disponen de una campana de notificaciones junto a Cuenta.
- El contador muestra avisos no leídos.
- El centro persistente informa de reacciones a publicaciones, comentarios, respuestas y reacciones a comentarios.
- No se notifica una acción propia al mismo usuario.
- El usuario puede marcar una o todas como leídas.
- Web Push es opcional y requiere permiso explícito del navegador/dispositivo.
- Una cuenta que no active Push sigue conservando los avisos en la campana.
- Se envió un aviso in-app a las 13 cuentas existentes para solicitar activación de Push.

## 19. Rendimiento y navegación — Fase 1

Estado: **VALIDADO 16/10/2026**, con una parte revisada posteriormente por crecimiento funcional.

Comportamientos protegidos que siguen vigentes:
- Ranking General/Masculina/Femenina cambia localmente sin recarga completa;
- Semana prepara cada día solo cuando el usuario lo abre;
- Panel y Cuenta muestran primero el contenido principal;
- Semana no obliga a descargar desde el principio todos los componentes pesados de trackers/historial/ranking de fuerza.

La estrategia de warm-up secuencial y prefetch por toque, aunque fue útil y se validó en una versión anterior, deja de considerarse contrato protegido desde el diagnóstico del 21/10/2026: con Home, notificaciones y más rutas empezó a generar peticiones duplicadas/concurrentes en móvil y se sustituye en la Fase 2.

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
- Rankings General/Masculina/Femenina.
- Ranking de Strength/Weightlifting.
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

## 21. Estrategia comercial futura — no funcional todavía

Desde 15/10/2026 se contempla que Lemon RX pueda venderse a otras programaciones de CrossFit/CrossTraining una vez probada durante meses con usuarios reales.

Hipótesis comercial a conservar:
- 35 €/mes hasta 70 atletas activos;
- desde el atleta 71, +0,50 €/mes por atleta activo adicional;
- coaches/admins fuera del cómputo;
- cobrar por atletas activos, no por cuentas históricas.

Posibles necesidades futuras:
- varias organizaciones/programaciones;
- boxes dentro de una programación;
- atletas adscritos a box;
- rankings globales y por box;
- branding white-label;
- roles de administración por organización.

Nada de este bloque se considera todavía funcionalidad implementada.

## 22. Próximo bloque de rendimiento

**Fase 2: reducir trabajo de navegación y después optimizar refrescos al guardar.**

Primer subbloque preparado 21/10/2026:
- una pulsación móvil debe provocar una sola navegación;
- eliminar la precarga automática global de pestañas privadas;
- mantener prefetch solo cuando existe hover real en escritorio;
- Home debe cargar un número acotado de publicaciones por página;
- actualizar runtime a Node 22.

Estado: **CÓDIGO PREPARADO / PENDIENTE DE DESPLIEGUE Y VALIDACIÓN** por una pausa global de builds de Railway detectada el 21/10/2026.

Después de validar este subbloque:
- revisar Ranking para cargar solo el día/bloques solicitados;
- revisar Semana para no adjuntar rankings masivos que no se han abierto;
- reducir `revalidatePath` demasiado amplios tras reacciones, hecho, nota y resultado;
- mantener datos inmediatamente frescos después del guardado.

## 23. Método para nuevas funcionalidades

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

## 24. Home social — VALIDADO 21/10/2026

- Home es la pantalla de entrada por defecto del atleta y de la PWA.
- El sistema crea automáticamente como máximo una publicación por atleta y fecha de entrenamiento.
- Marcar más bloques el mismo día actualiza esa publicación en lugar de crear otra.
- No existe creación manual de posts.
- La tarjeta muestra bloques completados, resultado, división cuando corresponde, kilos/series y nota.
- La nota se ve antes de desplegar el bloque.
- `Ver entrenamiento` muestra la programación original del bloque: contenido, movimientos, series, reps, porcentajes, descansos, Complex/EMOM y notas de programación recuperables.
- Reacciones disponibles: 👍 ❤️ 🔥 💪 👏 😂 🍆 🍑 💦 🔩 🦍 🍼 🛴 😍.
- Comentarios a nivel de publicación, respuestas y reacciones a comentarios.

## 25. Navegación móvil — VALIDADO 21/10/2026

Atleta móvil:
- barra fija inferior;
- orden principal: `Home · Semana · Ranking · RM's · Historial`;
- Cuenta y campana permanecen en cabecera;
- el logo Lemon RX lleva a Home.

Admin móvil:
- navegación inferior propia;
- `CREAR` centrado físicamente en cabecera;
- `Usuarios` se gestiona desde Ajustes.
