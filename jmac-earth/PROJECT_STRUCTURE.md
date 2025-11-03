# 🏗️ JMAC Earth - Clean Architecture Structure

## 📐 Arquitectura en Capas

```
Presentation Layer (Frontend)
        ↓
    API Layer (Controllers)
        ↓
Application Layer (Use Cases / Services)
        ↓
  Domain Layer (Entities / Business Logic)
        ↓
Infrastructure Layer (Database / External Services)
```

## 📂 Estructura de Carpetas

```
jmac-earth/
│
├── backend/                          # Node.js + Express Backend
│   ├── src/
│   │   ├── domain/                   # CAPA DE DOMINIO (Entities + Business Logic)
│   │   │   ├── entities/             # Entidades del dominio
│   │   │   │   ├── User.js           # Entidad User (sin dependencias)
│   │   │   │   └── Project.js        # Entidad Project (sin dependencias)
│   │   │   ├── repositories/         # Interfaces de repositorios (contratos)
│   │   │   │   ├── IUserRepository.js
│   │   │   │   └── IProjectRepository.js
│   │   │   └── value-objects/        # Value Objects (inmutables)
│   │   │       ├── Email.js
│   │   │       ├── Role.js
│   │   │       └── Coordinates.js
│   │   │
│   │   ├── application/              # CAPA DE APLICACIÓN (Use Cases)
│   │   │   ├── use-cases/            # Casos de uso (lógica de aplicación)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginUser.js
│   │   │   │   │   ├── RegisterUser.js
│   │   │   │   │   └── ValidateToken.js
│   │   │   │   ├── users/
│   │   │   │   │   ├── CreateUser.js
│   │   │   │   │   ├── UpdateUser.js
│   │   │   │   │   ├── DeleteUser.js
│   │   │   │   │   └── GetUsers.js
│   │   │   │   └── projects/
│   │   │   │       ├── CreateProject.js
│   │   │   │       ├── UpdateProject.js
│   │   │   │       ├── DeleteProject.js
│   │   │   │       ├── GetProjects.js
│   │   │   │       ├── UploadKMZ.js
│   │   │   │       └── AssignOperators.js
│   │   │   └── services/             # Servicios de aplicación
│   │   │       ├── KMZParserService.js
│   │   │       ├── AuthService.js
│   │   │       └── ProjectService.js
│   │   │
│   │   ├── infrastructure/           # CAPA DE INFRAESTRUCTURA
│   │   │   ├── database/
│   │   │   │   ├── config.js         # Configuración de PostgreSQL
│   │   │   │   ├── migrations/       # Migraciones de DB
│   │   │   │   └── seeders/          # Datos iniciales (admin user)
│   │   │   ├── repositories/         # Implementación de repositorios
│   │   │   │   ├── PostgresUserRepository.js
│   │   │   │   └── PostgresProjectRepository.js
│   │   │   ├── external-services/    # Servicios externos
│   │   │   │   └── ElevationAPI.js
│   │   │   └── storage/
│   │   │       └── FileStorage.js    # Manejo de archivos KMZ
│   │   │
│   │   ├── presentation/             # CAPA DE PRESENTACIÓN
│   │   │   ├── controllers/          # Controladores HTTP
│   │   │   │   ├── AuthController.js
│   │   │   │   ├── UserController.js
│   │   │   │   └── ProjectController.js
│   │   │   ├── middleware/           # Middlewares
│   │   │   │   ├── authMiddleware.js
│   │   │   │   ├── roleMiddleware.js
│   │   │   │   ├── errorMiddleware.js
│   │   │   │   └── validationMiddleware.js
│   │   │   ├── routes/               # Definición de rutas
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── users.routes.js
│   │   │   │   └── projects.routes.js
│   │   │   └── validators/           # Validadores de request
│   │   │       ├── userValidators.js
│   │   │       └── projectValidators.js
│   │   │
│   │   ├── shared/                   # CÓDIGO COMPARTIDO
│   │   │   ├── errors/               # Errores personalizados
│   │   │   │   ├── AppError.js
│   │   │   │   ├── ValidationError.js
│   │   │   │   └── UnauthorizedError.js
│   │   │   ├── utils/                # Utilidades
│   │   │   │   ├── logger.js
│   │   │   │   ├── responseBuilder.js
│   │   │   │   └── coordinateUtils.js
│   │   │   └── constants/            # Constantes
│   │   │       ├── roles.js
│   │   │       └── httpStatus.js
│   │   │
│   │   └── server.js                 # Entry point del servidor
│   │
│   ├── tests/                        # TESTS (misma estructura que src)
│   │   ├── unit/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── integration/
│   │   │   ├── api/
│   │   │   └── database/
│   │   └── e2e/
│   │       └── flows/
│   │
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   ├── jest.config.js
│   └── README.md
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── core/                     # Lógica de negocio frontend
│   │   │   ├── entities/
│   │   │   └── services/
│   │   ├── infrastructure/           # APIs, storage
│   │   │   ├── api/
│   │   │   └── storage/
│   │   ├── presentation/             # UI Components
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── layouts/
│   │   ├── shared/                   # Shared utilities
│   │   │   ├── hooks/
│   │   │   ├── contexts/
│   │   │   └── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── tests/
│   ├── package.json
│   └── README.md
│
└── README.md                         # Documentación principal
```

## 🎯 Principios Aplicados

### 1. **Dependency Inversion**
- Las capas externas dependen de las internas
- El dominio NO conoce la infraestructura
- Uso de interfaces (repositories) para inversión de dependencias

### 2. **Single Responsibility**
- Cada clase/módulo tiene una única razón para cambiar
- Separación clara de responsabilidades por capa

### 3. **Open/Closed**
- Abierto para extensión, cerrado para modificación
- Nuevos casos de uso no modifican existentes

### 4. **Liskov Substitution**
- Implementaciones de repositorios son intercambiables
- Facilita testing con mocks

### 5. **Interface Segregation**
- Interfaces específicas por necesidad
- No forzamos dependencias innecesarias

## 🧪 Testing Strategy

```
Unit Tests → Test de cada clase/función aislada
    ↓
Integration Tests → Test de interacción entre capas
    ↓
E2E Tests → Test de flujos completos de usuario
```

## 📦 Módulos a Desarrollar (en orden)

1. ✅ **Domain Layer** (Entities + Value Objects)
2. ✅ **Infrastructure** (Database config + Repositories)
3. ✅ **Application** (Use Cases + Services)
4. ✅ **Presentation** (Controllers + Routes)
5. ✅ **Frontend** (Components + Pages)

## 🔒 Seguridad

- JWT para autenticación
- bcrypt para passwords
- Validación de inputs en todos los niveles
- RBAC (Role-Based Access Control)
- Rate limiting
- CORS configurado
