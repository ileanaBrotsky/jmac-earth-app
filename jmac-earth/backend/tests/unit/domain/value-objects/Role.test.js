/**
 * =============================================================================
 * ROLE VALUE OBJECT - UNIT TESTS
 * =============================================================================
 * Tests unitarios para el Value Object Role
 * 
 * @module tests/unit/domain/value-objects/Role.test
 * =============================================================================
 */

import { Role } from '../../../../src/domain/value-objects/Role.js';
import { ROLES } from '../../../../src/shared/constants/roles.js';

describe('Role Value Object', () => {
  describe('constructor', () => {
    test('debe crear un rol válido correctamente', () => {
      // Arrange & Act
      const role = new Role('admin');

      // Assert
      expect(role.getValue()).toBe('admin');
    });

    test('debe normalizar el rol a minúsculas', () => {
      // Arrange & Act
      const role = new Role('ADMIN');

      // Assert
      expect(role.getValue()).toBe('admin');
    });

    test('debe crear todos los roles válidos', () => {
      // Arrange, Act & Assert
      expect(() => new Role('admin')).not.toThrow();
      expect(() => new Role('coordinator')).not.toThrow();
      expect(() => new Role('operator')).not.toThrow();
    });

    test('debe lanzar error si el rol está vacío', () => {
      // Arrange, Act & Assert
      expect(() => new Role('')).toThrow('Rol no puede estar vacío');
      expect(() => new Role(null)).toThrow('Rol no puede estar vacío');
      expect(() => new Role(undefined)).toThrow('Rol no puede estar vacío');
    });

    test('debe lanzar error si el rol no es un string', () => {
      // Arrange, Act & Assert
      expect(() => new Role(123)).toThrow('Rol debe ser un string');
      expect(() => new Role({})).toThrow('Rol debe ser un string');
      expect(() => new Role([])).toThrow('Rol debe ser un string');
    });

    test('debe lanzar error si el rol es inválido', () => {
      // Arrange, Act & Assert
      expect(() => new Role('superuser')).toThrow(/Rol inválido/);
      expect(() => new Role('guest')).toThrow(/Rol inválido/);
      expect(() => new Role('moderator')).toThrow(/Rol inválido/);
    });
  });

  describe('getValue', () => {
    test('debe retornar el valor normalizado del rol', () => {
      // Arrange
      const role = new Role('COORDINATOR');

      // Act
      const value = role.getValue();

      // Assert
      expect(value).toBe('coordinator');
    });
  });

  describe('equals', () => {
    test('debe retornar true para roles idénticos', () => {
      // Arrange
      const role1 = new Role('admin');
      const role2 = new Role('admin');

      // Act & Assert
      expect(role1.equals(role2)).toBe(true);
    });

    test('debe retornar true para roles con diferente capitalización', () => {
      // Arrange
      const role1 = new Role('admin');
      const role2 = new Role('ADMIN');

      // Act & Assert
      expect(role1.equals(role2)).toBe(true);
    });

    test('debe retornar false para roles diferentes', () => {
      // Arrange
      const role1 = new Role('admin');
      const role2 = new Role('operator');

      // Act & Assert
      expect(role1.equals(role2)).toBe(false);
    });

    test('debe retornar false si el parámetro no es instancia de Role', () => {
      // Arrange
      const role = new Role('admin');

      // Act & Assert
      expect(role.equals('admin')).toBe(false);
      expect(role.equals(null)).toBe(false);
      expect(role.equals({})).toBe(false);
    });
  });

  describe('isAdmin', () => {
    test('debe retornar true para rol admin', () => {
      // Arrange
      const role = new Role('admin');

      // Act & Assert
      expect(role.isAdmin()).toBe(true);
    });

    test('debe retornar false para otros roles', () => {
      // Arrange
      const coordinator = new Role('coordinator');
      const operator = new Role('operator');

      // Act & Assert
      expect(coordinator.isAdmin()).toBe(false);
      expect(operator.isAdmin()).toBe(false);
    });
  });

  describe('isCoordinator', () => {
    test('debe retornar true para rol coordinator', () => {
      // Arrange
      const role = new Role('coordinator');

      // Act & Assert
      expect(role.isCoordinator()).toBe(true);
    });

    test('debe retornar false para otros roles', () => {
      // Arrange
      const admin = new Role('admin');
      const operator = new Role('operator');

      // Act & Assert
      expect(admin.isCoordinator()).toBe(false);
      expect(operator.isCoordinator()).toBe(false);
    });
  });

  describe('isOperator', () => {
    test('debe retornar true para rol operator', () => {
      // Arrange
      const role = new Role('operator');

      // Act & Assert
      expect(role.isOperator()).toBe(true);
    });

    test('debe retornar false para otros roles', () => {
      // Arrange
      const admin = new Role('admin');
      const coordinator = new Role('coordinator');

      // Act & Assert
      expect(admin.isOperator()).toBe(false);
      expect(coordinator.isOperator()).toBe(false);
    });
  });

  describe('hasPermission', () => {
    describe('ADMIN', () => {
      test('debe tener todos los permisos', () => {
        // Arrange
        const role = new Role('admin');

        // Act & Assert
        expect(role.hasPermission('createUser')).toBe(true);
        expect(role.hasPermission('deleteUser')).toBe(true);
        expect(role.hasPermission('createProject')).toBe(true);
        expect(role.hasPermission('deleteProject')).toBe(true);
        expect(role.hasPermission('readAllProjects')).toBe(true);
        expect(role.hasPermission('assignProject')).toBe(true);
      });
    });

    describe('COORDINATOR', () => {
      test('debe tener permisos de proyectos pero no de usuarios', () => {
        // Arrange
        const role = new Role('coordinator');

        // Act & Assert - NO puede gestionar usuarios
        expect(role.hasPermission('createUser')).toBe(false);
        expect(role.hasPermission('deleteUser')).toBe(false);

        // Assert - SÍ puede gestionar proyectos
        expect(role.hasPermission('createProject')).toBe(true);
        expect(role.hasPermission('deleteProject')).toBe(true);
        expect(role.hasPermission('readAllProjects')).toBe(true);
        expect(role.hasPermission('assignProject')).toBe(true);
      });
    });

    describe('OPERATOR', () => {
      test('debe tener solo permisos de lectura limitados', () => {
        // Arrange
        const role = new Role('operator');

        // Act & Assert - NO puede gestionar usuarios
        expect(role.hasPermission('createUser')).toBe(false);
        expect(role.hasPermission('deleteUser')).toBe(false);

        // Assert - NO puede gestionar proyectos
        expect(role.hasPermission('createProject')).toBe(false);
        expect(role.hasPermission('deleteProject')).toBe(false);
        expect(role.hasPermission('assignProject')).toBe(false);

        // Assert - NO puede ver todos los proyectos
        expect(role.hasPermission('readAllProjects')).toBe(false);

        // Assert - SÍ puede leer proyectos asignados
        expect(role.hasPermission('readProject')).toBe(true);

        // Assert - SÍ puede exportar KMZ
        expect(role.hasPermission('exportKMZ')).toBe(true);
      });
    });
  });

  describe('canManageUsers', () => {
    test('solo ADMIN puede gestionar usuarios', () => {
      // Arrange
      const admin = new Role('admin');
      const coordinator = new Role('coordinator');
      const operator = new Role('operator');

      // Act & Assert
      expect(admin.canManageUsers()).toBe(true);
      expect(coordinator.canManageUsers()).toBe(false);
      expect(operator.canManageUsers()).toBe(false);
    });
  });

  describe('canManageProjects', () => {
    test('ADMIN y COORDINATOR pueden gestionar proyectos', () => {
      // Arrange
      const admin = new Role('admin');
      const coordinator = new Role('coordinator');
      const operator = new Role('operator');

      // Act & Assert
      expect(admin.canManageProjects()).toBe(true);
      expect(coordinator.canManageProjects()).toBe(true);
      expect(operator.canManageProjects()).toBe(false);
    });
  });

  describe('canViewAllProjects', () => {
    test('ADMIN y COORDINATOR pueden ver todos los proyectos', () => {
      // Arrange
      const admin = new Role('admin');
      const coordinator = new Role('coordinator');
      const operator = new Role('operator');

      // Act & Assert
      expect(admin.canViewAllProjects()).toBe(true);
      expect(coordinator.canViewAllProjects()).toBe(true);
      expect(operator.canViewAllProjects()).toBe(false);
    });
  });

  describe('canAssignProjects', () => {
    test('ADMIN y COORDINATOR pueden asignar proyectos', () => {
      // Arrange
      const admin = new Role('admin');
      const coordinator = new Role('coordinator');
      const operator = new Role('operator');

      // Act & Assert
      expect(admin.canAssignProjects()).toBe(true);
      expect(coordinator.canAssignProjects()).toBe(true);
      expect(operator.canAssignProjects()).toBe(false);
    });
  });

  describe('toString', () => {
    test('debe retornar el rol como string', () => {
      // Arrange
      const role = new Role('admin');

      // Act
      const str = role.toString();

      // Assert
      expect(str).toBe('admin');
    });
  });

  describe('toJSON', () => {
    test('debe retornar el rol como string para JSON', () => {
      // Arrange
      const role = new Role('coordinator');

      // Act
      const json = role.toJSON();

      // Assert
      expect(json).toBe('coordinator');
    });

    test('debe ser serializable con JSON.stringify', () => {
      // Arrange
      const role = new Role('operator');
      const obj = { role };

      // Act
      const jsonString = JSON.stringify(obj);

      // Assert
      expect(jsonString).toBe('{"role":"operator"}');
    });
  });

  describe('isValid (static)', () => {
    test('debe retornar true para roles válidos', () => {
      // Act & Assert
      expect(Role.isValid('admin')).toBe(true);
      expect(Role.isValid('coordinator')).toBe(true);
      expect(Role.isValid('operator')).toBe(true);
      expect(Role.isValid('ADMIN')).toBe(true);
    });

    test('debe retornar false para roles inválidos', () => {
      // Act & Assert
      expect(Role.isValid('superuser')).toBe(false);
      expect(Role.isValid('guest')).toBe(false);
      expect(Role.isValid('')).toBe(false);
      expect(Role.isValid(null)).toBe(false);
    });
  });

  describe('factory methods', () => {
    test('createAdmin debe crear un rol de admin', () => {
      // Act
      const role = Role.createAdmin();

      // Assert
      expect(role.getValue()).toBe(ROLES.ADMIN);
      expect(role.isAdmin()).toBe(true);
    });

    test('createCoordinator debe crear un rol de coordinator', () => {
      // Act
      const role = Role.createCoordinator();

      // Assert
      expect(role.getValue()).toBe(ROLES.COORDINATOR);
      expect(role.isCoordinator()).toBe(true);
    });

    test('createOperator debe crear un rol de operator', () => {
      // Act
      const role = Role.createOperator();

      // Assert
      expect(role.getValue()).toBe(ROLES.OPERATOR);
      expect(role.isOperator()).toBe(true);
    });
  });

  describe('inmutabilidad', () => {
    test('el valor del rol no debe poder modificarse', () => {
      // Arrange
      const role = new Role('admin');
      const originalValue = role.getValue();

      // Act - intentar modificar (no debería afectar el valor interno)
      try {
        role.value = 'operator';
      } catch (e) {
        // Esperado - propiedad privada
      }

      // Assert
      expect(role.getValue()).toBe(originalValue);
    });
  });
});
