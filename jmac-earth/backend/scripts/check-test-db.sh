#!/bin/bash

echo "🔍 Verificando BD de test..."

# Verificar que PostgreSQL está corriendo
if ! docker ps | grep -q jmac_earth_postgres; then
    echo "❌ PostgreSQL no está corriendo"
    echo "Ejecuta: npm run docker:up"
    exit 1
fi

# Verificar que la tabla users existe en test
if ! docker exec jmac_earth_postgres psql -U postgres -d jmac_earth_test -c "\d users" &>/dev/null; then
    echo "⚠️  Tabla 'users' no existe en BD de test"
    echo "Ejecutando migración..."
    npx cross-env NODE_ENV=test npm run migration:run
fi

echo "✅ BD de test lista"