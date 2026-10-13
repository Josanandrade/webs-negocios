# Lemon RX — Funcional

> Documento vivo de comportamiento funcional. Aquí se describe qué debe poder hacer cada tipo de usuario y qué reglas de negocio están validadas. Cuando una funcionalidad cambie y Jose la valide, este documento debe actualizarse.

## 1. Propósito

Lemon RX permite publicar y consumir programación semanal de CrossFit de forma privada, controlando acceso, pagos, actividad de atletas, resultados, ranking e historial.

Usuarios principales:
- Administrador/coach.
- Atleta.

## 2. Registro y acceso

### Registro

El usuario puede:
- introducir nombre;
- email;
- contraseña de mínimo 8 caracteres.

Comportamiento esperado:
- se crea usuario en Supabase Auth;
- se crea perfil automáticamente;
- entra como `athlete`;
- `access_status = pending`;
- `payment_status = pending`;
- si la confirmación de email está activa, debe confirmar antes de iniciar sesión;
- tras registrarse, los admins pueden recibir Web Push si la tienen activada.

### Login

- email + contraseña;
- email no confirmado devuelve mensaje específico;
- credenciales incorrectas no deben revelar información sensible;
- si ya existe sesión, `/login` y `/registro` redirigen a la app.

### Recuperación

- el usuario solicita enlace por email;
- el mensaje de respuesta es neutro tanto si el email existe como si no;
- el enlace permite definir una nueva contraseña.

## 3. Regla de acceso a programación

Un atleta puede ver programación publicada solo si:

1. `access_status = active`, y
2. se cumple una de estas dos:
   - `payment_status = paid`, o
   - el ajuste global `auto_block_unpaid` está desactivado.

Un admin siempre puede ver la programación, incluidos borradores.

### Estados de acceso

- `pending`: usuario recién registrado, pendiente de revisión.
- `active`: usuario habilitado.
- `blocked`: usuario bloqueado.

### Estados de pago

- `paid`: pagado.
- `pending`: pendiente de pago.

## 4. Programación semanal — Admin

El admin puede:
- ver la semana actual en el panel;
- crear una semana;
- editar una semana;
- guardar borrador;
- publicar/despublicar;
- eliminar semanas solo si están en borrador;
- crear días con bloques;
- ordenar bloques;
- elegir el tipo de resultado/seguimiento de cada bloque.

Reglas:
- `start_date` de semana debe ser lunes;
- cada semana es única por fecha de inicio;
- un día vacío no se guarda;
- un bloque completamente vacío no se guarda;
- al editar un bloque existente debe mantenerse su ID;
- mantener ID es obligatorio para no romper notas, marcas, resultados e historial existentes.

## 5. Tipos funcionales de bloque

### Sin resultado — `none`

El atleta puede marcar hecho y dejar nota, pero no introduce resultado/ranking.

### Tiempo — `time`

Uso típico:
- WOD for time.

Puede registrar:
- tiempo;
- time cap;
- reps si llegó al cap.

Ranking:
- quien termina se ordena por menor tiempo;
- quien llega al cap se ordena por mayor número de reps;
- empates comparten posición.

### AMRAP — `rounds_reps`

Registra:
- rondas;
- reps.

Ranking:
- más rondas y reps es mejor.

### Repeticiones/calorías — `reps`

Registra:
- reps/calorías.

Ranking:
- más es mejor.

### Peso competitivo — `weight`

Registra kg.

Ranking:
- más peso es mejor.

### Intervalos / EMOM — `intervals`

El atleta:
- elige RX o Intermedio;
- indica si mantuvo todas las reps en todos los intervalos;
- si no, puede escribir el detalle de reps por ronda.

Visualización:
- se muestra lista de participantes;
- no se plantea como ranking clásico por puestos;
- se diferencia quién lo completó según programación y quién tuvo que adaptarlo.

### Carga / fuerza — `load`

Pensado para Strength/Weightlifting.

El atleta registra:
- peso máximo y/o detalle de series.

Reglas:
- no hay ranking;
- no necesita categorías competitivas;
- el sistema lo guarda internamente como RX para simplificar el modelo actual.

## 6. Vista del atleta

Página principal `/`.

El atleta con acceso puede:
- ver programación publicada;
- consultar semana actual;
- navegar a semana anterior/siguiente publicada;
- volver a semana actual;
- abrir días y bloques;
- marcar bloque como hecho;
- guardar nota;
- guardar resultado si corresponde;
- ver información de ranking del bloque.

Si no existe semana publicada:
- mostrar estado vacío claro;
- permitir acceder a última semana publicada cuando exista.

Si no tiene acceso:
- no debe mostrarse contenido protegido;
- debe mostrarse mensaje adecuado según estado pendiente/bloqueado/pago.

## 7. Actividad, notas y resultados

### Marcar hecho

Cada atleta solo puede modificar su propia actividad.

### Notas

- máximo actual: 2000 caracteres;
- privadas para atleta + admins;
- aparecen al admin en el panel como actividad reciente.

### Guardar resultado

- solo sobre bloques con tipo de resultado distinto de `none`;
- el backend obtiene el tipo real del bloque;
- el atleta no decide arbitrariamente el tipo;
- guardar un resultado implica marcar el bloque como hecho.

## 8. Ranking

Ruta: `/ranking`.

Comportamiento:
- ranking por bloque;
- categorías RX e Intermedio donde corresponde;
- empates comparten posición;
- el atleta puede ver nombres/resultados agregados solo mediante el flujo controlado de ranking;
- la tabla privada de resultados no debe quedar abierta directamente a otros atletas.

## 9. Historial

### Atleta

Ruta: `/historial`.

Debe mostrar todos los bloques donde haya:
- marcado hecho;
- dejado nota;
- guardado resultado/carga.

Incluye semanas antiguas aunque ya no estén visibles en navegación normal, siempre para el propio atleta.

### Admin

Ruta: `/admin/usuarios/[id]/historial`.

El admin puede consultar historial completo del atleta.

## 10. Mi cuenta

Ruta: `/cuenta`.

Actualmente contempla gestión básica de cuenta/nombre dentro de los límites permitidos.

Regla protegida:
- un atleta no puede modificar rol, pago ni acceso desde Mi cuenta.

## 11. Panel Admin

Ruta: `/admin`.

Información actual:
- saludo al admin;
- semana actual y estado;
- acceso directo a editar/crear semana;
- total de atletas;
- atletas con acceso;
- atletas sin pagar;
- registros pendientes de activar;
- últimas notas de atletas;
- accesos a programación y usuarios.

## 12. Gestión de usuarios

El admin puede:
- listar atletas;
- filtrar usuarios;
- entrar en ficha individual;
- activar/bloquear;
- marcar pagado/pendiente;
- cambiar rol atleta/admin;
- consultar bloques hechos/notas;
- consultar historial completo.

Reglas:
- un admin no puede cambiar su propio rol desde la acción existente;
- convertir a admin activa también el acceso;
- nuevos usuarios no reciben acceso automáticamente.

## 13. Ajustes globales

Ruta: `/admin/ajustes`.

Ajustes funcionales actuales:

### Bloqueo automático por impago

`auto_block_unpaid`

ON:
- atleta activo pero no pagado no ve programación.

OFF:
- atleta activo puede ver programación aunque esté pendiente de pago.

### Semanas pasadas

`show_past_weeks`

Controla si atletas con acceso pueden consultar programación pasada.

### Notificaciones

Admin puede:
- activar Web Push en dispositivo compatible;
- desactivar;
- enviar prueba.

En iPhone puede requerir instalar la web en pantalla de inicio.

## 14. Email al publicar programación

Al publicar una semana por primera vez:
- si Resend está configurado, se prepara aviso a usuarios con email confirmado y acceso no bloqueado;
- incluye enlace directo a la semana;
- cada destinatario recibe email individual;
- no debe repetirse al despublicar y volver a publicar la misma semana;
- si el envío completo falla, la semana queda preparada para poder reintentar más adelante.

Importante:
- este email es distinto de los emails de autenticación de Supabase.

## 15. Push por nuevo registro

Cuando se registra un usuario:
- el registro no debe quedarse esperando a que termine la notificación;
- admins con Push activo reciben aviso;
- no debe enviarse repetidamente para el mismo alta;
- endpoints inválidos/expirados deben poder limpiarse.

## 16. Comportamientos que NO debemos romper

- Registro/login/recuperación.
- Acceso condicionado por estado + pago.
- RLS real, no solo controles visuales.
- Edición/publicación de semanas.
- Preservación de IDs de bloques.
- Marcar hecho/notas/resultados.
- Ranking.
- Historial.
- Gestión de usuarios.
- Email de semana publicada sin duplicados.
- Web Push de nuevos registros.
- Navegación rápida actual y comportamiento móvil existente.

## 17. Puntos funcionales pendientes de revisar

No se consideran errores confirmados todavía; son áreas que requieren QA funcional con cuenta real:

1. Sesiones en varias pestañas/dispositivos, por los errores de refresh token observados en logs.
2. Flujo exacto cuando un admin bloquea/desbloquea a un atleta mientras este tiene la app abierta.
3. Reintento real del email de publicación ante fallo parcial del batch de Resend.
4. Comportamiento Web Push en iPhone Safari/PWA frente a Android/Chrome.
5. Estados vacíos y mensajes cuando no hay ranking o historial.
6. Compatibilidad completa tras futura actualización a Node 22.

## 18. Método para nuevas funcionalidades

Cada petición nueva debe documentarse así:

### Necesidad
Qué problema queremos resolver.

### Comportamiento actual
Qué hace Lemon RX hoy.

### Cambio propuesto
Qué debería hacer exactamente.

### Riesgo de regresión
Qué funcionalidades existentes podrían verse afectadas.

### Prueba
Pasos concretos para validar.

### Resultado
- Pendiente
- Implementado, pendiente de validación
- VALIDADO por Jose
- Revertido

## 19. Cambios funcionales validados

### 13/10/2026 — Auditoría inicial

No se ha cambiado ninguna funcionalidad.
Se ha documentado la línea base que ya existía en producción para usarla como contrato funcional a partir de ahora.
