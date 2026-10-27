# Checklist de puesta en producción — AvanttAI Health

Fecha base: 27/10/2026

Estados permitidos: `CERRADO`, `EN CURSO`, `BLOQUEADO`, `NO INICIADO`.

## A. Identidad y contratos

- [ ] `BLOQUEADO` Identidad legal definitiva de AvanttAI.
- [ ] `BLOQUEADO` NIF/CIF y domicilio contractual.
- [ ] `NO INICIADO` Contrato comercial con Eferos.
- [ ] `EN CURSO` Anexo art. 28 RGPD — plantilla creada.
- [ ] `NO INICIADO` Firma del DPA/encargo con Eferos.

## B. Privacidad y gobierno

- [ ] `EN CURSO` EIPD/DPIA — borrador creado.
- [ ] `NO INICIADO` EIPD completada con datos legales y operativos de Eferos.
- [ ] `NO INICIADO` Evaluación DPD/DPO Eferos.
- [ ] `NO INICIADO` Evaluación DPD/DPO AvanttAI.
- [ ] `NO INICIADO` Registro de actividades de tratamiento de AvanttAI como encargado.
- [ ] `EN CURSO` Registro de subencargados — inventario inicial creado.
- [ ] `NO INICIADO` Evidencia de aceptación/versión de DPAs de proveedores.
- [ ] `NO INICIADO` Revisión de transferencias internacionales/TIA cuando proceda.

## C. Seguridad técnica

- [x] `CERRADO` Aislamiento cross-tenant en TEST.
- [x] `CERRADO` Actor inválido rechazado.
- [x] `CERRADO` ACL por rol/capacidad.
- [x] `CERRADO` Revocación automática de accesos.
- [x] `CERRADO` Proxy deny-by-default.
- [x] `CERRADO` Auditoría de acceso.
- [x] `CERRADO` Protección contra borrado físico accidental.
- [x] `CERRADO` Gate E2E antes de deploy.
- [x] `CERRADO` Security Advisor sin avisos al cierre del bloque TEST.
- [ ] `NO INICIADO` Revisión de sesiones/MFA de cuentas administrativas de producción.
- [ ] `NO INICIADO` Política formal de rotación/revocación de secretos.
- [ ] `NO INICIADO` Revisión de logs para confirmar ausencia de payload clínico.

## D. Backup y continuidad

- [ ] `BLOQUEADO` Definir plan Supabase de producción con backup automático.
- [ ] `NO INICIADO` Configurar backup lógico cifrado externo.
- [ ] `NO INICIADO` Cubrir también Supabase Storage/documentos.
- [ ] `NO INICIADO` Primera restauración en entorno aislado.
- [ ] `NO INICIADO` Definir RPO/RTO internos antes de prometer SLA.
- [ ] `NO INICIADO` Calendario trimestral de restore-test.

## E. Retención y cierre de datos

- [ ] `EN CURSO` Política de retención — documento base creado.
- [ ] `NO INICIADO` Validar plazos específicos con Eferos/asesoría.
- [ ] `NO INICIADO` Diseñar e implementar `legal_hold`.
- [ ] `NO INICIADO` Automatizar retención de logs técnicos.
- [ ] `NO INICIADO` Flujo de exportación y cierre de cliente probado.

## F. Incidentes

- [x] `CERRADO` Runbook inicial de incidentes redactado.
- [ ] `NO INICIADO` Contacto operativo de incidentes AvanttAI.
- [ ] `NO INICIADO` Contacto operativo/DPD de Eferos.
- [ ] `NO INICIADO` Simulacro de brecha cross-tenant.
- [ ] `NO INICIADO` Plantilla de expediente de incidente integrada en operación.

## G. Integraciones de producción

- [ ] `NO INICIADO` Stripe producción conectado.
- [ ] `NO INICIADO` Flujo de pago 50% primera visita validado en producción controlada.
- [ ] `NO INICIADO` Resend/email de producción con contenido minimizado.
- [ ] `NO INICIADO` Plan de exportación/migración Setmore.
- [ ] `NO INICIADO` Prueba de migración con dataset sintético o copia anonimizada.
- [ ] `BLOQUEADO` IA con contenido clínico: prohibida hasta evaluación específica.

## H. Go-live controlado

- [ ] `NO INICIADO` Entorno producción separado de TEST.
- [ ] `NO INICIADO` Dominio definitivo y TLS.
- [ ] `NO INICIADO` Variables/secretos de producción independientes.
- [ ] `NO INICIADO` Smoke tests con datos sintéticos.
- [ ] `NO INICIADO` E2E de autorización/tenant isolation en producción sin datos reales.
- [ ] `NO INICIADO` Confirmación escrita de Eferos para migración/arranque.
- [ ] `NO INICIADO` Ventana de lanzamiento y plan de rollback.

## Regla final

No introducir datos clínicos reales hasta que:
1. los bloques A, B, D, E y F críticos estén cerrados;
2. exista contrato art. 28 firmado;
3. backup y restore hayan sido probados;
4. el entorno productivo haya pasado E2E con datos sintéticos;
5. exista autorización explícita para el go-live.
