# Runbook de incidentes y brechas — AvanttAI Health

Fecha de revisión: 27/10/2026

## Objetivo

Detectar, contener, documentar y comunicar incidentes que afecten a datos personales o a la seguridad de AvanttAI Health.

## Principios

- preservar evidencia;
- contener antes de ampliar cambios;
- no borrar logs relevantes durante una investigación;
- no enviar datos clínicos completos por tickets, chats o correos internos;
- informar al Responsable sin dilación indebida cuando exista una brecha de datos personales;
- documentar todas las brechas, incluso si finalmente no requieren notificación a la autoridad.

## Clasificación inicial

### SEV-1 — Crítico

Ejemplos:
- acceso cross-tenant confirmado;
- extracción o exposición de datos clínicos;
- credenciales privilegiadas comprometidas;
- pérdida o corrupción masiva de historia clínica;
- ransomware o compromiso de infraestructura con acceso a datos.

Acción: contención inmediata, bloqueo/revocación de credenciales, preservar evidencia y avisar al Responsable afectado de forma prioritaria.

### SEV-2 — Alto

Ejemplos:
- acceso no autorizado limitado;
- envío de información personal al destinatario equivocado;
- integración externa exponiendo datos;
- backup no disponible cuando se necesita restauración.

### SEV-3 — Medio/Bajo

Ejemplos:
- error de aplicación sin evidencia de acceso a datos;
- fallo temporal sin pérdida ni exposición;
- intento de acceso bloqueado por controles.

## Flujo operativo

1. **Detectar y abrir expediente**
   - fecha/hora UTC y local;
   - persona/sistema que detecta;
   - servicio afectado;
   - tenants potencialmente afectados;
   - síntomas observados.

2. **Contener**
   - revocar credenciales/sesiones si procede;
   - aislar función o integración vulnerable;
   - bloquear despliegues adicionales si pueden destruir evidencia;
   - mantener el servicio mínimo seguro.

3. **Preservar evidencia**
   - deployment/commit afectado;
   - logs sanitizados;
   - eventos de auditoría;
   - ventanas temporales;
   - cambios de configuración;
   - lista de usuarios/tenants afectados.

4. **Determinar si hay datos personales afectados**
   - confidencialidad;
   - integridad;
   - disponibilidad.

5. **Comunicar al Responsable**
   - sin dilación indebida;
   - objetivo operativo interno: primera comunicación en <=12 h desde confirmación razonable de una brecha que afecte a sus datos;
   - no esperar a tener toda la investigación cerrada.

6. **Apoyar evaluación del Responsable**
   - naturaleza del incidente;
   - categorías aproximadas de interesados y datos;
   - volumen estimado;
   - consecuencias probables;
   - medidas adoptadas y propuestas.

7. **Remediar**
   - corregir causa raíz;
   - rotar secretos;
   - invalidar sesiones si procede;
   - probar aislamiento y permisos;
   - validar que no persiste la exposición.

8. **Cerrar y aprender**
   - informe post-incidente;
   - cronología;
   - causa raíz;
   - controles fallidos;
   - acciones correctoras y responsables;
   - fecha de revisión posterior.

## Obligaciones externas

La AEPD indica que el Responsable debe notificar a la autoridad competente cuando la brecha suponga riesgo para los derechos y libertades, a ser posible dentro de las 72 horas desde que tenga constancia. Si el riesgo es alto, puede ser necesario comunicar también a los afectados.

AvanttAI, como Encargado, debe facilitar al Responsable la información necesaria sin dilación indebida. Solo notificará a la AEPD en nombre del Responsable si existe mandato contractual/documentado para ello.

## Plantilla de primera comunicación a clínica

- Identificador interno del incidente: `[INC-AAAA-NNN]`
- Fecha/hora de detección: `[PENDIENTE]`
- Estado: `investigando / contenido / resuelto`
- Sistemas afectados: `[PENDIENTE]`
- Datos potencialmente afectados: `[PENDIENTE]`
- Periodo temporal: `[PENDIENTE]`
- Medidas de contención adoptadas: `[PENDIENTE]`
- Riesgo provisional: `[PENDIENTE]`
- Próxima actualización: `[PENDIENTE]`
- Contacto AvanttAI: `[PENDIENTE]`

## Simulacro previo a producción

Antes del primer cliente real debe ejecutarse un tabletop exercise con un caso ficticio de acceso cross-tenant:
1. detectar;
2. bloquear acceso;
3. localizar logs/auditoría;
4. identificar tenant afectado;
5. redactar primera notificación;
6. calcular ventana de 72 h del Responsable;
7. documentar remediación.

Resultado exigido: `PASS` y expediente de simulacro guardado.

## Referencias

- AEPD — notificación de brechas: https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/brechas-de-datos-personales-notificacion
- AEPD — guía de brechas de seguridad: https://www.aepd.es/guias/guia-brechas-seguridad.pdf
