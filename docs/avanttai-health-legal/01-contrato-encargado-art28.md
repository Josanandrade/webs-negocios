# Plantilla — Acuerdo de Encargo de Tratamiento (art. 28 RGPD)

> Documento de trabajo. Debe completarse con los datos legales de las partes y revisarse antes de firma.

## 1. Partes

**Responsable del tratamiento**
- Nombre / razón social: `[CLÍNICA]`
- NIF/CIF: `[PENDIENTE]`
- Domicilio: `[PENDIENTE]`
- Representante: `[PENDIENTE]`
- Contacto de privacidad / DPD: `[PENDIENTE]`

**Encargado del tratamiento**
- Nombre / razón social: `AvanttAI / [IDENTIDAD LEGAL DEFINITIVA]`
- NIF/CIF: `[PENDIENTE HASTA ALTA/CONSTITUCIÓN]`
- Domicilio: `[PENDIENTE]`
- Contacto de privacidad: `[PENDIENTE]`

## 2. Objeto y duración

El Encargado prestará a la Clínica servicios de software para gestión de pacientes, agenda, reservas, documentación clínica, consentimientos, cobros y funcionalidades auxiliares contratadas.

El tratamiento durará mientras esté vigente la relación contractual y durante los periodos posteriores necesarios para devolución, bloqueo, conservación legal o eliminación conforme a instrucciones documentadas y normativa aplicable.

## 3. Naturaleza y finalidad

Operaciones previstas, según módulos contratados:
- recogida y registro;
- consulta y organización;
- modificación;
- almacenamiento;
- generación y descarga de documentos;
- gestión de citas y comunicaciones transaccionales;
- registro de cobros y metadatos de pago;
- archivo, restauración, exportación y eliminación controlada;
- auditoría de accesos y seguridad.

AvanttAI no utilizará los datos para fines propios incompatibles con las instrucciones documentadas de la Clínica.

## 4. Categorías de interesados

- Pacientes.
- Representantes legales, tutores o personas autorizadas.
- Profesionales sanitarios y personal autorizado de la Clínica.

## 5. Categorías de datos

Según configuración del cliente:
- Identificación y contacto.
- Datos de citas y relación asistencial.
- Datos de salud y documentación clínica, categoría especial de datos.
- Consentimientos y firmas.
- Datos administrativos y de facturación.
- Metadatos de pago; AvanttAI no debe almacenar datos completos de tarjeta.
- Registros de acceso, seguridad y auditoría.

## 6. Instrucciones del Responsable

El Encargado tratará los datos únicamente siguiendo instrucciones documentadas del Responsable, salvo obligación legal aplicable. Si AvanttAI considera que una instrucción infringe la normativa de protección de datos, lo comunicará al Responsable antes de ejecutarla cuando legalmente sea posible.

## 7. Confidencialidad y acceso

AvanttAI garantizará que las personas autorizadas a tratar datos:
- acceden solo cuando sea necesario;
- están sujetas a deber de confidencialidad;
- reciben instrucciones adecuadas;
- usan credenciales individuales y controles de acceso acordes con su función.

## 8. Medidas técnicas y organizativas

Como mínimo:
- aislamiento por clínica/tenant;
- autorización deny-by-default;
- control de acceso por rol y capacidades;
- revocación de accesos;
- cifrado en tránsito y controles del proveedor sobre cifrado en reposo;
- auditoría de accesos;
- protección frente a eliminación física accidental de registros clínicos;
- segregación entre TEST y producción;
- gestión de secretos fuera del código cliente;
- copias de seguridad y procedimiento de restauración en producción;
- pruebas previas a despliegues y control de cambios;
- procedimiento de incidentes y brechas.

Las medidas se revisarán en función del riesgo y evolución técnica.

## 9. Subencargados

La Clínica concede autorización general para utilizar los subencargados incluidos en el registro vigente de AvanttAI, sujeto a:
- contrato o DPA adecuado con cada proveedor;
- obligaciones de protección equivalentes;
- información previa al Responsable sobre incorporaciones o sustituciones materiales cuando proceda;
- posibilidad de objeción razonada en los términos contractuales aplicables.

Registro inicial previsto: Supabase, Railway, Resend, Stripe y los proveedores adicionales que lleguen a procesar datos personales del servicio.

## 10. Transferencias internacionales

AvanttAI documentará la ubicación y mecanismos de transferencia internacional aplicables a cada proveedor. Cuando exista transferencia fuera del EEE, se utilizará un mecanismo válido, incluidas Cláusulas Contractuales Tipo cuando corresponda, junto con las garantías adicionales necesarias.

## 11. Derechos de los interesados

AvanttAI asistirá a la Clínica, teniendo en cuenta la naturaleza del tratamiento, para atender solicitudes de acceso, rectificación, supresión, oposición, limitación y portabilidad cuando resulten aplicables.

AvanttAI no responderá por su cuenta a una solicitud relativa a datos controlados por la Clínica salvo autorización o exigencia legal.

## 12. Brechas de datos personales

AvanttAI notificará a la Clínica **sin dilación indebida** cualquier brecha de datos personales de la que tenga constancia y facilitará la información disponible para que el Responsable valore sus obligaciones de notificación.

Objetivo operativo interno de AvanttAI: primera comunicación al cliente dentro de las primeras 12 horas desde la confirmación razonable de una brecha que afecte a sus datos, sin esperar a disponer de todos los detalles.

La decisión y obligación de notificar a la AEPD y, en su caso, a los afectados corresponde al Responsable, salvo que se haya pactado expresamente que AvanttAI actúe en su nombre.

## 13. EIPD, consultas y cumplimiento

AvanttAI facilitará la información técnica razonablemente necesaria para la EIPD/DPIA del Responsable, auditorías, consultas previas y demostración de cumplimiento.

## 14. Auditorías

AvanttAI pondrá a disposición del Responsable información suficiente para demostrar el cumplimiento de sus obligaciones como encargado y permitirá auditorías razonables, respetando la seguridad de otros clientes y los secretos empresariales.

## 15. Fin del servicio

Al finalizar el servicio, y según instrucciones documentadas del Responsable y obligaciones legales:
- se facilitará la exportación o devolución de los datos;
- se eliminarán o bloquearán los datos que ya no deban mantenerse;
- se preservarán únicamente los datos sujetos a obligación legal o `legal_hold` documentado;
- se mantendrá evidencia de la operación de cierre.

## 16. Responsabilidad y prevalencia

Este acuerdo forma parte del contrato principal del servicio. En materia de protección de datos prevalecerá este acuerdo sobre disposiciones incompatibles del contrato comercial.

## Anexo A — Tratamiento concreto por cliente

- Clínica: `[PENDIENTE]`
- Módulos contratados: `[PENDIENTE]`
- Profesionales autorizados: `[PENDIENTE]`
- Categorías de pacientes: `[PENDIENTE]`
- Servicios de email: `[PENDIENTE]`
- Pasarela de pago: `[PENDIENTE]`
- Integraciones externas: `[PENDIENTE]`
- Política de conservación aplicable: `[PENDIENTE]`
- Contacto de incidentes 24/7 o equivalente: `[PENDIENTE]`

## Referencias

- RGPD art. 28.
- AEPD, contenido del contrato de encargo: https://www.aepd.es/preguntas-frecuentes/2-tus-obligaciones-como-responsable-del-tratamiento/8-responsable-y-encargado-del-tratamiento/FAQ-0238-cual-seria-el-contenido-del-contrato-de-encargo-de-tratamiento
