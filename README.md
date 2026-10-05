# Webs Negocios

Repositorio de captación y demostraciones web de AvanttAI.

## Objetivo

Este repositorio agrupa las webs demo creadas para negocios potenciales. Las demos viven aquí mientras sean proyectos comerciales o de prueba. Cuando una demo se convierte en cliente real, debe promocionarse a un repositorio independiente y dejar de evolucionar aquí como web de producción.

## Estructura

```text
webs-negocios/
├── demos/                  # Una aplicación independiente por negocio
│   └── eferos/             # Primera demo
├── starters/               # Bases reutilizables por tipo de negocio
├── shared/                 # Recursos reutilizables no sensibles
└── README.md
```

## Convenciones

- Cada negocio debe vivir en `demos/<slug-negocio>/`.
- Cada demo debe ser ejecutable y desplegable de forma independiente.
- No compartir secretos, variables de entorno, bases de datos ni credenciales entre demos.
- Los `.env` reales nunca se versionan. Usar `.env.example` cuando sea necesario documentar variables.
- Evitar dependencias fuertes entre demos: `shared/` puede contener referencias o recursos reutilizables, pero una demo debe poder extraerse del monorepo sin romperse.
- Nombres de carpetas en minúsculas y kebab-case.

## Flujo demo → cliente

1. Crear la web en `demos/<negocio>/`.
2. Iterar y desplegarla como demo comercial.
3. Si el negocio se convierte en cliente, crear un repositorio independiente con la convención `client-<negocio>-web`.
4. Copiar/migrar la aplicación completa a ese repositorio.
5. A partir de ese momento, producción y mantenimiento viven exclusivamente en el repositorio del cliente.

## Primera demo

Eferos debe desarrollarse en:

```text
demos/eferos/
```
