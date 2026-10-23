# Fincas Encarna · auditoría interna (no se despliega)

Fecha: 2026-10-23. Lote "inmobiliarias sin grandes portales" (6 demos con /panel-demo).

## Negocio
- Razón social: Fincas Encarna Sociedad de Gestión Inmobiliaria S.L., CIF B91375337, constituida 21/06/2004 (BORME 27/09/2004). Último depósito de cuentas 2024, órganos activos (axesor).
- Objeto social: intermediación en compraventa de inmuebles, servicios a entidades bancarias o de crédito y financiación, peritación y tasación de inmuebles. CNAE 6831.
- Dirección: Calle Guadalajara 29 (29-B en QDQ), 41014 Sevilla (Bellavista). Páginas Amarillas da otra: Calle Soria (Bellavista) 5 bis. Usamos Guadalajara (registro + QDQ). **Confirmar.**
- Teléfono: 670 764 040 (QDQ). WhatsApp sin confirmar (es móvil; en `demo-host/assets/data.js`, `config.whatsapp`; vacío oculta los botones).
- Sin web propia, sin redes, sin reseñas ni logo localizados. Sin horario.

## Verificación de portales
Búsquedas por nombre, con y sin site: en idealista.com, fotocasa.es, habitaclia.com, yaencontre.com y pisos.com: ningún resultado de agencia. Los portales bloquean el acceso directo desde el contenedor (403), así que conviene abrir a mano idealista.com/pro y buscar "Fincas Encarna" antes de enviar.

## Fuentes
- https://www.axesor.es/Informes-Empresas/3063723/FINCAS_ENCARNA_SOCIEDAD_DE_GESTION_INMOBILIARIA_SOCIEDAD_LIMITADA.html
- https://www.qdq.com/fincas-encarna-856584
- https://www.paginasamarillas.es/f/sevilla/fincas-encarna-sociedad-de-gestion-inmobiliaria-s-l-_196256127_000000003.html
- empresite / einforma / yelp (listados; no se pudieron abrir)

## Decisiones
- Todos los inmuebles son de ejemplo (EJ-1xx), etiquetados en tarjeta, ficha, panel y pie. Zonas del sur de Sevilla elegidas solo para dar verosimilitud.
- "Valoración y peritación" se presenta como servicio porque está en el objeto social; no se afirma ser tasadora homologada.
- No se usa "Encarna" como persona ni se inventa equipo.
- Panel: estático, sin login, sin cuenta, aviso fijo arriba; las acciones solo muestran un aviso "Simulación". Nada se guarda (ni localStorage).
