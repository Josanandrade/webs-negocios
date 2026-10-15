# Lemon RX — Funcional

> Documento vivo de comportamiento funcional. Describe qué puede hacer cada tipo de usuario y qué reglas de negocio están vigentes. Se distingue entre funcionalidad validada y funcionalidad desplegada pendiente de validación.

## 1. Propósito

Lemon RX permite publicar y consumir programación semanal de CrossFit de forma privada, controlando acceso, pagos, actividad, resultados, rankings e historial.

Usuarios principales:
- Administrador/coach.
- Atleta.

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

Estado del campo sexo: DESPLEGADO PARA VALIDACIÓN.

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

## 5. Tipos de resultado

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

Nuevo comportamiento desplegado:
- el atleta informa los pesos de las rondas/series que correspondan;
- el sistema calcula el **total de kilos movidos**;
- el ranking usa ese total cuando el bloque se define con este criterio;
- los datos anteriores se recalculan/adaptan para preservar histórico.

Estado: DESPLEGADO PARA VALIDACIÓN.

### Intervalos / EMOM — `intervals`
- RX o Intermedio cuando aplica;
- puede indicar si mantuvo la programación completa;
- si adapta, puede detallar reps por ronda.

### Strength / Weightlifting

La funcionalidad ha evolucionado respecto a la línea base inicial.

Incluye:
- catálogo de movimientos;
- series y reps estructuradas;
- porcentajes sobre RM;
- RM entre 1 y 5;
- cálculo de kilos;
- Complex;
- estructuras de fuerza/halterofilia dentro de EMOM cuando corresponde;
- ranking específico de Weightlifting por carga, sin separar RX/Intermedio.

Estado: DESPLEGADO; parte pendiente de validación funcional final.

## 6. Vista del atleta

El atleta con acceso puede:
- ver programación publicada;
- navegar por semanas permitidas;
- abrir bloques;
- marcar hecho;
- guardar nota;
- guardar resultado;
- ver ranking cuando corresponda;
- consultar historial.

## 7. Actividad, notas y resultados

- Cada atleta modifica su propia actividad.
- Notas privadas para atleta + admins.
- Guardar resultado marca el bloque como hecho.
- El backend determina el tipo real del bloque.
- No se permite que un atleta altere arbitrariamente el tipo de resultado.

## 8. Ranking

Ruta principal: `/ranking`.

Reglas:
- ranking por bloque;
- RX e Intermedio separados cuando corresponde;
- empates comparten posición;
- resultados privados no se abren directamente a otros atletas;
- cuando el resultado genera ranking competitivo, el sistema utiliza el sexo del atleta para separar **Masculino** y **Femenino**;
- ambos rankings deben ser visibles para los usuarios;
- puede existir una vista General cuando la interfaz la contemple, sin mezclar incorrectamente puestos masculinos/femeninos específicos;
- Strength/Weightlifting usa ranking único por carga cuando no aplica RX/Intermedio.

Estado de separación por sexo: DESPLEGADO PARA VALIDACIÓN.

## 9. Clasificación del día

Actualización desplegada el 14/10/2026:
- se ordena por resultado real;
- puesto y total se recalculan;
- RX e Intermedio permanecen separados;
- las vistas de ranking mantienen General / Masculina / Femenina cuando aplica.

## 10. Historial

### Atleta
Debe incluir bloques donde haya:
- marcado hecho;
- nota;
- resultado/carga.

### Admin
Puede consultar el historial completo del atleta desde su ficha.

## 11. Cuenta y perfil

El atleta gestiona únicamente los datos permitidos.

Reglas protegidas:
- no puede cambiarse el rol;
- no puede marcarse pagado;
- no puede activar su propio acceso.

El admin puede editar el sexo Hombre/Mujer del usuario desde su perfil.

## 12. Panel Admin

Incluye:
- semana actual;
- estado;
- accesos a programación y usuarios;
- total de atletas;
- accesos activos/pendientes;
- pagos pendientes;
- registros pendientes;
- actividad/notas recientes.

## 13. Gestión de usuarios

El admin puede:
- listar/filtrar;
- entrar en ficha;
- activar/bloquear;
- cambiar pago;
- cambiar rol dentro de las reglas vigentes;
- editar sexo;
- consultar actividad e historial.

## 14. Ajustes y comunicaciones

### Ajustes
- bloqueo automático por impago;
- visibilidad de semanas pasadas;
- Web Push de admin.

### Email al publicar
- aviso al publicar una semana por primera vez;
- evita duplicados al republicar;
- se gestiona mediante Resend cuando está configurado.

### Invitaciones
- existe flujo de invitación por email;
- la invitación no sustituye la aprobación manual del admin.

## 15. Comportamientos que no debemos romper

- Registro/login/recuperación.
- Campo de sexo una vez validado.
- Acceso condicionado por estado/pago.
- RLS real.
- Programación y publicación.
- Preservación de IDs de bloques.
- Marcar hecho/notas/resultados.
- Pesos por ronda y total una vez validados.
- Rankings por sexo una vez validados.
- Ranking de Strength/Weightlifting.
- Historial.
- Gestión de usuarios.
- Emails sin duplicados.
- Push.
- Rendimiento y experiencia móvil.

## 16. Estrategia comercial futura — no funcional todavía

Desde 15/10/2026 se contempla que Lemon RX pueda venderse a otras programaciones de CrossFit/CrossTraining una vez probada durante meses con usuarios reales.

No implica desarrollar ahora multiempresa ni white-label, pero conviene evitar decisiones que bloqueen esa evolución.

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

## 17. Método para nuevas funcionalidades

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
