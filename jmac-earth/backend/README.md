# 🚰 JMAC Earth Backend

Sistema de cálculos hidráulicos para distribución de agua mediante mangueras flexibles.

**Cliente:** JMAC Servicios  
**Desarrollado por:** IBeyond  
**Stack:** Node.js + TypeScript + PostgreSQL + TypeORM  
**Arquitectura:** Clean Architecture

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Arquitectura](#️-arquitectura)
- [Tecnologías](#-tecnologías)
- [Setup Inicial](#-setup-inicial)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Testing](#-testing)
- [Base de Datos](#-base-de-datos)
- [Convenciones de Código](#-convenciones-de-código)
- [Roles y Permisos](#-roles-y-permisos)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Descripción del Proyecto

### Objetivo General
Automatizar los **cálculos hidráulicos** que permiten determinar la ubicación óptima de bombas y válvulas reguladoras de presión sobre trazas de mangueras flexibles utilizadas en la distribución de agua.

### Problema que Resuelve
Actualmente, JMAC realiza estos cálculos manualmente usando:
- Google Earth Pro (trazas y elevaciones)
- Excel (fórmulas hidráulicas)
- Conversión manual KMZ → GPX → TXT → Excel

**Resultado:** Proceso lento, propenso a errores, sin trazabilidad.

### Solución
Aplicación web que:
- ✅ Carga archivos KMZ automáticamente
- ✅ Calcula ubicación de bombas y válvulas
- ✅ Muestra resultados en mapa interactivo
- ✅ Exporta a PDF y KMZ
- ✅ Calcula consumo de combustible
- ✅ Control de acceso por roles

---

## 🏗️ Arquitectura

Este proyecto sigue **Clean Architecture** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────┐
│   Presentation Layer (Controllers/Routes)       │
│                    ↓                            │
│   Application Layer (Use Cases/Services)        │
│                    ↓                            │
│   Domain Layer (Entities/Value Objects)         │
│                    ↓                            │
│   Infrastructure Layer (DB/External Services)   │
└─────────────────────────────────────────────────┘
```

### Principios Aplicados

1. **Dependency Inversion**: Capas externas dependen de las internas
2. **Single Responsibility**: Cada clase tiene una única razón para cambiar
3. **Open/Closed**: Abierto para extensión, cerrado para modificación
4. **Liskov Substitution**: Implementaciones son intercambiables
5. **Interface Segregation**: Interfaces específicas por necesidad

### Beneficios

- ✅ **Testeable**: Cada capa se puede testear independientemente
- ✅ **Mantenible**: Cambios localizados por responsabilidad
- ✅ **Escalable**: Fácil agregar nuevas features sin romper existentes
- ✅ **Independiente de frameworks**: Lógica de negocio pura

---

## 💻 Tecnologías

### Backend
- **Runtime:** Node.js 18+
- **Lenguaje:** TypeScript 5.x
- **Framework Web:** Express 4.x
- **ORM:** TypeORM 0.3.x
- **Base de Datos:** PostgreSQL 15
- **Testing:** Jest 29.x
- **Validación:** express-validator + class-validator
- **Autenticación:** JWT (jsonwebtoken)
- **Seguridad:** helmet, bcryptjs, express-rate-limit

### DevOps
- **Containerización:** Docker + Docker Compose
- **Control de Versiones:** Git
- **CI/CD:** (Por implementar)

### Herramientas de Desarrollo
- **Linting:** ESLint 9.x
- **Type Checking:** TypeScript strict mode
- **Testing:** Jest + Supertest (integration)
- **Coverage:** >85% requerido

---

## 🚀 Setup Inicial

### Prerequisitos

- **Node.js**: 18.x o superior
- **npm**: 9.x o superior
- **Docker**: 20.x o superior
- **Docker Compose**: 2.x o superior
- **Git**: 2.x o superior

### Instalación Paso a Paso

#### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd jmac-earth/backend
```

#### 2. Instalar dependencias

```bash
npm install
```

#### 3. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales (opcional, valores por defecto funcionan)
nano .env
```

**Variables principales:**
```env
NODE_ENV=development
PORT=3000

# Database (valores por defecto de Docker)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jmac_earth_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_TEST_NAME=jmac_earth_test

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Admin por defecto
DEFAULT_ADMIN_EMAIL=admin@jmac.com
DEFAULT_ADMIN_PASSWORD=Admin123!
DEFAULT_ADMIN_USERNAME=admin
```

#### 4. Iniciar Docker y ejecutar migraciones

```bash
# Opción A: Setup completo automático (RECOMENDADO)
npm run db:setup

# Opción B: Paso a paso manual
npm run docker:up          # Iniciar PostgreSQL
sleep 10                   # Esperar que PostgreSQL esté listo
npm run migration:run      # Migración en desarrollo
npm run migration:run:test # Migración en test
```

#### 5. Verificar instalación

```bash
# Verificar que Docker está corriendo
docker ps

# Deberías ver:
# - jmac_earth_postgres (PostgreSQL)
# - jmac_earth_pgadmin (pgAdmin - opcional)

# Verificar tablas en desarrollo
npm run docker:db
# Dentro de psql:
\dt
\d users
\q

# Ejecutar tests
npm test

# Deberías ver: 4 test suites passed, 122+ tests passed
```

#### 6. Iniciar servidor de desarrollo

```bash
npm run dev

# Servidor corriendo en: http://localhost:3000
```

## 🧭 Frontend

La carpeta `../frontend` contiene la SPA de React que consume `/api/v1/projects`. Consulta `frontend/README.md` para conocer:

- cómo configurar la variable `VITE_API_URL` (por defecto `http://localhost:3000/api/v1`)
- qué scripts están disponibles (`dev`, `build`, `test`)
- la necesidad de contar con Node.js 20.19+ (Vite y Vitest no arrancan en versiones anteriores).

Para levantar el frontend contra este backend:

```bash
cd ../frontend
npm install
npm run dev
```

El frontend comparte la misma base de datos en dev (puede usar la API de Docker). Asegúrate de tener el backend iniciado antes de subir un KMZ.

---

## 📦 Scripts Disponibles

### Base de Datos y Docker

```bash
# Gestión de Docker
npm run docker:up              # Iniciar PostgreSQL y pgAdmin
npm run docker:down            # Detener contenedores
npm run docker:logs            # Ver logs en tiempo real
npm run docker:reset           # Reiniciar desde cero (elimina datos)
npm run docker:db              # Conectar a BD de desarrollo
npm run docker:db:test         # Conectar a BD de test

# Setup y Reset de Base de Datos
npm run db:setup              # Setup completo (Docker + Migraciones dev + test)
npm run db:reset              # Reset completo (elimina todo y recrea)
```

### Migraciones

```bash
npm run migration:run          # Ejecutar migraciones en desarrollo
npm run migration:run:test     # Ejecutar migraciones en test
npm run migration:revert       # Revertir última migración
npm run migration:show         # Ver estado de migraciones
npm run migration:generate     # Generar nueva migración (auto)
```

### Testing

```bash
npm test                       # Todos los tests + coverage
npm run test:watch             # Tests en modo watch
npm run test:unit              # Solo tests unitarios
npm run test:integration       # Solo tests de integración
npm run test:e2e               # Tests end-to-end (cuando existan)
```

### Desarrollo

```bash
npm run dev                    # Iniciar servidor en modo desarrollo
npm run build                  # Compilar TypeScript a JavaScript
npm start                      # Iniciar servidor en producción (requiere build)
```

### Linting

```bash
npm run lint                   # Verificar código
npm run lint:fix               # Corregir automáticamente
```

---

## 📂 Estructura del Proyecto

```
backend/
│
├── docker-compose.yml              # Configuración de Docker
├── .env.example                    # Variables de entorno de ejemplo
├── .env                           # Variables de entorno (NO subir a git)
├── package.json                   # Dependencias y scripts
├── tsconfig.json                  # Configuración de TypeScript
├── jest.config.cjs               # Configuración de Jest
│
├── docker/                        # Scripts de Docker
│   └── init-db.sh                # Script de inicialización de PostgreSQL
│
├── src/
│   │
│   ├── domain/                    # CAPA DE DOMINIO (Lógica de negocio pura)
│   │   ├── entities/             # Entidades del dominio
│   │   │   └── User.ts          # Entidad User (sin dependencias externas)
│   │   ├── value-objects/        # Value Objects (inmutables)
│   │   │   ├── Email.ts         # Email validado
│   │   │   └── Role.ts          # Role con permisos
│   │   └── repositories/         # Interfaces de repositorios (contratos)
│   │       └── IUserRepository.ts
│   │
│   ├── application/               # CAPA DE APLICACIÓN (Casos de uso)
│   │   ├── use-cases/            # Casos de uso (lógica de aplicación)
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   └── projects/
│   │   └── services/             # Servicios de aplicación
│   │
│   ├── infrastructure/            # CAPA DE INFRAESTRUCTURA
│   │   ├── database/
│   │   │   ├── data-source.ts   # Configuración de TypeORM
│   │   │   ├── entities/        # Entidades de TypeORM
│   │   │   │   └── User.entity.ts
│   │   │   └── migrations/      # Migraciones de base de datos
│   │   │       └── 1700000000001-CreateUsersTable.ts
│   │   ├── repositories/         # Implementaciones de repositorios
│   │   │   ├── TypeORMUserRepository.ts
│   │   │   └── mappers/         # Mappers entre capas
│   │   │       └── UserMapper.ts
│   │   └── external-services/    # Servicios externos (APIs, etc.)
│   │
│   ├── interfaces/                # CAPA DE PRESENTACIÓN
│   │   ├── controllers/          # Controladores HTTP
│   │   ├── routes/               # Definición de rutas
│   │   ├── middleware/           # Middlewares (auth, validation, etc.)
│   │   └── validators/           # Validadores de request
│   │
│   ├── shared/                   # CÓDIGO COMPARTIDO
│   │   ├── errors/               # Errores personalizados
│   │   ├── utils/                # Utilidades
│   │   └── constants/            # Constantes
│   │
│   └── server.ts                 # Entry point del servidor
│
└── tests/                        # TESTS (misma estructura que src)
    ├── unit/                     # Tests unitarios
    │   └── domain/
    │       ├── entities/
    │       │   └── User.test.ts
    │       └── value-objects/
    │           ├── Email.test.ts
    │           └── Role.test.ts
    ├── integration/              # Tests de integración
    │   └── infrastructure/
    │       └── repositories/
    │           └── TypeORMUserRepository.test.ts
    └── e2e/                      # Tests end-to-end
        └── flows/
```

---

## 🧪 Testing

### Filosofía de Testing

Seguimos **Test-Driven Development (TDD)**:

1. ✅ **Red**: Escribir test que falla
2. ✅ **Green**: Implementar mínimo para que pase
3. ✅ **Refactor**: Mejorar código manteniendo tests en verde

### Estrategia de Testing

```
Unit Tests → Testear cada clase/función aislada
    ↓
Integration Tests → Testear interacción entre capas
    ↓
E2E Tests → Testear flujos completos de usuario
```

### Coverage Requerido

- **Statements:** >70%
- **Branches:** >70%
- **Functions:** >70%
- **Lines:** >70%

**Coverage actual:** ~98% en Domain Layer, ~85% total ✅

### Qué Testeamos

✅ **Testeamos:**
- Domain Entities (User, etc.)
- Value Objects (Email, Role, etc.)
- Repositories (con BD real en test)
- Use Cases (lógica de aplicación)
- Controllers (endpoints HTTP)

❌ **NO testeamos:**
- Configuración (data-source.ts)
- Migraciones (se testean ejecutándolas)
- TypeORM Entities (son decoradores)
- Archivos de constantes

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Solo unitarios (rápido)
npm run test:unit

# Solo integración (requiere Docker)
npm run test:integration

# Watch mode (desarrollo)
npm run test:watch

# Con cobertura detallada
npm test -- --coverage
```

### IMPORTANTE: Tests de Integración

Los tests de integración requieren:
1. ✅ Docker corriendo: `npm run docker:up`
2. ✅ Tabla users en BD test: `npm run migration:run:test`

Si los tests fallan con "relation users does not exist":
```bash
npm run migration:run:test
```

---

## 🗄️ Base de Datos

### Bases de Datos

El proyecto usa **DOS bases de datos PostgreSQL**:

| Base de Datos | Uso | Comandos |
|---------------|-----|----------|
| `jmac_earth_dev` | Desarrollo | `npm run docker:db` |
| `jmac_earth_test` | Tests | `npm run docker:db:test` |

### Modelo de Datos Actual

#### Tabla: `users`

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username varchar(50) UNIQUE NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  role varchar(20) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE UNIQUE INDEX idx_users_email ON users (email);
CREATE UNIQUE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_role ON users (role);
```

**Roles válidos:** `admin`, `coordinator`, `operator`

### Acceso a pgAdmin (Opcional)

Si iniciaste Docker con pgAdmin:

1. Abrir navegador: http://localhost:5050
2. **Email:** admin@jmac.com
3. **Password:** admin123

**Agregar servidor:**
- **Name:** JMAC Earth Local
- **Host:** postgres (nombre del servicio)
- **Port:** 5432
- **Username:** postgres
- **Password:** postgres
- **Database:** jmac_earth_dev

### Comandos Útiles de PostgreSQL

```sql
-- Listar bases de datos
\l

-- Conectar a una base de datos
\c jmac_earth_dev

-- Listar tablas
\dt

-- Ver estructura de tabla
\d users

-- Ver contenido de tabla
SELECT * FROM users;

-- Ver migraciones ejecutadas
SELECT * FROM migrations;

-- Salir
\q
```

---

## 📝 Convenciones de Código

### Nomenclatura

- **Archivos:**
  - Clases: PascalCase (`UserEntity.ts`)
  - Otros: camelCase (`authMiddleware.ts`)
  - Tests: `*.test.ts` o `*.spec.ts`

- **Código:**
  - Clases: PascalCase (`UserRepository`)
  - Funciones/Variables: camelCase (`getUserById`)
  - Constantes: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
  - Interfaces: PascalCase con prefijo "I" (`IUserRepository`)

### Estructura de Tests

Seguimos patrón **AAA (Arrange-Act-Assert)**:

```typescript
test('debe crear un usuario válido', () => {
  // Arrange - Preparar datos
  const email = new Email('test@example.com');
  const role = Role.createOperator();
  
  // Act - Ejecutar acción
  const user = User.create({ username, email, password, role });
  
  // Assert - Verificar resultado
  expect(user.username).toBe('testuser');
  expect(user.email.getValue()).toBe('test@example.com');
});
```

### Comentarios en Código

Todos los archivos deben tener:
- Descripción del propósito
- Responsabilidades
- Dependencias importantes

```typescript
/**
 * =============================================================================
 * USER REPOSITORY INTERFACE
 * =============================================================================
 * Contrato que define las operaciones de persistencia para User.
 * 
 * Responsabilidades:
 * - Definir operaciones CRUD para usuarios
 * - Mantener independencia del dominio
 * 
 * @module domain/repositories/IUserRepository
 * =============================================================================
 */
```

---

## 🔐 Roles y Permisos

### Roles Disponibles

| Rol | Descripción |
|-----|-------------|
| **Admin** | Control total del sistema |
| **Coordinator** | Gestión de proyectos y operarios |
| **Operator** | Solo lectura de proyectos asignados |

### Matriz de Permisos

| Permiso | Admin | Coordinator | Operator |
|---------|-------|-------------|----------|
| **Usuarios** |
| Crear usuarios | ✅ | ❌ | ❌ |
| Ver usuarios | ✅ | ❌ | ❌ |
| Editar usuarios | ✅ | ❌ | ❌ |
| Eliminar usuarios | ✅ | ❌ | ❌ |
| **Proyectos** |
| Crear proyectos | ✅ | ✅ | ❌ |
| Ver todos los proyectos | ✅ | ✅ | ❌ |
| Ver proyectos asignados | ✅ | ✅ | ✅ |
| Editar proyectos | ✅ | ✅ | ❌ |
| Eliminar proyectos | ✅ | ✅ | ❌ |
| Asignar proyectos | ✅ | ✅ | ❌ |
| **Exportación** |
| Exportar KMZ | ✅ | ✅ | ✅ |
| Exportar PDF | ✅ | ✅ | ❌ |

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

**Causa:** Dependencias no instaladas o rutas de import incorrectas.

**Solución:**
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar rutas de import en tsconfig.json
```

---

### Error: "Port 5432 already in use"

**Causa:** Ya tienes PostgreSQL corriendo localmente.

**Solución Opción A:** Detener PostgreSQL local
```bash
# Linux
sudo systemctl stop postgresql

# macOS
brew services stop postgresql
```

**Solución Opción B:** Cambiar puerto en `docker-compose.yml`
```yaml
services:
  postgres:
    ports:
      - "5433:5432"  # Usar puerto 5433 en host
```

Luego actualiza `.env`:
```env
DB_PORT=5433
```

---

### Error: "relation 'users' does not exist" en tests

**Causa:** La migración no se ejecutó en la BD de test.

**Solución:**
```bash
npm run migration:run:test
```

O ejecuta setup completo:
```bash
npm run db:setup
```

---

### Error: Tests fallan después de actualizar

**Causa:** Cache de Jest o dependencias desactualizadas.

**Solución:**
```bash
# Limpiar cache de Jest
npm test -- --clearCache

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Ejecutar tests nuevamente
npm test
```

---

### Error: "AppDataSource is not initialized"

**Causa:** Los tests no pueden conectarse a PostgreSQL.

**Solución:**
```bash
# 1. Verificar que Docker está corriendo
docker ps | grep jmac_earth_postgres

# 2. Si no está, iniciar Docker
npm run docker:up

# 3. Esperar 10 segundos
sleep 10

# 4. Ejecutar migración en test
npm run migration:run:test

# 5. Ejecutar tests
npm test
```

---

### Error: "cross-env: command not found" (Git Bash en Windows)

**Causa:** Git Bash no encuentra el comando cross-env.

**Solución:**
```bash
# Usar npx
npx cross-env NODE_ENV=test npm run migration:run

# O usar PowerShell
$env:NODE_ENV="test"
npm run migration:run
```

---

### Docker: Reiniciar desde cero

Si tienes problemas con Docker, reinicia todo:

```bash
# Eliminar todo (contenedores + volúmenes + datos)
npm run docker:reset

# Esperar que PostgreSQL esté listo
sleep 10

# Ejecutar migraciones
npm run migration:run
npm run migration:run:test

# Verificar
npm test
```

---

### Ver logs de PostgreSQL

```bash
# Ver logs en tiempo real
npm run docker:logs

# Solo logs de PostgreSQL
docker logs jmac_earth_postgres

# Seguir logs
docker logs -f jmac_earth_postgres
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeORM Documentation](https://typeorm.io/)
- [Jest Testing](https://jestjs.io/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Arquitectura del Proyecto

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estructura detallada del proyecto
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Decisiones arquitectónicas
- [API.md](./docs/API.md) - Documentación de API (cuando exista)

---

## 🤝 Contribuir

### Flujo de Trabajo

1. Crear feature branch: `git checkout -b feature/nueva-funcionalidad`
2. Escribir tests primero (TDD)
3. Implementar funcionalidad
4. Verificar que tests pasen: `npm test`
5. Verificar linting: `npm run lint`
6. Commit con mensaje descriptivo
7. Push y crear Pull Request

### Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar autenticación JWT
fix: corregir validación de email
docs: actualizar README
test: agregar tests para UserRepository
refactor: mejorar estructura de repositorios
```

---

## 📊 Estado del Proyecto

### Progreso Actual

```
✅ Domain Layer (100%)
   ├── Entities: User
   ├── Value Objects: Email, Role
   └── Repositories: IUserRepository (interface)

✅ Infrastructure Layer (100%)
   ├── Database: PostgreSQL + TypeORM
   ├── Migrations: CreateUsersTable
   └── Repositories: TypeORMUserRepository + UserMapper

⏳ Application Layer (0%)
   └── Use Cases: Por implementar

⏳ Interface Layer (0%)
   └── Controllers HTTP: Por implementar

⏳ Frontend (0%)
```

**Progreso Backend:** ~45% completado  
**Tests:** 122 tests, >85% coverage  
**Último update:** Noviembre 2025

---

## 📞 Contacto y Soporte

**Desarrollado por:** IBeyond  
**Cliente:** JMAC Servicios  
**Proyecto:** JMAC Earth - Cálculos Hidráulicos de Bombeo

Para soporte o preguntas:
- Revisar este README completo
- Verificar [Troubleshooting](#-troubleshooting)
- Consultar documentación en `/docs`

---

## 📄 Licencia

[Especificar licencia del proyecto]

---

**Última actualización:** Noviembre 2025  
**Versión del README:** 2.0
