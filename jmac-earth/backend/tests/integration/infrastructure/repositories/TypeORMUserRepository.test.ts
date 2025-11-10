/**
 * =============================================================================
 * TYPEORM USER REPOSITORY - INTEGRATION TESTS
 * =============================================================================
 * Tests de integración para el repositorio de usuarios.
 * 
 * Estos tests interactúan con una base de datos PostgreSQL REAL (jmac_earth_test).
 * No usamos mocks porque queremos verificar que el repositorio realmente funciona
 * con PostgreSQL.
 * 
 * Setup:
 * - Antes de cada test: Limpiar la tabla users
 * - Después de todos los tests: Cerrar conexión
 * 
 * @module tests/integration/infrastructure/repositories/TypeORMUserRepository.test
 * =============================================================================
 */

import { TypeORMUserRepository } from '../../../../src/infrastructure/repositories/TypeORMUserRepository';
import { User } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { Role, RoleType } from '../../../../src/domain/value-objects/Role';
import AppDataSource from '../../../../src/infrastructure/database/data-source';

describe('TypeORMUserRepository - Integration Tests', () => {
  let repository: TypeORMUserRepository;

  // Setup: Conectar a la base de datos de test
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    repository = new TypeORMUserRepository();
  });

  // Cleanup: Limpiar la tabla antes de cada test
  beforeEach(async () => {
    await AppDataSource.query('DELETE FROM users');
  });

  // Teardown: Cerrar conexión después de todos los tests
  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  // =========================================================================
  // SAVE TESTS
  // =========================================================================
  describe('save()', () => {
    test('debe guardar un nuevo usuario en la base de datos', async () => {
      // Arrange
      const user = User.create({
        username: 'testuser',
        email: new Email('test@example.com'),
        password: '$2b$10$hashedpassword',
        role: Role.createOperator()
      });

      // Act
      const savedUser = await repository.save(user);

      // Assert
      expect(savedUser.id).toBeDefined();
      expect(savedUser.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i); // UUID format
      expect(savedUser.username).toBe('testuser');
      expect(savedUser.email.getValue()).toBe('test@example.com');
      expect(savedUser.role.getValue()).toBe(RoleType.OPERATOR);
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    test('debe lanzar error si el email ya existe', async () => {
      // Arrange
      const user1 = User.create({
        username: 'user1',
        email: new Email('duplicate@example.com'),
        password: '$2b$10$hashedpassword',
        role: Role.createOperator()
      });

      const user2 = User.create({
        username: 'user2',
        email: new Email('duplicate@example.com'), // Email duplicado
        password: '$2b$10$hashedpassword',
        role: Role.createOperator()
      });

      // Act
      await repository.save(user1);

      // Assert
      await expect(repository.save(user2)).rejects.toThrow('Email ya está en uso');
    });

    test('debe lanzar error si el username ya existe', async () => {
      // Arrange
      const user1 = User.create({
        username: 'duplicate',
        email: new Email('user1@example.com'),
        password: '$2b$10$hashedpassword',
        role: Role.createOperator()
      });

      const user2 = User.create({
        username: 'duplicate', // Username duplicado
        email: new Email('user2@example.com'),
        password: '$2b$10$hashedpassword',
        role: Role.createOperator()
      });

      // Act
      await repository.save(user1);

      // Assert
      await expect(repository.save(user2)).rejects.toThrow('Username ya está en uso');
    });
  });

  // =========================================================================
  // FIND BY ID TESTS
  // =========================================================================
  describe('findById()', () => {
    test('debe encontrar un usuario por su ID', async () => {
      // Arrange
      const user = User.create({
        username: 'testuser',
        email: new Email('test@example.com'),
        password: '$2b$10$hashedpassword',
        role: Role.createAdmin()
      });
      const savedUser = await repository.save(user);

      // Act
      const foundUser = await repository.findById(savedUser.id);

      // Assert
      expect(foundUser).not.toBeNull();
      expect(foundUser!.id).toBe(savedUser.id);
      expect(foundUser!.username).toBe('testuser');
      expect(foundUser!.email.getValue()).toBe('test@example.com');
    });

    test('debe retornar null si el ID no existe', async () => {
      // Arrange
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      // Act
      const foundUser = await repository.findById(nonExistentId);

      // Assert
      expect(foundUser).toBeNull();
    });
  });

  // =========================================================================
  // FIND BY EMAIL TESTS
  // =========================================================================
  describe('findByEmail()', () => {
    test('debe encontrar un usuario por su email', async () => {
      // Arrange
      const email = new Email('test@example.com');
      const user = User.create({
        username: 'testuser',
        email: email,
        password: '$2b$10$hashedpassword',
        role: Role.createCoordinator()
      });
      await repository.save(user);

      // Act
      const foundUser = await repository.findByEmail(email);

      // Assert
      expect(foundUser).not.toBeNull();
      expect(foundUser!.email.getValue()).toBe('test@example.com');
      expect(foundUser!.username).toBe('testuser');
    });

    test('debe retornar null si el email no existe', async () => {
      // Arrange
      const email = new Email('nonexistent@example.com');

      // Act
      const foundUser = await repository.findByEmail(email);

      // Assert
      expect(foundUser).toBeNull();
    });
  });

  // =========================================================================
  // FIND BY USERNAME TESTS
  // =========================================================================
  describe('findByUsername()', () => {
    test('debe encontrar un usuario por su username', async () => {
      // Arrange
      const user = User.create({
        username: 'uniqueuser',
        email: new Email('unique@example.com'),
        password: '$2b$10$hashedpassword',
        role: Role.createOperator()
      });
      await repository.save(user);

      // Act
      const foundUser = await repository.findByUsername('uniqueuser');

      // Assert
      expect(foundUser).not.toBeNull();
      expect(foundUser!.username).toBe('uniqueuser');
      expect(foundUser!.email.getValue()).toBe('unique@example.com');
    });

    test('debe retornar null si el username no existe', async () => {
      // Act
      const foundUser = await repository.findByUsername('nonexistent');

      // Assert
      expect(foundUser).toBeNull();
    });
  });

  // =========================================================================
  // FIND ALL TESTS
  // =========================================================================
  describe('findAll()', () => {
    test('debe retornar todos los usuarios ordenados por creación descendente', async () => {
      // Arrange
      const user1 = User.create({
        username: 'user1',
        email: new Email('user1@example.com'),
        password: '$2b$10$hashedpassword',
        role: Role.createOperator()
      });

      const user2 = User.create({
        username: 'user2',
        email: new Email('user2@example.com'),
        password: '$2b$10$hashedpassword',
        role: Role.createAdmin()
      });

      await repository.save(user1);
      await repository.save(user2);

      // Act
      const users = await repository.findAll();

      // Assert
      expect(users).toHaveLength(2);
      // Verificar que existen antes de acceder a propiedades
      expect(users[0]).toBeDefined();
      expect(users[1]).toBeDefined();
      // Ahora es seguro acceder
      expect(users[0]!.username).toBe('user2'); // Más reciente primero
      expect(users[1]!.username).toBe('user1');
    });

    test('debe retornar un array vacío si no hay usuarios', async () => {
      // Act
      const users = await repository.findAll();

      // Assert
      expect(users).toHaveLength(0);
    });
  });

  // =========================================================================
  // UPDATE TESTS
  // =========================================================================
  describe('update()', () => {
    test('debe actualizar un usuario existente', async () => {
      // Arrange
      const user = User.create({
        username: 'original',
        email: new Email('original@example.com'),
        password: '$2b$10$hashedpassword',
        role: Role.createOperator()
      });
      const savedUser = await repository.save(user);

      // Act - Actualizar username
      savedUser.updateUsername('updated');
      const updatedUser = await repository.update(savedUser);

      // Assert
      expect(updatedUser.username).toBe('updated');
      expect(updatedUser.id).toBe(savedUser.id);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(savedUser.createdAt.getTime());
    });

    test('debe lanzar error si el usuario no existe', async () => {
      // Arrange
      const user = User.create({
        username: 'testuser',
        email: new Email('test@example.com'),
        password: '$2b$10$hashedpassword',
        role: Role.createOperator()
      });
      
      // Forzar un ID inexistente
      const userProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const nonExistentUser = new User(userProps);

      // Act & Assert
      await expect(repository.update(nonExistentUser)).rejects.toThrow('no encontrado');
    });
  });

  // =========================================================================
  // DELETE TESTS
  // =========================================================================
  describe('delete()', () => {
    test('debe eliminar un usuario existente', async () => {
      // Arrange
      const user = User.create({
        username: 'tobedeleted',
        email: new Email('delete@example.com'),
        password: '$2b$10$hashedpassword',
        role: Role.createOperator()
      });
      const savedUser = await repository.save(user);

      // Act
      await repository.delete(savedUser.id);

      // Assert
      const foundUser = await repository.findById(savedUser.id);
      expect(foundUser).toBeNull();
    });

    test('debe lanzar error si el usuario no existe', async () => {
      // Arrange
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      // Act & Assert
      await expect(repository.delete(nonExistentId)).rejects.toThrow('no encontrado');
    });
  });

  // =========================================================================
  // EXISTS BY EMAIL TESTS
  // =========================================================================
  describe('existsByEmail()', () => {
    test('debe retornar true si el email existe', async () => {
      // Arrange
      const email = new Email('exists@example.com');
      const user = User.create({
        username: 'testuser',
        email: email,
        password: '$2b$10$hashedpassword',
        role: Role.createOperator()
      });
      await repository.save(user);

      // Act
      const exists = await repository.existsByEmail(email);

      // Assert
      expect(exists).toBe(true);
    });

    test('debe retornar false si el email no existe', async () => {
      // Arrange
      const email = new Email('nonexistent@example.com');

      // Act
      const exists = await repository.existsByEmail(email);

      // Assert
      expect(exists).toBe(false);
    });
  });

  // =========================================================================
  // EXISTS BY USERNAME TESTS
  // =========================================================================
  describe('existsByUsername()', () => {
    test('debe retornar true si el username existe', async () => {
      // Arrange
      const user = User.create({
        username: 'existinguser',
        email: new Email('user@example.com'),
        password: '$2b$10$hashedpassword',
        role: Role.createOperator()
      });
      await repository.save(user);

      // Act
      const exists = await repository.existsByUsername('existinguser');

      // Assert
      expect(exists).toBe(true);
    });

    test('debe retornar false si el username no existe', async () => {
      // Act
      const exists = await repository.existsByUsername('nonexistent');

      // Assert
      expect(exists).toBe(false);
    });
  });
});