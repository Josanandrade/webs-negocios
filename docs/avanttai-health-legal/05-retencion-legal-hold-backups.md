# Política de retención, legal hold y recuperación — AvanttAI Health

Fecha de revisión: 27/10/2026

## 1. Principio general

AvanttAI no debe decidir por sí solo cuánto tiempo conserva la Clínica su historia clínica. La Clínica, como Responsable, define y documenta los plazos legales aplicables. AvanttAI implementa esas instrucciones sin permitir borrados que contradigan obligaciones legales o un `legal_hold` activo.

## 2. Historia clínica

Como regla general estatal, la Ley 41/2002, art. 17, exige conservar la documentación clínica en condiciones de seguridad durante el tiempo adecuado a cada caso y **como mínimo cinco años desde la fecha de alta de cada proceso asistencial**, sin perjuicio de obligaciones adicionales estatales/autonómicas o de conservación por razones judiciales.

La política final de cada cliente debe recoger:
- comunidad autónoma y normativa sanitaria aplicable;
- tipo de centro/profesional;
- fecha desde la que empieza a contar cada plazo;
- documentación incluida;
- excepciones por reclamación, investigación, obligación legal o procedimiento judicial.

## 3. Categorías y política provisional

| Categoría | Política de AvanttAI | Estado |
|---|---|---|
| Historia clínica / episodios | No borrar físicamente por acción ordinaria; archivar y conservar según instrucción legal del Responsable | CONTROL TÉCNICO VALIDADO EN TEST |
| Consentimientos/documentos clínicos | Conservar vinculados al proceso correspondiente y a la política de la Clínica | PENDIENTE parametrización final |
| Datos administrativos/facturación | Aplicar el plazo legal/fiscal que determine el Responsable y su asesoría | PENDIENTE política del cliente |
| Auditoría de accesos | Retención suficiente para seguridad, trazabilidad y obligaciones sanitarias aplicables | PENDIENTE fijar plazo final |
| Logs técnicos de aplicación | Minimizar y eliminar cuando dejan de ser necesarios; no incluir payload clínico completo | PENDIENTE automatización |
| Emails transaccionales | Contenido mínimo; respetar retención del proveedor y no usarlos como archivo clínico | DISEÑO |
| Datos de pago | No almacenar tarjeta completa; conservar únicamente referencias/metadatos necesarios | DISEÑO |

## 4. Legal hold

Un `legal_hold` suspende la eliminación normal de datos concretos cuando existe una razón jurídica documentada: reclamación, inspección, litigio, investigación, obligación legal o instrucción del Responsable.

### Datos mínimos del hold

- `hold_id`
- `tenant_id`
- alcance: paciente / episodio / documento / rango temporal
- motivo documentado
- autoridad/persona que lo solicita
- fecha de inicio
- fecha de revisión
- estado: active/released
- fecha y motivo de liberación
- actor que creó/liberó el hold

### Reglas

- un hold activo impide la eliminación definitiva de los objetos incluidos;
- archivar no equivale a borrar;
- liberar un hold no borra automáticamente: devuelve el dato a su política normal de retención;
- toda creación/liberación debe quedar auditada;
- el usuario de clínica debe ver que existe una retención jurídica sin exponer notas internas innecesarias.

## 5. Backup de producción

### Requisito

No lanzar datos clínicos reales sin backup automático verificable.

Supabase indica actualmente:
- Pro: backups automáticos diarios con retención de 7 días;
- Team: 14 días;
- Enterprise: hasta 30 días según servicio;
- PITR es un complemento para RPO más bajo;
- en Free recomiendan realizar exportaciones periódicas externas.

Por tanto, **AvanttAI Health producción no debe depender únicamente de un proyecto Free**.

### Política mínima propuesta para primer cliente

1. Supabase de producción en plan con backups automáticos.
2. Exportación lógica cifrada periódica independiente del proveedor.
3. Copia almacenada fuera de la cuenta/proyecto primario con acceso restringido.
4. Registro de cada backup: fecha, tamaño, resultado y checksum cuando sea viable.
5. Prueba de restauración antes del go-live y después al menos trimestralmente durante el primer año.
6. Objetivos RPO/RTO definidos contractualmente antes de prometerlos al cliente.

## 6. Prueba de restore

La prueba debe realizarse sin sobrescribir producción.

Procedimiento:
1. seleccionar backup o dump de prueba;
2. restaurar en entorno aislado;
3. comprobar esquema/migraciones;
4. verificar conteos de entidades clave;
5. comprobar que documentos/objetos de Storage incluidos en la estrategia también son recuperables;
6. ejecutar tests de autorización/tenant isolation;
7. documentar tiempo total y pérdidas observadas;
8. destruir el entorno temporal de forma controlada cuando termine la prueba.

Importante: los backups de base de datos de Supabase no incluyen necesariamente el contenido de objetos de Storage; la estrategia debe cubrir ambos.

## 7. Fin de contrato con una clínica

Antes de eliminar datos:
1. verificar identidad/autoridad del solicitante;
2. comprobar `legal_hold`;
3. generar exportación para el Responsable si está pactada;
4. confirmar por escrito la instrucción de cierre;
5. archivar evidencia de entrega;
6. eliminar/bloquear conforme a contrato y obligaciones legales;
7. gestionar copias de seguridad conforme a su ciclo de retención y DPA;
8. emitir constancia de cierre.

## 8. Bloqueadores actuales

- plan definitivo de Supabase producción: PENDIENTE;
- política de backup externo: PENDIENTE IMPLEMENTAR;
- primera prueba real de restore: PENDIENTE;
- `legal_hold` técnico: PENDIENTE DISEÑAR/IMPLEMENTAR;
- plazos administrativos/fiscales y auditoría: PENDIENTE VALIDACIÓN LEGAL;

## Referencias

- Ley 41/2002, art. 17: https://www.boe.es/buscar/act.php?id=BOE-A-2002-22188
- Supabase backups: https://supabase.com/docs/guides/platform/backups
