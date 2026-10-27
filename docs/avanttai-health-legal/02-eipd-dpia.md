# EIPD / DPIA — AvanttAI Health

Estado: borrador de trabajo para completar con cada Responsable.

## 1. Descripción sistemática del tratamiento

AvanttAI Health es una plataforma de gestión para clínicas y profesionales sanitarios. Según módulos activados puede tratar:
- alta y gestión de pacientes;
- agenda, reservas, modificaciones y cancelaciones;
- historia clínica y episodios asistenciales;
- consentimientos y documentos firmados;
- cobros, bonos y datos administrativos;
- comunicaciones transaccionales;
- autorizaciones para reservar en nombre de otra persona;
- registros de acceso y auditoría.

La Clínica determina los fines del tratamiento y actúa como Responsable. AvanttAI procesa por cuenta de la Clínica como Encargado.

## 2. Interesados y datos

### Interesados
- pacientes;
- menores o personas dependientes, cuando proceda;
- representantes/tutores/autorizados;
- profesionales y personal de la clínica.

### Datos
- identidad y contacto;
- relación asistencial y citas;
- datos de salud;
- consentimientos y firmas;
- documentación clínica;
- cobros y datos administrativos;
- auditoría y seguridad.

No se prevé almacenar datos completos de tarjeta; la pasarela de pago debe asumir esa función.

## 3. Finalidad y base jurídica

La determinación final de las bases jurídicas corresponde al Responsable.

Matriz de referencia a validar por la Clínica:
- prestación/gestión del servicio asistencial: base del art. 6 RGPD que corresponda al vínculo con el paciente;
- datos de salud: normalmente deberá existir una excepción válida del art. 9.2 RGPD, por ejemplo la prestación o gestión de asistencia sanitaria cuando resulte aplicable;
- facturación/obligaciones legales: art. 6.1.c cuando proceda;
- comunicaciones comerciales: finalidad separada, base propia y consentimiento cuando sea exigible.

El consentimiento del paciente no debe usarse como sustituto automático de una base jurídica adecuada para el tratamiento clínico necesario.

## 4. Necesidad y proporcionalidad

Principios de diseño:
- recoger solo campos necesarios;
- acceso por función profesional;
- separación entre clientes;
- conservar únicamente durante plazos justificados;
- exportación y trazabilidad;
- no reutilizar información clínica para fines comerciales propios de AvanttAI;
- no enviar contenido clínico a modelos de IA hasta disponer de evaluación legal, contractual y técnica específica.

## 5. Arquitectura y localización conocida en TEST

- Supabase Health TEST: `eu-west-2`.
- Railway Health TEST: `europe-west4`.
- Supabase: base de datos/plataforma principal.
- Railway: ejecución de la aplicación.
- Resend: correo transaccional cuando esté activado.
- Stripe: pagos cuando esté activado.

La producción deberá documentar de nuevo región, plan, subencargados y mecanismos de transferencia.

## 6. Riesgos identificados y controles

| Riesgo | Impacto | Controles actuales/previstos | Residual provisional |
|---|---|---|---|
| Acceso de una clínica a datos de otra | Muy alto | aislamiento por tenant; ACL; proxy deny-by-default; E2E cross-tenant | Bajo/Medio |
| Cuenta o sesión comprometida | Alto | credenciales individuales; revocación; mínimo privilegio; controles de sesión por reforzar | Medio |
| Privilegios excesivos de personal | Alto | capacidades por rol; separación owner/clinician/admin_readonly | Bajo/Medio |
| Borrado accidental de historia | Muy alto | guard contra DELETE físico; archivo/restauración; legal hold pendiente | Bajo/Medio |
| Filtración mediante logs | Alto | política de no registrar payload clínico; revisión periódica pendiente | Medio |
| Email con información excesiva | Alto | minimización de contenido; enlaces/códigos en lugar de detalle clínico | Medio |
| Fallo de backup/recuperación | Muy alto | requisito de backup automático y prueba de restore antes de producción | Medio hasta validar |
| Transferencia internacional no documentada | Alto | DPA, registro de subencargados y SCC cuando corresponda | Medio hasta cerrar |
| Conservación excesiva o borrado prematuro | Alto | política de retención por categoría; legal hold | Medio hasta implementar |
| Exposición por integración externa | Alto | secretos server-side; scopes mínimos; revisión individual de integraciones | Medio |
| Uso de IA sobre datos clínicos sin garantías | Muy alto | bloqueado por política hasta evaluación específica | Bajo mientras siga bloqueado |

## 7. Medidas técnicas ya verificadas en Health TEST

- autorización explícita y deny-by-default;
- permisos por dominio funcional;
- revocación de ACL;
- denegación de actor inválido;
- denegación cross-tenant;
- auditoría de accesos autorizados/denegados;
- roles públicos sin acceso directo a la tabla ACL;
- servidor con privilegios mínimos de SELECT/INSERT/UPDATE sobre ACL;
- protección de eliminación física de pacientes;
- CI, tests y build como gate previo al despliegue.

## 8. Medidas organizativas pendientes

- contrato art. 28 firmado;
- registro formal de actividades del Encargado;
- procedimiento de altas/bajas de personal;
- revisión periódica de permisos;
- formación y compromiso de confidencialidad;
- plan de brechas;
- backup/restore verificado;
- política de retención y legal hold;
- evaluación DPD/DPO;
- revisión anual de subencargados y transferencias;
- simulacro de incidente.

## 9. DPD/DPO

Debe documentarse por separado:
1. si la Clínica es un centro sanitario privado o un profesional sanitario que ejerce a título individual;
2. si AvanttAI, atendiendo a su escala y actividad principal, entra en un supuesto de designación obligatoria de DPD.

No cerrar este punto por inferencia: requiere revisar la forma jurídica y escala real antes de producción.

## 10. Resultado provisional

El tratamiento implica datos de salud y un impacto potencial elevado. Por prudencia, AvanttAI tratará la EIPD como **requisito de go-live** aunque la determinación jurídica final sobre obligatoriedad corresponde al Responsable.

Estado residual global actual: **NO APTO AÚN PARA DATOS CLÍNICOS REALES**, no por el bloque técnico de aislamiento, sino por los controles organizativos/contractuales y de recuperación todavía pendientes.

## 11. Aprobaciones necesarias

- Responsable de la clínica: `[PENDIENTE]`
- DPD/DPO, si existe: `[PENDIENTE]`
- AvanttAI: `[PENDIENTE IDENTIDAD LEGAL]`
- Fecha de aprobación: `[PENDIENTE]`
- Próxima revisión: `[PENDIENTE]`

## Referencias

- AEPD — EIPD: https://www.aepd.es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/realizacion-de-evaluaciones-de
- AEPD — contenido mínimo EIPD: https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/10-evaluacion-de-impacto/FAQ-0229-que-debe-incluir-una-evaluacion-de-impacto-de-proteccion-de-datos
