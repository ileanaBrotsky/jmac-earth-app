jmac-earth/
├── backend/
│   ├── src/
│   │   ├── domain/                          # Capa de Dominio (Clean Architecture)
│   │   │   ├── entities/                    # Entidades del dominio
│   │   │   │   ├── User.ts                  # ✅ Ya existe
│   │   │   │   ├── Project.ts               # 🆕 Crear
│   │   │   │   ├── Trace.ts                 # 🆕 Crear
│   │   │   │   ├── TracePoint.ts            # 🆕 Crear
│   │   │   │   ├── Pump.ts                  # 🆕 Crear (Sprint 2)
│   │   │   │   └── Valve.ts                 # 🆕 Crear (Sprint 2)
│   │   │   ├── value-objects/              # Value Objects
│   │   │   │   ├── Email.ts                 # ✅ Ya existe
│   │   │   │   ├── Role.ts                  # ✅ Ya existe
│   │   │   │   ├── Coordinates.ts           # 🆕 Crear
│   │   │   │   ├── Elevation.ts             # 🆕 Crear
│   │   │   │   └── HydraulicParameters.ts   # 🆕 Crear
│   │   │   └── interfaces/                  # Interfaces (contratos)
│   │   │       ├── IUserRepository.ts       # ✅ Ya existe
│   │   │       ├── IProjectRepository.ts    # 🆕 Crear (Sprint 2)
│   │   │       ├── IElevationService.ts     # 🆕 CREAR HOY
│   │   │       └── IKMZParserService.ts     # 🆕 CREAR HOY
│   │   │
│   │   ├── application/                     # Capa de Aplicación (Use Cases)
│   │   │   └── use-cases/
│   │   │       ├── auth/                    # 🆕 Crear (Sprint 2)
│   │   │       └── projects/
│   │   │           ├── ProcessKMZUseCase.ts # 🆕 CREAR HOY
│   │   │           └── CalculatePositionsUseCase.ts  # 🆕 Sprint 2
│   │   │
│   │   ├── infrastructure/                  # Capa de Infraestructura
│   │   │   ├── database/
│   │   │   │   ├── entities/               # TypeORM entities
│   │   │   │   │   ├── UserEntity.ts        # ✅ Ya existe
│   │   │   │   │   ├── ProjectEntity.ts     # 🆕 Crear (Sprint 2)
│   │   │   │   │   └── TraceEntity.ts       # 🆕 Crear (Sprint 2)
│   │   │   │   └── migrations/
│   │   │   │       └── CreateProjectsTable.ts  # 🆕 Sprint 2
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── elevation/              # 🆕 CREAR HOY
│   │   │   │   │   ├── ElevationServiceFactory.ts
│   │   │   │   │   ├── OpenTopoDataService.ts
│   │   │   │   │   ├── GoogleElevationService.ts
│   │   │   │   │   └── MockElevationService.ts
│   │   │   │   └── kmz/                    # 🆕 CREAR HOY
│   │   │   │       └── KMZParserService.ts
│   │   │   │
│   │   │   └── http/                       # Express controllers
│   │   │       ├── routes/
│   │   │       │   ├── authRoutes.ts        # 🆕 Sprint 2
│   │   │       │   └── projectRoutes.ts     # 🆕 CREAR HOY
│   │   │       └── controllers/
│   │   │           └── ProjectController.ts # 🆕 CREAR HOY
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts                  # ✅ Ya existe
│   │   │   └── env.ts                       # 🆕 CREAR HOY
│   │   │
│   │   └── server.ts                        # 🆕 Actualizar
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── Project.test.ts      # 🆕 Crear
│   │   │   │   └── value-objects/
│   │   │   │       └── Coordinates.test.ts  # 🆕 Crear
│   │   │   └── services/
│   │   │       ├── KMZParserService.test.ts # 🆕 CREAR HOY
│   │   │       └── OpenTopoDataService.test.ts  # 🆕 CREAR HOY
│   │   │
│   │   └── integration/
│   │       └── ProcessKMZUseCase.test.ts    # 🆕 CREAR HOY
│   │
│   ├── uploads/                             # Carpeta para archivos KMZ
│   ├── .env                                 # 🆕 Actualizar
│   ├── package.json                         # 🆕 Actualizar
│   └── tsconfig.json                        # ✅ Ya existe
│
├── frontend/                                # 🆕 CREAR COMPLETO
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Loading.tsx
│   │   │   ├── map/
│   │   │   │   ├── Map.tsx                  # Leaflet map
│   │   │   │   └── TraceLayer.tsx
│   │   │   └── project/
│   │   │       ├── KMZUploader.tsx          # Drag & drop
│   │   │       ├── ParametersForm.tsx
│   │   │       └── TraceSummary.tsx
│   │   │
│   │   ├── pages/
│   │   │   └── NewProjectPage.tsx
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                       # Axios client
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                     # TypeScript types
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── docker-compose.yml                       # ✅ Ya existe