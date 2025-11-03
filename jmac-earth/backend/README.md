# JMAC Earth Backend

Sistema de cálculos hidráulicos para distribución de agua mediante mangueras flexibles.

## 🏗️ Arquitectura

Este proyecto sigue **Clean Architecture** con las siguientes capas:

```
src/
├── domain/              # Capa de Dominio (Lógica de negocio pura)
│   ├── entities/        # Entidades del dominio (User, Project)
│   └── repositories/    # Interfaces de repositorios (contratos)
│
├── application/         # Capa de Aplicación (Casos de uso)
│   ├── use-cases/       # Casos de uso del sistema
│   └── dtos/            # Data Transfer Objects
│
├── infrastructure/      # Capa de Infraestructura (Implementaciones)
│   ├── database/        # Configuración y modelos de TypeORM
│   ├── services/        # Servicios externos (KMZ Parser, etc)
│   └── config/          # Configuraciones
│
├── interfaces/          # Capa de Interfaces (API/Controllers)
│   ├── controllers/     # Controladores HTTP
│   ├── routes/          # Definición de rutas
│   └── middlewares/     # Middlewares (auth, validation, etc)
│
└── shared/              # Código compartido
    ├── utils/           # Utilidades
    └── types/           # Tipos TypeScript compartidos
```

## 📋 Principios de Clean Architecture

1. **Independencia de frameworks**: La lógica de negocio no depende de Express o TypeORM
2. **Testeable**: La lógica de negocio se puede testear sin UI, DB, o servicios externos
3. **Independencia de UI**: El frontend puede cambiar sin afectar el backend
4. **Independencia de Base de Datos**: Podemos cambiar PostgreSQL por otro sin afectar la lógica
5. **Independencia de servicios externos**: Los servicios externos son plugins

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Crear base de datos PostgreSQL
createdb jmac_earth_db
createdb jmac_earth_test  # Para tests

# Ejecutar migraciones
npm run migration:run
```

## 🏃 Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 🧪 Testing

```bash
# Todos los tests
npm test

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

## 📝 Convenciones de Código

### Nomenclatura
- **Archivos**: PascalCase para clases (`UserEntity.ts`), camelCase para otros (`authMiddleware.ts`)
- **Clases**: PascalCase (`UserRepository`)
- **Funciones/Variables**: camelCase (`getUserById`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Interfaces**: PascalCase con prefijo "I" (`IUserRepository`)

### Comentarios
Todos los archivos deben tener:
- Descripción del propósito del archivo
- Responsabilidades
- Dependencias importantes

### Tests
- Un archivo de test por cada archivo de código
- Nomenclatura: `*.test.ts` o `*.spec.ts`
- Estructura: Arrange-Act-Assert (AAA)

## 🔐 Roles y Permisos

### Admin
- ✅ CRUD de usuarios
- ✅ CRUD de proyectos (crear, editar, eliminar)
- ✅ Ver todos los proyectos
- ✅ Asignar proyectos a operarios
- ✅ Exportar KMZ

### Coordinador
- ✅ CRUD de proyectos (crear, editar, eliminar)
- ✅ Ver todos los proyectos
- ✅ Asignar proyectos a operarios
- ✅ Exportar KMZ
- ❌ NO puede gestionar usuarios

### Operario
- ✅ Ver proyectos asignados únicamente
- ✅ Descargar KMZ de proyectos asignados
- ❌ NO puede crear/editar proyectos
- ❌ NO puede ver proyectos no asignados

## 📦 Dependencias Principales

- **Express**: Framework web
- **TypeORM**: ORM para PostgreSQL
- **bcrypt**: Hash de contraseñas
- **jsonwebtoken**: Autenticación JWT
- **joi**: Validación de datos
- **jszip**: Procesamiento de archivos KMZ
- **xml2js**: Parseo de KML (XML)

## 🗄️ Modelo de Datos

### User
- id, username, email, password (hashed), role
- Roles: 'admin' | 'coordinator' | 'operator'

### Project
- id, name, description, kmzFile, createdBy, data, assignedOperators
- data: JSON con coordenadas, elevaciones, distancias

## 🔄 Flujo de Desarrollo (TDD)

1. **Escribir test** (que falla)
2. **Implementar mínimo** para que pase
3. **Refactorizar** manteniendo tests en verde
4. **Documentar** con comentarios
5. **Commit** con mensaje descriptivo

## 📚 Recursos

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeORM Docs](https://typeorm.io/)
- [Jest Testing](https://jestjs.io/)
