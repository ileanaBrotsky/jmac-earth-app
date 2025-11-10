#!/bin/bash
# =============================================================================
# Script de Inicialización de PostgreSQL
# =============================================================================
# Este script se ejecuta automáticamente cuando el contenedor de PostgreSQL
# se inicia por primera vez.
# 
# Crea las bases de datos necesarias:
# - jmac_earth_dev (desarrollo) - Ya se crea por POSTGRES_DB
# - jmac_earth_test (testing)
# =============================================================================

set -e

echo "🔧 Inicializando bases de datos..."

# Crear base de datos de test
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Crear base de datos de test
    CREATE DATABASE jmac_earth_test;
    
    -- Dar permisos
    GRANT ALL PRIVILEGES ON DATABASE jmac_earth_test TO postgres;
    
    -- Listar bases de datos creadas
    \l
EOSQL

echo "✅ Bases de datos inicializadas correctamente"
echo "   - jmac_earth_dev (desarrollo)"
echo "   - jmac_earth_test (testing)"