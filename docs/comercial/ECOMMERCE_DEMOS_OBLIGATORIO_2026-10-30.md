# Webs Negocios — Reglas obligatorias para demos ecommerce

Fecha: 30/10/2026

Estas reglas son obligatorias para todas las demos de tiendas online a partir de esta fecha y complementan `ESTANDAR_DEMOS_DEFINITIVO_2026-10-29.md`.

## 1. Panel de administración obligatorio

Toda demo ecommerce debe incluir un panel de administración funcional dentro de la propia demo.

El panel no puede ser una imagen ni una maqueta estática. Debe permitir como mínimo:

- visualizar el catálogo;
- buscar y filtrar productos;
- consultar stock;
- modificar productos y stock;
- añadir productos;
- visualizar pedidos recibidos;
- cambiar el estado de un pedido.

La tienda debe incluir un acceso discreto al área privada/admin, como tendría una web real, sin convertir la web pública en una presentación comercial.

## 2. Compra simulada real

La tienda pública debe permitir completar un flujo de compra simulado de principio a fin:

- elegir producto;
- seleccionar variante o talla cuando proceda;
- añadir al carrito;
- modificar cantidades;
- visualizar total;
- introducir datos de cliente;
- elegir modalidad de entrega;
- elegir modalidad de pago;
- confirmar el pedido.

No basta con mostrar un mensaje de éxito sin guardar información.

## 3. Sincronización tienda → admin

Al confirmar una compra simulada:

- debe crearse un pedido real en el estado de la demo;
- el pedido debe aparecer en el panel admin;
- debe incluir cliente, artículos, cantidades, variantes/tallas, total, entrega, pago, fecha y estado;
- el stock debe actualizarse;
- los contadores del panel deben actualizarse;
- el admin debe poder avanzar el pedido por estados.

La sincronización puede implementarse con estado local compartido para demos estáticas, siempre que funcione correctamente en el navegador y sea demostrable al lead.

## 4. Regla de aceptación

Una demo ecommerce no se considera terminada hasta que se haya probado este recorrido completo:

1. abrir tienda;
2. añadir producto;
3. completar compra;
4. abrir panel admin;
5. comprobar que aparece el pedido;
6. comprobar que baja el stock;
7. cambiar estado del pedido;
8. volver a la tienda y comprobar que los cambios de catálogo/stock persisten.

Si cualquiera de estos pasos falla, la demo no está lista para enviar.
