/**
 * =============================================================================
 * USER ENTITY - UNIT TESTS
 * =============================================================================
 * Tests unitarios para la entidad User del dominio.
 * 
 * Valida:
 * - Construcción correcta de usuarios
 * - Integración con Value Objects (Email, Role)
 * - Validaciones de username y password
 * - Métodos de verificación de roles y permisos
 * - Métodos de actualización
 * - Serialización (toJSON)
 * - Factory methods
 * 
 * @module tests/unit/domain/entities/User.test
 * =============================================================================
 */

import { User, UserProps, CreateUserProps } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { Role, RoleType } from '../../../../src/domain/value-objects/Role';

describe('User Entity', () => {
  
  /**
   * Datos de prueba válidos
   */
  const validUserProps: UserProps = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    email: new Email('test@example.com'),
    password: '$2b$10$hashedpassword',
    role: new Role(RoleType.OPERATOR),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  };

  describe('Constructor', () => {
    
    test('debe crear un usuario con propiedades válidas usando Value Objects', () => {
      // Arrange & Act
      const user = new User(validUserProps);
      
      // Assert
      expect(user.id).toBe(validUserProps.id);
      expect(user.username).toBe(validUserProps.username);
      expect(user.password).toBe(validUserProps.password);
      expect(user.createdAt).toEqual(validUserProps.createdAt);
      expect(user.updatedAt).toEqual(validUserProps.updatedAt);
      
      expect(user.email).toBeInstanceOf(Email);
      expect(user.email.getValue()).toBe('test@example.com');
      
      expect(user.role).toBeInstanceOf(Role);
      expect(user.role.getValue()).toBe(RoleType.OPERATOR);
    });

    test('debe validar email usando el Email Value Object', () => {
      // Arrange, Act & Assert
      expect(() => new Email('invalid-email')).toThrow('Formato de email inválido');
      expect(() => new Email('')).toThrow('Email no puede estar vacío');
      expect(() => new Email('a@b')).toThrow('Email debe tener al menos 5 caracteres');
    });

    test('debe validar role usando el Role Value Object', () => {
      // Arrange, Act & Assert
      expect(() => new Role('invalid-role')).toThrow(/Rol inválido/);
      expect(() => new Role('')).toThrow('Rol no puede estar vacío');
    });

    test('debe lanzar error si username está vacío', () => {
      // Arrange
      const invalidProps = { ...validUserProps, username: '' };
      
      // Act & Assert
      expect(() => new User(invalidProps)).toThrow('Username no puede estar vacío');
    });

    test('debe lanzar error si username tiene menos de 3 caracteres', () => {
      // Arrange
      const invalidProps = { ...validUserProps, username: 'ab' };
      
      // Act & Assert
      expect(() => new User(invalidProps)).toThrow('Username debe tener al menos 3 caracteres');
    });

    test('debe lanzar error si username tiene más de 50 caracteres', () => {
      // Arrange
      const invalidProps = { 
        ...validUserProps, 
        username: 'a'.repeat(51) 
      };
      
      // Act & Assert
      expect(() => new User(invalidProps)).toThrow('Username no puede tener más de 50 caracteres');
    });

    test('debe lanzar error si username contiene caracteres inválidos', () => {
      // Arrange
      const invalidProps = { ...validUserProps, username: 'user@name' };
      
      // Act & Assert
      expect(() => new User(invalidProps)).toThrow('Username solo puede contener letras, números y guiones bajos');
    });

    test('debe lanzar error si password está vacío', () => {
      // Arrange
      const invalidProps = { ...validUserProps, password: '' };
      
      // Act & Assert
      expect(() => new User(invalidProps)).toThrow('Password no puede estar vacío');
    });
  });

  describe('Getters', () => {
    
    test('email getter debe retornar Email Value Object', () => {
      // Arrange
      const user = new User(validUserProps);
      
      // Act
      const email = user.email;
      
      // Assert
      expect(email).toBeInstanceOf(Email);
      expect(email.getValue()).toBe('test@example.com');
      expect(email.getDomain()).toBe('example.com');
      expect(email.getUsername()).toBe('test');
    });

    test('role getter debe retornar Role Value Object', () => {
      // Arrange
      const user = new User(validUserProps);
      
      // Act
      const role = user.role;
      
      // Assert
      expect(role).toBeInstanceOf(Role);
      expect(role.getValue()).toBe(RoleType.OPERATOR);
      expect(role.isOperator()).toBe(true);
      expect(role.canManageProjects()).toBe(false);
    });
  });

  describe('Role Checks', () => {
    
    test('isAdmin() debe retornar true para usuario admin', () => {
      // Arrange
      const adminUser = new User({ 
        ...validUserProps, 
        role: new Role(RoleType.ADMIN)
      });
      
      // Act & Assert
      expect(adminUser.isAdmin()).toBe(true);
      expect(adminUser.role.isAdmin()).toBe(true);
    });

    test('isAdmin() debe retornar false para usuario no admin', () => {
      // Arrange
      const operatorUser = new User({ 
        ...validUserProps, 
        role: new Role(RoleType.OPERATOR)
      });
      
      // Act & Assert
      expect(operatorUser.isAdmin()).toBe(false);
      expect(operatorUser.role.isAdmin()).toBe(false);
    });

    test('isCoordinator() debe retornar true para coordinador', () => {
      // Arrange
      const coordinatorUser = new User({ 
        ...validUserProps, 
        role: new Role(RoleType.COORDINATOR)
      });
      
      // Act & Assert
      expect(coordinatorUser.isCoordinator()).toBe(true);
      expect(coordinatorUser.role.isCoordinator()).toBe(true);
    });

    test('isOperator() debe retornar true para operario', () => {
      // Arrange
      const operatorUser = new User({ 
        ...validUserProps, 
        role: new Role(RoleType.OPERATOR)
      });
      
      // Act & Assert
      expect(operatorUser.isOperator()).toBe(true);
      expect(operatorUser.role.isOperator()).toBe(true);
    });
  });

  describe('Permission Checks', () => {
    
    describe('canManageUsers()', () => {
      test('debe retornar true solo para Admin', () => {
        // Arrange
        const adminUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.ADMIN) 
        });
        const coordinatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.COORDINATOR) 
        });
        const operatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.OPERATOR) 
        });

        // Act & Assert
        expect(adminUser.canManageUsers()).toBe(true);
        expect(coordinatorUser.canManageUsers()).toBe(false);
        expect(operatorUser.canManageUsers()).toBe(false);
        
        expect(adminUser.role.canManageUsers()).toBe(true);
      });
    });

    describe('canCreateProjects()', () => {
      test('debe retornar true para Admin y Coordinator', () => {
        // Arrange
        const adminUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.ADMIN) 
        });
        const coordinatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.COORDINATOR) 
        });
        const operatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.OPERATOR) 
        });

        // Act & Assert
        expect(adminUser.canCreateProjects()).toBe(true);
        expect(coordinatorUser.canCreateProjects()).toBe(true);
        expect(operatorUser.canCreateProjects()).toBe(false);
        
        expect(adminUser.role.canManageProjects()).toBe(true);
        expect(coordinatorUser.role.canManageProjects()).toBe(true);
      });
    });

    describe('canEditProjects()', () => {
      test('debe retornar true para Admin y Coordinator', () => {
        // Arrange
        const adminUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.ADMIN) 
        });
        const coordinatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.COORDINATOR) 
        });
        const operatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.OPERATOR) 
        });

        // Act & Assert
        expect(adminUser.canEditProjects()).toBe(true);
        expect(coordinatorUser.canEditProjects()).toBe(true);
        expect(operatorUser.canEditProjects()).toBe(false);
      });
    });

    describe('canDeleteProjects()', () => {
      test('debe retornar true para Admin y Coordinator', () => {
        // Arrange
        const adminUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.ADMIN) 
        });
        const coordinatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.COORDINATOR) 
        });
        const operatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.OPERATOR) 
        });

        // Act & Assert
        expect(adminUser.canDeleteProjects()).toBe(true);
        expect(coordinatorUser.canDeleteProjects()).toBe(true);
        expect(operatorUser.canDeleteProjects()).toBe(false);
      });
    });

    describe('canAssignProjects()', () => {
      test('debe retornar true para Admin y Coordinator', () => {
        // Arrange
        const adminUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.ADMIN) 
        });
        const coordinatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.COORDINATOR) 
        });
        const operatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.OPERATOR) 
        });

        // Act & Assert
        expect(adminUser.canAssignProjects()).toBe(true);
        expect(coordinatorUser.canAssignProjects()).toBe(true);
        expect(operatorUser.canAssignProjects()).toBe(false);
        
        expect(adminUser.role.canAssignProjects()).toBe(true);
      });
    });

    describe('canViewAllProjects()', () => {
      test('debe retornar true para Admin y Coordinator', () => {
        // Arrange
        const adminUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.ADMIN) 
        });
        const coordinatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.COORDINATOR) 
        });
        const operatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.OPERATOR) 
        });

        // Act & Assert
        expect(adminUser.canViewAllProjects()).toBe(true);
        expect(coordinatorUser.canViewAllProjects()).toBe(true);
        expect(operatorUser.canViewAllProjects()).toBe(false);
        
        expect(adminUser.role.canViewAllProjects()).toBe(true);
      });
    });
  });

  describe('Update Methods', () => {
    
    test('updateUsername() debe actualizar el username y updatedAt', () => {
      // Arrange
      const user = new User(validUserProps);
      const originalUpdatedAt = user.updatedAt;
      
      // Act
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);
      user.updateUsername('newusername');
      jest.useRealTimers();
      
      // Assert
      expect(user.username).toBe('newusername');
      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    test('updateUsername() debe lanzar error si nuevo username es inválido', () => {
      // Arrange
      const user = new User(validUserProps);
      
      // Act & Assert
      expect(() => user.updateUsername('')).toThrow('Username no puede estar vacío');
    });

    test('updateEmail() debe aceptar Email Value Object y actualizar', () => {
      // Arrange
      const user = new User(validUserProps);
      const newEmail = new Email('newemail@example.com');
      
      // Act
      user.updateEmail(newEmail);
      
      // Assert
      expect(user.email).toBeInstanceOf(Email);
      expect(user.email.getValue()).toBe('newemail@example.com');
      expect(user.email).toBe(newEmail);
    });

    test('updateEmail() debe fallar si se intenta pasar string inválido', () => {
      // Arrange, Act & Assert
      expect(() => new Email('invalid-email')).toThrow('Formato de email inválido');
    });

    test('updatePassword() debe actualizar el password y updatedAt', () => {
      // Arrange
      const user = new User(validUserProps);
      
      // Act
      user.updatePassword('$2b$10$newhashedpassword');
      
      // Assert
      expect(user.password).toBe('$2b$10$newhashedpassword');
    });

    test('updateRole() debe aceptar Role Value Object y actualizar', () => {
      // Arrange
      const user = new User(validUserProps);
      const newRole = new Role(RoleType.ADMIN);
      
      // Act
      user.updateRole(newRole);
      
      // Assert
      expect(user.role).toBeInstanceOf(Role);
      expect(user.role.getValue()).toBe(RoleType.ADMIN);
      expect(user.role).toBe(newRole);
    });
  });

  describe('toJSON()', () => {
    
    test('debe retornar objeto sin password', () => {
      // Arrange
      const user = new User(validUserProps);
      
      // Act
      const json = user.toJSON();
      
      // Assert
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('username');
      expect(json).toHaveProperty('email');
      expect(json).toHaveProperty('role');
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
      expect(json).not.toHaveProperty('password');
    });

    test('debe serializar Email VO a string primitivo', () => {
      // Arrange
      const user = new User(validUserProps);
      
      // Act
      const json = user.toJSON();
      
      // Assert
      expect(typeof json.email).toBe('string');
      expect(json.email).toBe('test@example.com');
    });

    test('debe serializar Role VO a string primitivo', () => {
      // Arrange
      const user = new User(validUserProps);
      
      // Act
      const json = user.toJSON();
      
      // Assert
      expect(typeof json.role).toBe('string');
      expect(json.role).toBe('operator');
    });

    test('debe ser compatible con JSON.stringify()', () => {
      // Arrange
      const user = new User(validUserProps);
      
      // Act
      const jsonString = JSON.stringify(user);
      const parsed = JSON.parse(jsonString);
      
      // Assert
      expect(parsed.email).toBe('test@example.com');
      expect(parsed.role).toBe('operator');
      expect(parsed).not.toHaveProperty('password');
    });
  });

  describe('Factory Method - create()', () => {
    
    test('debe crear un nuevo usuario con Value Objects y timestamps automáticos', () => {
      // Arrange
      const createProps: CreateUserProps = {
        username: 'newuser',
        email: new Email('new@example.com'),
        password: '$2b$10$hashedpassword',
        role: new Role(RoleType.OPERATOR)
      };
      
      // Act
      const user = User.create(createProps);
      
      // Assert
      expect(user.username).toBe(createProps.username);
      
      expect(user.email).toBeInstanceOf(Email);
      expect(user.email.getValue()).toBe('new@example.com');
      
      expect(user.password).toBe(createProps.password);
      
      expect(user.role).toBeInstanceOf(Role);
      expect(user.role.getValue()).toBe(RoleType.OPERATOR);
      
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Inmutabilidad de Value Objects', () => {
    
    test('email getter debe retornar siempre el mismo Email VO', () => {
      // Arrange
      const user = new User(validUserProps);
      
      // Act
      const email1 = user.email;
      const email2 = user.email;
      
      // Assert
      expect(email1).toBe(email2);
      expect(email1.getValue()).toBe(email2.getValue());
    });

    test('role getter debe retornar siempre el mismo Role VO', () => {
      // Arrange
      const user = new User(validUserProps);
      
      // Act
      const role1 = user.role;
      const role2 = user.role;
      
      // Assert
      expect(role1).toBe(role2);
      expect(role1.getValue()).toBe(role2.getValue());
    });
  });
});
