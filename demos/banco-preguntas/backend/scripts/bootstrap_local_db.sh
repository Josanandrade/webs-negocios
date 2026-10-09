#!/usr/bin/env bash
# Crea la base de datos local y el rol restringido de la API, y aplica migraciones.
# Uso: ./scripts/bootstrap_local_db.sh   (requiere psql y un Postgres con pgvector)
set -euo pipefail
ADMIN_URL="${ADMIN_URL:-postgresql://postgres:postgres@localhost:5432/postgres}"
DB_NAME="${DB_NAME:-banco}"
APP_PASSWORD="${APP_PASSWORD:-banco_api}"

psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -tc "select 1 from pg_database where datname = '$DB_NAME'" | grep -q 1 \
  || psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -c "create database \"$DB_NAME\""
psql "$ADMIN_URL" -v ON_ERROR_STOP=1 -c "do \$\$ begin if not exists (select 1 from pg_roles where rolname = 'banco_api') then create role banco_api login password '$APP_PASSWORD' nosuperuser nobypassrls; end if; end \$\$;"

cd "$(dirname "$0")/.."
.venv/bin/python -m app.migrate
psql "${ADMIN_URL%/*}/$DB_NAME" -v ON_ERROR_STOP=1 -c "grant banco_app to banco_api; grant connect on database \"$DB_NAME\" to banco_api;"
echo "Base de datos '$DB_NAME' lista."
