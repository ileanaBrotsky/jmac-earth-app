# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**JMAC Earth Backend** - Hydraulic calculation system for water distribution via flexible hoses.

- **Client:** JMAC Servicios
- **Developer:** IBeyond
- **Stack:** Node.js 18+ + TypeScript 5.x + PostgreSQL 15 + TypeORM 0.3.x
- **Architecture:** Clean Architecture with strict layer separation

## Essential Commands

### Database & Docker Setup
```bash
npm run db:setup              # Complete setup: Docker + migrations (dev + test)
npm run docker:up             # Start PostgreSQL container
npm run docker:down           # Stop containers
npm run docker:reset          # Nuclear option: destroy all data and restart
npm run docker:db             # Connect to development database
npm run docker:db:test        # Connect to test database
```

### Testing
```bash
npm test                      # All tests with coverage (requires Docker running)
npm run test:unit             # Unit tests only (fast, no DB needed)
npm run test:integration      # Integration tests (requires Docker + migrations)
npm run test:watch            # Watch mode for development
```

**CRITICAL:** Integration tests require:
1. Docker running: `npm run docker:up`
2. Test DB migrated: `npm run migration:run:test`

If you see "relation 'users' does not exist", run: `npm run migration:run:test`

### Database Migrations
```bash
npm run migration:run         # Run migrations in development DB
npm run migration:run:test    # Run migrations in test DB (use NODE_ENV=test)
npm run migration:revert      # Revert last migration
npm run migration:show        # Show migration status
npm run migration:generate    # Auto-generate migration from entity changes
```

### Development
```bash
npm run dev                   # Start dev server with hot reload (ts-node-dev)
npm run build                 # Compile TypeScript to JavaScript
npm start                     # Run production server (requires build first)
npm run lint                  # Check code style
npm run lint:fix              # Auto-fix linting issues
```

## Architecture

This project follows **Clean Architecture** with strict dependency rules:

```
┌─────────────────────────────────────────────────┐
│   Presentation (controllers, routes)            │ ← HTTP layer
│                    ↓                             │
│   Application (use cases, services)             │ ← Business logic orchestration
│                    ↓                             │
│   Domain (entities, value objects)              │ ← Pure business rules (NO deps)
│                    ↓                             │
│   Infrastructure (TypeORM, external services)   │ ← DB, APIs, frameworks
└─────────────────────────────────────────────────┘
```

**Key Principle:** Dependencies flow INWARD. Domain has ZERO external dependencies.

### Layer Responsibilities

**Domain Layer** (`src/domain/`)
- Pure TypeScript entities and value objects
- NO framework dependencies (no TypeORM, no Express)
- Contains: `User` entity, `Email` and `Role` value objects
- Defines interfaces for repositories (contracts)

**Infrastructure Layer** (`src/infrastructure/`)
- TypeORM entities (separate from domain entities)
- Repository implementations using TypeORM
- **UserMapper:** Converts between Domain User ↔ TypeORM UserEntity
- Database configuration and migrations

**Application Layer** (`src/application/`)
- Use cases and application services
- Status: Not yet implemented

**Presentation Layer** (`src/interfaces/`)
- Controllers, routes, middleware, validators
- Status: Not yet implemented

### Critical Pattern: Domain/Infrastructure Separation

The Domain and Infrastructure are **completely decoupled** via mappers:

```typescript
// Domain Entity (pure TypeScript, in src/domain/entities/User.ts)
class User {
  private _id: string;
  private _email: Email;  // Value object
  private _role: Role;    // Value object

  isAdmin(): boolean { ... }
  canManageUsers(): boolean { ... }
}

// TypeORM Entity (in src/infrastructure/database/entities/User.entity.ts)
@Entity('users')
class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;  // Primitive string

  @Column()
  role: string;   // Primitive string
}

// UserMapper (in src/infrastructure/repositories/mappers/UserMapper.ts)
class UserMapper {
  static toDomain(entity: UserEntity): User { ... }
  static toPersistence(user: User): UserEntity { ... }
}
```

**Why this matters:**
- Domain User has NO TypeORM decorators
- TypeORM UserEntity has NO business logic
- Mapper translates between layers
- Can swap ORM without touching domain code

### Path Aliases

TypeScript paths configured in `tsconfig.json` and `jest.config.cjs`:

```typescript
import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { TypeORMUserRepository } from '@infrastructure/repositories/TypeORMUserRepository';
```

## Database Architecture

**Two PostgreSQL databases:**
- `jmac_earth_dev` - Development
- `jmac_earth_test` - Testing (auto-cleared between tests)

**Current schema:**
- `users` table with uuid, username, email, password, role, timestamps
- Roles: `admin`, `coordinator`, `operator`

**Migration workflow:**
1. Create/modify TypeORM entity in `src/infrastructure/database/entities/`
2. Generate migration: `npm run migration:generate -- src/infrastructure/database/migrations/MigrationName`
3. Review generated SQL in migrations folder
4. Run migrations: `npm run migration:run` (dev) and `npm run migration:run:test` (test)
5. Never use `synchronize: true` in production

## Testing Philosophy

**Test-Driven Development (TDD):**
1. Red: Write failing test
2. Green: Minimal implementation to pass
3. Refactor: Improve while keeping tests green

**Test Structure (AAA pattern):**
```typescript
test('should create valid user', () => {
  // Arrange - Setup
  const email = new Email('test@example.com');
  const role = Role.createOperator();

  // Act - Execute
  const user = User.create({ username: 'test', email, password: 'hashed', role });

  // Assert - Verify
  expect(user.email.getValue()).toBe('test@example.com');
});
```

**Coverage Requirements:**
- Statements/Branches/Functions/Lines: >70%
- Current: ~98% in Domain, ~85% overall

**What to test:**
- ✅ Domain entities and value objects
- ✅ Repository implementations (with real DB in test env)
- ✅ Use cases
- ✅ Controllers/endpoints

**What NOT to test:**
- ❌ Configuration files (data-source.ts)
- ❌ Migration files (tested by running them)
- ❌ TypeORM entities (they're just decorators)
- ❌ Constants files

## Code Conventions

**Naming:**
- Files: PascalCase for classes (`User.ts`), camelCase for others (`authMiddleware.ts`)
- Tests: `*.test.ts` or `*.spec.ts`
- Classes: PascalCase (`UserRepository`)
- Functions/variables: camelCase (`getUserById`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- Interfaces: PascalCase with "I" prefix (`IUserRepository`)

**File Headers:**
All domain/infrastructure files include structured comments:
```typescript
/**
 * =============================================================================
 * FILE PURPOSE
 * =============================================================================
 * Description
 *
 * Responsibilities:
 * - Responsibility 1
 * - Responsibility 2
 *
 * @module path/to/module
 * =============================================================================
 */
```

## User Roles & Permissions

| Permission | Admin | Coordinator | Operator |
|------------|-------|-------------|----------|
| Manage users | ✅ | ❌ | ❌ |
| Create/edit projects | ✅ | ✅ | ❌ |
| View all projects | ✅ | ✅ | ❌ |
| View assigned projects | ✅ | ✅ | ✅ |
| Export KMZ | ✅ | ✅ | ✅ |
| Export PDF | ✅ | ✅ | ❌ |

Role logic is encapsulated in the `Role` value object (`src/domain/value-objects/Role.ts`).

## Development Methodology & Requirements Analysis

### Role as Senior Developer & Functional Analyst

When working on this project, act as:
- **Senior Developer:** Expert in web and mobile applications
- **Functional Analyst:** Ask ALL necessary questions to understand requirements fully
- **Critical Thinker:** Don't always agree - provide constructive criticism, respect, and assertiveness
- **Market Researcher:** Analyze competitors and current market to design the best solution

**IMPORTANT:** Ask questions when in doubt or missing information. Don't assume.

### Step 0: Requirements Analysis

Before writing ANY code, complete a thorough requirements analysis.

#### Requirement Quality Criteria

Each requirement MUST be:
- **Clear and unambiguous** - Avoid "fast", "easy", generic terms
- **Verifiable and measurable** - Can be tested objectively
- **Necessary** - Adds real value
- **Consistent** - Doesn't contradict other requirements
- **Traceable** - Know where it comes from and how to validate
- **Up-to-date** - Living document that changes with user/business needs

**Focus on WHAT to solve, not HOW to solve it** (the team decides implementation later)

#### Requirement Types

**1. Functional Requirements (RF)**
What the system must do. What functions the software must fulfill.

Examples:
- RF-001: User registration with email and password
- RF-002: Add products to shopping cart
- RF-003: Process payments with credit card

**2. Non-Functional Requirements (RNF)**
Quality-related, performance requirements.

Examples:
- RNF-001: Search must complete in <2 seconds for 95% of queries
- RNF-002: Passwords must be encrypted
- RNF-003: Must be compatible with Chrome, Edge, Safari

**3. Constraints**
External limitations that condition development.

Examples:
- CONST-001: Database must be PostgreSQL
- CONST-002: MVP must be ready in 8 weeks
- CONST-003: Must comply with ISO27001

**4. Business/User Requirements**
Requirements imposed by the business.

Examples:
- BUS-001: Commission must be 15%
- BUS-002: Support Spanish and English languages

**5. Data Requirements**
Needs for analysis or external system integration.

Examples:
- DATA-001: Store order history for the last 5 years
- DATA-002: Connect with Stripe API for payments

#### User Stories Format

Use Agile format:

```
Como [USER], quiero [OBJECTIVE] para [BENEFIT]
As [USER], I want [OBJECTIVE] so that [BENEFIT]
```

**Example:**
```
Como CLIENTE REGISTRADO, quiero VER MI HISTORIAL DE PEDIDOS para REPETIR COMPRAS
As REGISTERED CUSTOMER, I want to VIEW MY ORDER HISTORY so that I can REPEAT PURCHASES
```

#### Acceptance Criteria (Given-When-Then)

For each user story, define acceptance criteria:

```
DADO que [precondition] - GIVEN
CUANDO [action] - WHEN
ENTONCES [expected result] - THEN
```

**Example:**
```
DADO que inicio sesión como cliente registrado
CUANDO entro en "Mis Pedidos"
ENTONCES veo la lista de pedidos con fecha e importe
```

#### MoSCoW Prioritization

Prioritize requirements using MoSCoW:

- **Must** - Must be in the application. Maximum priority
- **Should** - Not essential but would be good to have
- **Could** - Extra that adds value but not fundamental
- **Won't** - Not priority, doesn't add value. Leave for the end if time permits

#### Use Cases Format

Define detailed use cases:

```
Case ID: CU-XXX
Name: [Action name]
Actor: [Who performs it]
Preconditions: [What must be true before]
Postconditions: [What will be true after]
Main Flow:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
Alternative Flows:
  A1. [Exception/alternative scenario]
```

**Example:**
```
Case ID: CU-05
Name: Return Order
Actor: Customer
Preconditions: Customer is logged in, has orders
Main Flow:
  1. Customer accesses "My Orders"
  2. Selects an order and clicks "Return"
  3. System generates return label
  4. System notifies refund in 3-5 days
Alternative Flows:
  A1. Order exceeds 30 days → show "not eligible" message
```

#### Common Problems to AVOID

❌ **Solutions disguised as requirements:** "Use microservices"
❌ **Ambiguity:** "It must be fast"
❌ **Everything is high priority:** Prioritize realistically

### Development Workflow

**BEFORE writing code:**
1. Present complete list of User Stories
2. Present Use Cases with acceptance criteria
3. Wait for user approval/feedback
4. Iterate on requirements if needed

**DURING development:**
1. **Divide into modules** - One module per use case
2. **Verify before advancing** - Ensure everything works before moving to next module
3. **TDD Approach:**
   - Write tests FIRST (Red)
   - Implement minimal code to pass (Green)
   - Refactor while keeping tests green
4. **Create frontend incrementally** - Build UI for each module to allow user testing
5. **Agile methodology** - Present each module to user, get feedback, iterate
6. **Module completion criteria:**
   - All tests passing
   - Frontend functional for that module
   - User acceptance obtained

**Code Quality Standards:**
- Comments: English, following best practices
- Variables: English, readable names
- Architecture: Clean Architecture (mandatory)
- Testing: TDD - tests must pass before advancing

### Pre-Development Checklist

Before writing ANY code, ensure you have:
- [ ] Complete list of User Stories with MoSCoW priorities
- [ ] Detailed Use Cases with Given-When-Then acceptance criteria
- [ ] Clear separation of requirement types (RF, RNF, Constraints, Business, Data)
- [ ] User approval on requirements
- [ ] Module breakdown aligned with use cases
- [ ] Test strategy defined for each module

## Common Development Workflows

### Adding a New Entity
1. Create domain entity in `src/domain/entities/NewEntity.ts`
2. Create repository interface in `src/domain/repositories/INewEntityRepository.ts`
3. Create TypeORM entity in `src/infrastructure/database/entities/NewEntity.entity.ts`
4. Create mapper in `src/infrastructure/repositories/mappers/NewEntityMapper.ts`
5. Implement repository in `src/infrastructure/repositories/TypeORMNewEntityRepository.ts`
6. Generate migration: `npm run migration:generate -- src/infrastructure/database/migrations/CreateNewEntityTable`
7. Write tests first (TDD), then implementation

### Running a Single Test File
```bash
npm test -- tests/unit/domain/entities/User.test.ts
npm test -- --testNamePattern="should create valid user"
```

### Debugging Test Failures
```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose

# Run specific test suite
npm run test:unit  # or test:integration
```

### Connecting to Database via CLI
```bash
npm run docker:db        # Development DB
# Then in psql:
\dt                      # List tables
\d users                 # Describe users table
SELECT * FROM users;     # Query users
\q                       # Quit
```

## TypeScript Configuration

**Strict mode enabled** with:
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noUncheckedIndexedAccess: true`

**Decorators enabled** for TypeORM:
- `experimentalDecorators: true`
- `emitDecoratorMetadata: true`

## Important Notes

- **Never commit `.env` file** - use `.env.example` as template
- **Always hash passwords** before passing to User entity (use bcryptjs)
- **Domain entities are immutable where possible** - use update methods
- **Value objects validate themselves** - Email and Role throw errors on invalid input
- **Mappers are the ONLY bridge** between Domain and Infrastructure
- **Tests require Docker** - most test failures are due to DB not running
- **Two databases** - dev and test are separate, both need migrations
- **Migration direction** - always run in both dev and test: `npm run migration:run && npm run migration:run:test`

## Current Implementation Status

```
✅ Domain Layer (100%)
   ├── Entities: User
   ├── Value Objects: Email, Role
   └── Repository Interfaces: IUserRepository

✅ Infrastructure Layer (100%)
   ├── Database: PostgreSQL + TypeORM
   ├── Migrations: CreateUsersTable
   ├── Entities: UserEntity (TypeORM)
   ├── Mappers: UserMapper
   └── Repositories: TypeORMUserRepository

⏳ Application Layer (0%)
   └── Use Cases: Not implemented

⏳ Presentation Layer (0%)
   └── Controllers/Routes: Not implemented
```

## Troubleshooting Quick Reference

**"relation 'users' does not exist"**
```bash
npm run migration:run:test
```

**"Port 5432 already in use"**
```bash
sudo systemctl stop postgresql  # Linux
brew services stop postgresql   # macOS
# Or change port in docker-compose.yml to 5433
```

**"AppDataSource is not initialized"**
```bash
npm run docker:up && sleep 10 && npm run migration:run:test
```

**"cross-env: command not found" (Git Bash on Windows)**
```bash
npx cross-env NODE_ENV=test npm run migration:run
```

**Test failures after update**
```bash
npm test -- --clearCache
rm -rf node_modules package-lock.json && npm install
```

**Nuclear option (reset everything)**
```bash
npm run docker:reset && sleep 10 && npm run migration:run && npm run migration:run:test && npm test
```
