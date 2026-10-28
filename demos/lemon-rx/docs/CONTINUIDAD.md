# Lemon RX — Continuidad

## 2026-10-28 — RM en HOME con consentimiento explícito

Cambio implementado y desplegado en preview, pendiente de validación funcional por el usuario antes de marcarlo como validado:

- Los nuevos RM se detectan y guardan igual que antes.
- La felicitación aparece al atleta, pero el logro queda privado por defecto.
- El popup incluye la opción `Compartir este logro en HOME`, desmarcada por defecto.
- Si no se marca, el RM permanece guardado y no se publica.
- Si se marca, el logro se añade al post social del día y reutiliza las reacciones y comentarios existentes.
- Las publicaciones de RM creadas antes de este cambio permanecen visibles y no se modifican.
- Prueba transaccional realizada: creación privada -> compartir -> aparición social -> rollback sin residuos.

No considerar este punto cerrado hasta validación manual en productivo.
