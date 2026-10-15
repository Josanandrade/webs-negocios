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

## 3. Infraestructura y accesos

- Repositorio: `Josanandrade/webs-negocios`
- Aplicación: `demos/lemon-rx`
- Rama productiva: `main`
- Rama documental: `docs/lemon-rx-continuidad`
- Railway project: `terrific-compassion`
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

### Programación
- Semanas en borrador/publicadas.
- Editor por días y bloques.
- Solo admin crea, edita, publica o elimina programación.
- Atletas solo leen programación a la que tienen acceso.
- Navegación entre semanas.
- IDs de bloques preservados al editar para no romper actividad, resultados ni historial.

### Seguimiento y resultados
- Marcar bloque como hecho.
- Notas por bloque.
- Resultados por tiempo, rondas+reps, reps/calorías, peso y cargas estructuradas.
- RX e Intermedio cuando corresponde.
- Historial individual.
- Strength/Weightlifting evolucionado con estructura de series/reps, porcentajes sobre RM, RM 1–5, cálculo de kilos y Complex.

### Ranking
- Ranking por bloque.
- Empates comparten posición.
- Datos expuestos mediante flujo controlado de ranking, no abriendo directamente los resultados privados.
- Ranking de Strength/Weightlifting implementado como ranking único, ordenado por mayor carga, sin RX/Intermedio.
- Rankings competitivos separados por sexo cuando corresponde.
- En vistas donde hay clasificación general diaria, el orden se recalcula por resultado y mantiene separación RX/Intermedio.

### Comunicaciones
- Email al publicar una semana por primera vez mediante Resend si está configurado.
- Evita duplicados al despublicar/republicar.
- Web Push a administradores por nuevos registros si lo activan.

## 5. Cambios desplegados desde la auditoría inicial

### 13/10/2026 — Strength / Weightlifting
Estado: DESPLEGADO; algunas partes quedaron pendientes de validación funcional final.

- Catálogo compartido de movimientos.
- Estructura de series, reps y porcentajes sobre 1RM.
- RM entre 1 y 5.
- Cálculo de kilos según RM/porcentaje.
- Soporte de Complex.
- Estructura de EMOM de fuerza/halterofilia.
- Ranking de Weightlifting por carga.
- Recuperación de resultados existentes para no perder históricos.

### 13/10/2026 — Sexo del atleta y rankings
Estado: DESPLEGADO PARA VALIDACIÓN.

- El registro obliga a indicar Hombre o Mujer.
- El admin puede editar este dato desde el perfil del usuario.
- Los rankings competitivos separan Hombres y Mujeres.
- Ambos rankings son visibles para los usuarios.
- Objetivo de negocio: un atleta compite en ranking con usuarios de su mismo sexo, manteniendo una vista global cuando corresponda.

### 13/10/2026 — Peso por ronda y total de kilos
Estado: DESPLEGADO PARA VALIDACIÓN.

- En bloques competitivos por peso se informa el peso de cada ronda/serie en lugar de asumir un único peso para todo el bloque.
- El sistema calcula la suma total de kilos movidos.
- El ranking usa el total calculado para comparar atletas cuando ese es el criterio del bloque.
- Se recalcularon resultados existentes para adaptarlos al nuevo modelo sin perder datos.

### 13/10/2026 — Invitaciones
Estado: DESPLEGADO/ONLINE.

- Invitación por email añadida.
- La invitación no elimina la revisión/aprobación manual del alta por parte del admin.

### 14/10/2026 — Clasificación del día
Estado: DESPLEGADO.

- La clasificación diaria se ordena por resultado real del bloque.
- Puesto y total se recalculan correctamente.
- RX e Intermedio permanecen separados.
- La vista de ranking conserva General / Masculina / Femenina donde aplica.

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

- Node 20 observado frente a dependencias Supabase que declaran Node >=22.
- Errores puntuales `refresh_token_already_used` a investigar.
- Vulnerabilidades high reportadas por npm: analizar individualmente; no usar `npm audit fix --force` a ciegas.
- Pruebas RLS todavía mejorables/automatizables.

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
4. validar rankings e historial;
5. corregir fricciones y errores;
6. estabilizar el producto;
7. solo entonces preparar la salida comercial a otras programaciones.
