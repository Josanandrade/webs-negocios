# Webs Negocios — Estándar definitivo de demos

Fecha de fijación: 29/10/2026

Este documento deja fijada como **forma de trabajo obligatoria** para todas las demos futuras de Webs Negocios el nivel alcanzado en la tanda de 10 demos creada el 29/10/2026.

No es una referencia opcional. Es el estándar operativo por defecto para cualquier lead nuevo.

## Regla principal

**No se crean demos rápidas, genéricas ni basadas en una plantilla con cambios cosméticos.**

Cada lead debe recibir una demo que parezca diseñada específicamente para ese negocio, con dirección artística propia, movimiento útil, composición cuidada, copy real para cliente final y acabado suficiente para que el propietario pueda imaginarla como su web definitiva.

La velocidad nunca tiene prioridad sobre la personalización ni sobre la calidad visual.

## Benchmark interno

La referencia mínima de calidad son las 10 demos de la tanda cerrada el 29/10/2026:

- `demos/neumarubio-sevilla/`
- `demos/sisdac-sl/`
- `demos/asador-de-tomares/`
- `demos/bodega-mairena/`
- `demos/bar-kora-bormujos/`
- `demos/da-teresa/`
- `demos/maresa/`
- `demos/papeleria-libreria-bormuletras/`
- `demos/papeleria-merlin/`
- `demos/papeleria-aldebaran/`

Estas demos son una referencia de **nivel de intención, personalización y dinamismo**, no plantillas para copiar.

## Flujo obligatorio para cada lead

### 1. Investigar antes de diseñar

Antes de escribir código se revisa la identidad pública disponible del negocio:

- nombre y posicionamiento;
- logotipo y rótulo;
- colores y estética;
- Instagram, Facebook, Google y web actual si existe;
- fotografías públicas útiles;
- servicios o productos reales;
- ubicación;
- reseñas y elementos de confianza;
- tipo de cliente;
- tono de comunicación.

Nunca se empieza una demo únicamente con el nombre y el sector.

### 2. Definir una dirección artística propia

Antes de construir, decidir deliberadamente:

- concepto visual;
- tono de marca;
- composición del hero;
- tipografía y escala;
- sistema de color;
- ritmo de secciones;
- forma de mostrar servicios/productos;
- tratamiento de imágenes;
- CTAs;
- motion e interacción.

Si existen varios leads del mismo sector, se deben plantear **lenguajes visuales diferentes desde el principio**.

Dos restaurantes, talleres, clínicas, academias o papelerías nunca deben convertirse en variaciones evidentes de una misma plantilla.

### 3. Construir una web real, no una presentación comercial

La demo debe hablar exclusivamente al cliente final del negocio.

Dentro de la web está prohibido explicar:

- por qué al negocio le conviene tener una web;
- qué podría conseguir con una web;
- que estamos enseñando una propuesta;
- qué secciones podríamos añadir;
- que la versión final sería diferente.

La demo **debe ser la web**, no explicar la web.

### 4. Copy realista y verificado

Usar información pública comprobada.

No inventar:

- servicios;
- horarios;
- precios;
- años de experiencia;
- equipo;
- premios;
- certificaciones;
- garantías;
- cifras;
- promociones.

Cuando falte información, usar copy comercial neutro y creíble.

### 5. Dinamismo obligatorio con intención

Cada demo debe sentirse viva.

Incorporar, cuando tenga sentido:

- reveal al hacer scroll;
- hover states trabajados;
- transiciones suaves;
- elementos reactivos al cursor o scroll;
- sliders o galerías navegables;
- marquees;
- microinteracciones en CTA y tarjetas;
- cambios de estado visual;
- composiciones animadas propias del concepto.

El motion no se añade por decoración. Debe reforzar la identidad del negocio y mejorar la experiencia.

### 6. No reutilizar layouts completos

Se pueden reutilizar utilidades técnicas, patrones de accesibilidad o pequeños helpers.

No se reutiliza como base reconocible:

- el mismo hero;
- el mismo orden de secciones;
- el mismo grid de cards;
- la misma composición;
- las mismas animaciones principales;
- la misma estética cambiando únicamente colores y textos.

Test obligatorio: si se ocultara el nombre del negocio y dos demos parecieran la misma web, una de ellas debe rediseñarse.

## Control de calidad antes de publicar

Ninguna demo se añade al panel ni se marca como lista hasta comprobar:

1. Se entiende qué negocio es en pocos segundos.
2. La primera pantalla tiene identidad propia.
3. Todo el contenido habla al cliente final.
4. No existe copy meta sobre la propia web o la propuesta comercial.
5. Los servicios y datos utilizados son reales o neutros, nunca inventados.
6. Los CTA son claros y funcionan.
7. Existe interacción/motion de calidad donde aporta valor.
8. La demo se diferencia visualmente de las últimas demos creadas.
9. No hay overflow, solapes ni textos cortados.
10. Funciona correctamente en escritorio.
11. Funciona correctamente en móvil.
12. La ruta pública en producción responde correctamente.
13. La versión revisada en producción es la misma que se mostrará al lead.

## Orden de trabajo para tandas

Para una tanda de varios leads:

1. Investigar todos los negocios.
2. Definir las direcciones artísticas antes de construir.
3. Comparar las direcciones para evitar repetición.
4. Construir cada demo de forma individual.
5. Hacer test anti-plantilla entre todas.
6. Hacer QA escritorio/móvil.
7. Publicar en producción.
8. Comprobar las URLs públicas.
9. Solo entonces añadirlas al panel como listas para enviar.

## Qué NO volver a hacer

Queda descartado como forma de trabajo:

- producir muchas demos deprisa con un renderer común;
- cambiar únicamente nombre, color e iconos;
- usar el mismo hero para varios leads;
- copiar el mismo orden de secciones;
- publicar antes de revisar visualmente;
- llamar “personalizada” a una demo que podría enviarse a otro negocio cambiando el nombre;
- sacrificar calidad para terminar una tanda antes.

## Criterio de aceptación

Una demo solo está terminada cuando cumple esta frase:

> **El propietario debería poder verla y pensar: “Esto podría ser perfectamente nuestra nueva web”.**

Si no produce esa sensación, todavía no está terminada.

## Regla permanente

Este estándar se aplica a **todos los leads nuevos de Webs Negocios a partir del 29/10/2026**, salvo que Jose pida explícitamente cambiarlo para un caso concreto.

Los requisitos de `REQUISITOS_DEMOS.md` siguen vigentes. Este documento los refuerza y fija el nivel de la tanda de 10 demos del 29/10/2026 como benchmark mínimo para el trabajo futuro.
