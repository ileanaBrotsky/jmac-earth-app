#!/bin/bash

# =============================================================================
# Script de Verificación - JMAC Earth Backend
# =============================================================================
# Este script verifica que todos los archivos estén en su lugar antes de
# ejecutar los tests.
# 
# Uso: bash verify.sh
# =============================================================================

echo "🔍 Verificando estructura del proyecto..."
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 ${RED}(FALTA)${NC}"
        ((ERRORS++))
    fi
}

# Función para verificar directorio
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
    else
        echo -e "${RED}✗${NC} $1/ ${RED}(FALTA)${NC}"
        ((ERRORS++))
    fi
}

echo "📁 Archivos de configuración:"
check_file "package.json"
check_file "tsconfig.json"
check_file "jest.config.cjs"
check_file ".env.example"
check_file ".gitignore"
echo ""

echo "📁 Directorios principales:"
check_dir "src"
check_dir "src/domain"
check_dir "src/domain/value-objects"
check_dir "tests"
check_dir "tests/unit"
check_dir "tests/unit/domain"
check_dir "tests/unit/domain/value-objects"
echo ""

echo "📁 Value Objects:"
check_file "src/domain/value-objects/Email.ts"
check_file "src/domain/value-objects/Role.ts"
echo ""

echo "📁 Tests:"
check_file "tests/setup.ts"
check_file "tests/unit/domain/value-objects/Email.test.ts"
check_file "tests/unit/domain/value-objects/Role.test.ts"
echo ""

# Verificar si node_modules existe
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules/ (dependencias instaladas)"
else
    echo -e "${YELLOW}⚠${NC} node_modules/ ${YELLOW}(NO INSTALADO - ejecuta 'npm install')${NC}"
fi
echo ""

# Resultado final
echo "=============================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Verificación completada exitosamente!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Si no instalaste dependencias: npm install"
    echo "2. Ejecutar tests: npm test"
    echo "3. Verificar compilación: npx tsc --noEmit"
else
    echo -e "${RED}✗ Faltan $ERRORS archivo(s) o directorio(s)${NC}"
    echo ""
    echo "Por favor verifica que copiaste todos los archivos correctamente."
fi
echo "=============================================="
