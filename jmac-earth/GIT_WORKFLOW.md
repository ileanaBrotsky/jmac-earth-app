# 🌊 JMAC Earth - Plan de Trabajo con Git Flow

## 📅 Estado del Proyecto (19 Nov 2025)

### ✅ Completado
- **feature/hydraulic-calculations**: Endpoint POST /api/v1/calculate con tests de integración (14/14 ✓)

### ⏳ En Progreso
Ninguno actualmente. Todas las features están en estatus de planeación.

---

## 🎯 Estructura de Ramas (Git Flow)

```
main (producción)
  │
  └─ develop (integración)
      │
      ├─ feature/hydraulic-calculations      ✅ COMPLETADO
      ├─ feature/user-authentication         📌 PRÓXIMO
      ├─ feature/project-management          ⏳ DESPUÉS
      ├─ feature/trace-management            ⏳ DESPUÉS
      ├─ feature/export-functionality        ⏳ DESPUÉS
      ├─ feature/fuel-consumption-calc       ⏳ DESPUÉS
      └─ feature/mapping-visualization       ⏳ FRONTEND (ÚLTIMO)
```

---

## 📋 Descripción Detallada de Cada Feature

### 1️⃣ feature/hydraulic-calculations ✅
**Estado**: COMPLETADO Y FUNCIONAL

**Objetivo**: Endpoint REST que calcula la ubicación óptima de bombas y válvulas

**Archivos Principales**:
- `src/interfaces/controllers/HydraulicsController.ts` - Controlador REST
- `src/interfaces/routes/hydraulics.routes.ts` - Rutas y multer config
- `src/application/use-cases/CalculateHydraulicsUseCase.ts` - Orquestación
- `src/domain/services/HydraulicCalculator.ts` - Cálculos matemáticos
- `tests/integration/api/hydraulics.integration.test.ts` - 14 tests ✓

**Pasos Ejecutados**:
1. ✅ Crear HydraulicCalculator con logging y bounds checking
2. ✅ Crear CalculateHydraulicsUseCase stateless
3. ✅ Crear HydraulicsController con validaciones
4. ✅ Crear rutas con multer para archivos KMZ
5. ✅ Crear 14 tests de integración (todos pasan)

**Tests**: 14/14 PASS ✓

---

### 2️⃣ feature/user-authentication 📌 PRÓXIMO
**Objetivo**: Implementar autenticación JWT y control de acceso

**Casos de Uso**:
- Registrar nuevo usuario (POST /api/v1/auth/register)
- Login (POST /api/v1/auth/login)
- Refresh token (POST /api/v1/auth/refresh)
- Logout (POST /api/v1/auth/logout)
- Validar token (middleware)

**Archivos a Crear**:
- `src/application/use-cases/RegisterUserUseCase.ts`
- `src/application/use-cases/LoginUserUseCase.ts`
- `src/interfaces/controllers/AuthController.ts`
- `src/interfaces/routes/auth.routes.ts`
- `src/infrastructure/middleware/auth.middleware.ts`
- `tests/integration/api/auth.integration.test.ts`

**Criterio de Aceptación**:
- [ ] Endpoint register valida email duplicado
- [ ] Endpoint login retorna JWT válido
- [ ] Middleware valida token en requests posteriores
- [ ] Logout invalida token
- [ ] Todos los tests pasan (>15 tests)

---

### 3️⃣ feature/project-management
**Objetivo**: CRUD completo de proyectos de hidráulica

**Casos de Uso**:
- Crear proyecto (POST /api/v1/projects)
- Listar proyectos del usuario (GET /api/v1/projects)
- Obtener proyecto específico (GET /api/v1/projects/:id)
- Actualizar proyecto (PUT /api/v1/projects/:id)
- Eliminar proyecto (DELETE /api/v1/projects/:id)
- Compartir proyecto (POST /api/v1/projects/:id/share)

**Archivos a Crear**:
- `src/domain/entities/Project.ts` (actualizar si existe)
- `src/application/use-cases/CreateProjectUseCase.ts`
- `src/application/use-cases/ListProjectsUseCase.ts`
- `src/interfaces/controllers/ProjectController.ts`
- `src/interfaces/routes/projects.routes.ts`
- `tests/integration/api/projects.integration.test.ts`

---

### 4️⃣ feature/trace-management
**Objetivo**: Gestionar trazas (rutas de mangueras) dentro de proyectos

**Casos de Uso**:
- Subir y procesar archivo KMZ (POST /api/v1/projects/:id/traces)
- Listar trazas del proyecto (GET /api/v1/projects/:id/traces)
- Obtener detalles de traza (GET /api/v1/projects/:id/traces/:traceId)
- Eliminar traza (DELETE /api/v1/projects/:id/traces/:traceId)
- Ejecutar cálculo sobre traza (POST /api/v1/projects/:id/traces/:traceId/calculate)

**Archivos a Crear**:
- `src/domain/entities/Trace.ts` (actualizar si existe)
- `src/application/use-cases/ProcessTraceUseCase.ts`
- `src/interfaces/controllers/TraceController.ts`
- `src/interfaces/routes/traces.routes.ts`

---

### 5️⃣ feature/export-functionality
**Objetivo**: Exportar resultados en múltiples formatos

**Casos de Uso**:
- Exportar a PDF (POST /api/v1/traces/:id/export/pdf)
- Exportar a KMZ (POST /api/v1/traces/:id/export/kmz)
- Exportar a Excel (POST /api/v1/traces/:id/export/excel)

**Librerías a Usar**:
- `pdfkit` para PDF
- `jszip` (ya instalada) para KMZ
- `exceljs` para Excel

---

### 6️⃣ feature/fuel-consumption-calc
**Objetivo**: Calcular consumo de combustible del bombeo

**Fórmulas**:
- Potencia = (presión × caudal) / eficiencia
- Consumo = Potencia × tiempo / PCI_combustible
- Considera tipo de bomba, antigüedad, condiciones

**Casos de Uso**:
- Calcular consumo (POST /api/v1/fuel-consumption)
- Obtener historial de consumo (GET /api/v1/projects/:id/fuel-history)
- Optimizar consumo (POST /api/v1/projects/:id/optimize-fuel)

---

### 7️⃣ feature/mapping-visualization (FRONTEND)
**Objetivo**: Interfaz web interactiva con mapas

**Tecnologías**: React + Leaflet/Mapbox + TypeScript

**Funcionalidades**:
- Mapa interactivo con trazas
- Mostrar ubicación de bombas y válvulas
- Click en elementos para ver detalles
- Cargar archivo KMZ drag-and-drop
- Responsive design (mobile-friendly)
- Exportar vista a imagen

---

## 🔄 Flujo de Trabajo Propuesto

### Para Cada Feature

1. **Crear rama local**:
   ```bash
   git checkout feature/nombre
   ```

2. **Desarrollar con commits frecuentes**:
   ```bash
   git add .
   git commit -m "type: descripción breve"
   ```

3. **Push a origin**:
   ```bash
   git push origin feature/nombre
   ```

4. **Crear Pull Request en GitHub**:
   - Base: `develop`
   - Comparar: `feature/nombre`
   - Descripción: casos de uso, archivos modificados, tests

5. **Review y Merge**:
   - Verificar todos los tests pasen
   - Al menos un código review
   - Mergear a `develop`

6. **Delete rama remota**:
   ```bash
   git push origin --delete feature/nombre
   ```

---

## 📊 Convención de Commits

```
feat(auth): agregar endpoint de login
fix(hydraulics): corregir cálculo de presión
docs(readme): actualizar instrucciones
refactor(calculator): simplificar lógica
test(integration): agregar tests para auth
chore(deps): actualizar dependencias
```

---

## ✅ Checklist por Feature

### Requisitos Mínimos
- [ ] Código implementado
- [ ] Tests unitarios (>70% de cobertura)
- [ ] Tests de integración (happy path + error cases)
- [ ] Validaciones de entrada
- [ ] Error handling robusto
- [ ] Documentación en código (JSDoc)
- [ ] Sin lint errors

### Antes de Mergear a Develop
- [ ] `npm test` pasa 100%
- [ ] `npm run lint` sin errores
- [ ] Code review aprobado
- [ ] Ramas sin conflictos

---

## 📞 Contacto & Soporte

**Equipo**: IBeyond  
**Cliente**: JMAC Servicios  
**Stack**: Node.js + TypeScript + PostgreSQL  
**Documentación Técnica**: Ver README.md en cada carpeta

---

*Documento de configuración creado el 19 de noviembre de 2025*
