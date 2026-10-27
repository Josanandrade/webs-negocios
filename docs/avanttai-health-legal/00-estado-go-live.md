# AvanttAI Health — Estado de preparación para producción

Fecha de revisión: 27/10/2026

## Objetivo

Este bloque reúne los requisitos legales, organizativos y operativos que deben estar cerrados antes de utilizar AvanttAI Health con datos clínicos reales.

## Modelo de roles

- Clínica / profesional sanitario: **Responsable del tratamiento**.
- AvanttAI: **Encargado del tratamiento**, cuando procesa datos siguiendo instrucciones de la clínica.
- Proveedores que procesan datos para AvanttAI: **Subencargados**, cuando corresponda.

La relación Responsable–Encargado debe formalizarse por escrito conforme al art. 28 RGPD.

## Estado actual

### Cerrado técnicamente en TEST

- Aislamiento multiempresa y autorización deny-by-default.
- ACL por rol/capacidad y revocación automática.
- Prueba E2E de propietario permitido / actor inválido denegado / acceso cruzado denegado.
- Auditoría de accesos.
- Protección frente a borrado físico accidental de pacientes.
- Security Advisor de Supabase sin avisos de seguridad en el cierre del bloque.
- CI/build/tests de la rama Health TEST en verde.
- Datos clínicos reales no utilizados en las pruebas.

### Infraestructura TEST verificada

- Supabase Health TEST: región `eu-west-2` (Europa).
- Railway Health TEST: región europea `europe-west4`.
- Railway funciona como runtime; la persistencia clínica principal está en Supabase.

> Las regiones de TEST no sustituyen la verificación contractual y técnica del entorno definitivo de producción.

## Bloqueadores de producción

1. Identidad legal definitiva de AvanttAI: nombre/razón social, NIF/CIF, domicilio y datos de contacto.
2. Contrato de encargo de tratamiento (art. 28 RGPD) firmado con cada clínica.
3. EIPD/DPIA completada por el Responsable, con asistencia de AvanttAI.
4. Evaluación documentada sobre necesidad de DPD/DPO de la clínica y de AvanttAI.
5. Registro de subencargados, DPAs y transferencias internacionales.
6. Política de conservación, bloqueo/legal hold y eliminación.
7. Plan de respuesta a incidentes y brechas.
8. Backup automático de producción y prueba de restauración documentada.
9. Contratos/DPAs vigentes de Supabase, Railway, Resend, Stripe y cualquier proveedor adicional.
10. Stripe producción y migración controlada desde Setmore cuando proceda.
11. Revisar antes de activar cualquier IA que reciba contenido clínico.

## Criterio de salida

AvanttAI Health no se considerará listo para datos clínicos reales hasta que los puntos anteriores figuren como `CERRADO`, exista evidencia documental y se haya realizado al menos una prueba de recuperación y una simulación de incidente.

## Referencias oficiales

- RGPD, art. 28 y 35.
- AEPD — contratos de encargo: https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/8-responsable-y-encargado-del-tratamiento/FAQ-0238-cual-seria-el-contenido-del-contrato-de-encargo-de-tratamiento
- AEPD — EIPD: https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/realizacion-de-evaluaciones-de
- Ley 41/2002, art. 17: https://www.boe.es/buscar/act.php?id=BOE-A-2002-22188
