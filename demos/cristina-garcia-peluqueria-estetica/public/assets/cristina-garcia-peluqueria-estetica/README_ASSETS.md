# Fotografía · Cristina García Peluquería & Estética

> Nota de trabajo. `scripts/postbuild.mjs` elimina este archivo de la exportación pública.

## Estado

La demo no lleva ninguna fotografía. No se ha usado stock ni IA.

Booksy publica material propio que sería la primera fuente (foto principal del salón, logo, 5 imágenes de trabajos, 3 fotos de clientes, portafolio por servicio y un retrato por profesional), pero el entorno de trabajo no puede descargar del CDN de Booksy. Instagram y Facebook también están bloqueados.

## Cómo añadir una foto

1. Copia la imagen en esta carpeta (WebP o JPG, mínimo 1600 px de ancho).
2. Añade su entrada en `photos` de `src/content/site.ts`:
   - `salon`: aparece en «Visítanos».
   - `cabello`, `color`, `eventos`, `mirada`, `manos`, `facial`, `cuerpo`, `depilacion`: aparece en la cabecera de su área en la carta.

```ts
export const photos = {
  salon: { src: "/assets/cristina-garcia-peluqueria-estetica/salon.webp", alt: "Zona de tocadores del centro" },
};
```

## Fotos que conviene pedir (por prioridad)

1. Fachada en la Avenida del Aljarafe, con el rótulo.
2. Interior: tocadores y cabina de estética, en horizontal y con luz natural.
3. Equipo: retrato de grupo y un retrato de cada profesional (Cristina, Mercedes, Jennifer, María José, Arantxa).
4. Color y mechas: 3–4 balayage o mechas terminados.
5. Novias: 2–3 peinados y maquillajes de novia o madrina (con permiso).
6. Faciales: cabina y aparatología (Dermapen, ARÛDE) sin clientas.
7. Cejas y pestañas, uñas: primeros planos.
8. Logo en vector (Booksy muestra uno en JPG).

Imprescindible autorización de las personas que aparezcan.
