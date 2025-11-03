/**
 * =============================================================================
 * EMAIL VALUE OBJECT - UNIT TESTS
 * =============================================================================
 * Tests unitarios para el Value Object Email
 * 
 * @module tests/unit/domain/value-objects/Email.test
 * =============================================================================
 */

import { Email } from '../../../../src/domain/value-objects/Email.js';

describe('Email Value Object', () => {
  describe('constructor', () => {
    test('debe crear un email válido correctamente', () => {
      // Arrange & Act
      const email = new Email('user@example.com');

      // Assert
      expect(email.getValue()).toBe('user@example.com');
    });

    test('debe normalizar el email a minúsculas', () => {
      // Arrange & Act
      const email = new Email('USER@EXAMPLE.COM');

      // Assert
      expect(email.getValue()).toBe('user@example.com');
    });

    test('debe eliminar espacios en blanco', () => {
      // Arrange & Act
      const email = new Email('  user@example.com  ');

      // Assert
      expect(email.getValue()).toBe('user@example.com');
    });

    test('debe lanzar error si el email está vacío', () => {
      // Arrange, Act & Assert
      expect(() => new Email('')).toThrow('Email no puede estar vacío');
      expect(() => new Email(null)).toThrow('Email no puede estar vacío');
      expect(() => new Email(undefined)).toThrow('Email no puede estar vacío');
    });

    test('debe lanzar error si el email no es un string', () => {
      // Arrange, Act & Assert
      expect(() => new Email(123)).toThrow('Email debe ser un string');
      expect(() => new Email({})).toThrow('Email debe ser un string');
      expect(() => new Email([])).toThrow('Email debe ser un string');
    });

    test('debe lanzar error si el email es muy corto', () => {
      // Arrange, Act & Assert
      expect(() => new Email('a@b')).toThrow('Email debe tener al menos 5 caracteres');
    });

    test('debe lanzar error si el email es muy largo', () => {
      // Arrange
      const longEmail = 'a'.repeat(250) + '@example.com'; // > 255 caracteres

      // Act & Assert
      expect(() => new Email(longEmail)).toThrow('Email no puede exceder 255 caracteres');
    });

    test('debe lanzar error si el formato del email es inválido', () => {
      // Arrange, Act & Assert
      expect(() => new Email('invalid-email')).toThrow('Formato de email inválido');
      expect(() => new Email('@example.com')).toThrow('Formato de email inválido');
      expect(() => new Email('user@')).toThrow('Formato de email inválido');
      expect(() => new Email('user @example.com')).toThrow('Formato de email inválido');
    });
  });

  describe('getValue', () => {
    test('debe retornar el valor normalizado del email', () => {
      // Arrange
      const email = new Email('User@Example.COM');

      // Act
      const value = email.getValue();

      // Assert
      expect(value).toBe('user@example.com');
    });
  });

  describe('equals', () => {
    test('debe retornar true para emails idénticos', () => {
      // Arrange
      const email1 = new Email('user@example.com');
      const email2 = new Email('user@example.com');

      // Act & Assert
      expect(email1.equals(email2)).toBe(true);
    });

    test('debe retornar true para emails con diferente capitalización', () => {
      // Arrange
      const email1 = new Email('user@example.com');
      const email2 = new Email('USER@EXAMPLE.COM');

      // Act & Assert
      expect(email1.equals(email2)).toBe(true);
    });

    test('debe retornar false para emails diferentes', () => {
      // Arrange
      const email1 = new Email('user1@example.com');
      const email2 = new Email('user2@example.com');

      // Act & Assert
      expect(email1.equals(email2)).toBe(false);
    });

    test('debe retornar false si el parámetro no es instancia de Email', () => {
      // Arrange
      const email = new Email('user@example.com');

      // Act & Assert
      expect(email.equals('user@example.com')).toBe(false);
      expect(email.equals(null)).toBe(false);
      expect(email.equals({})).toBe(false);
    });
  });

  describe('getDomain', () => {
    test('debe retornar el dominio del email', () => {
      // Arrange
      const email = new Email('user@example.com');

      // Act
      const domain = email.getDomain();

      // Assert
      expect(domain).toBe('example.com');
    });

    test('debe retornar el dominio con subdominios', () => {
      // Arrange
      const email = new Email('user@mail.example.com');

      // Act
      const domain = email.getDomain();

      // Assert
      expect(domain).toBe('mail.example.com');
    });
  });

  describe('getUsername', () => {
    test('debe retornar el nombre de usuario del email', () => {
      // Arrange
      const email = new Email('user@example.com');

      // Act
      const username = email.getUsername();

      // Assert
      expect(username).toBe('user');
    });

    test('debe retornar el nombre de usuario con puntos', () => {
      // Arrange
      const email = new Email('user.name@example.com');

      // Act
      const username = email.getUsername();

      // Assert
      expect(username).toBe('user.name');
    });
  });

  describe('toString', () => {
    test('debe retornar el email como string', () => {
      // Arrange
      const email = new Email('user@example.com');

      // Act
      const str = email.toString();

      // Assert
      expect(str).toBe('user@example.com');
    });
  });

  describe('toJSON', () => {
    test('debe retornar el email como string para JSON', () => {
      // Arrange
      const email = new Email('user@example.com');

      // Act
      const json = email.toJSON();

      // Assert
      expect(json).toBe('user@example.com');
    });

    test('debe ser serializable con JSON.stringify', () => {
      // Arrange
      const email = new Email('user@example.com');
      const obj = { email };

      // Act
      const jsonString = JSON.stringify(obj);

      // Assert
      expect(jsonString).toBe('{"email":"user@example.com"}');
    });
  });

  describe('isValid (static)', () => {
    test('debe retornar true para emails válidos', () => {
      // Act & Assert
      expect(Email.isValid('user@example.com')).toBe(true);
      expect(Email.isValid('test.user@example.co.uk')).toBe(true);
      expect(Email.isValid('user+tag@example.com')).toBe(true);
    });

    test('debe retornar false para emails inválidos', () => {
      // Act & Assert
      expect(Email.isValid('invalid-email')).toBe(false);
      expect(Email.isValid('@example.com')).toBe(false);
      expect(Email.isValid('user@')).toBe(false);
      expect(Email.isValid('')).toBe(false);
      expect(Email.isValid(null)).toBe(false);
    });
  });

  describe('inmutabilidad', () => {
    test('el valor del email no debe poder modificarse', () => {
      // Arrange
      const email = new Email('user@example.com');
      const originalValue = email.getValue();

      // Act - intentar modificar (no debería afectar el valor interno)
      try {
        email.value = 'hacker@evil.com';
      } catch (e) {
        // Esperado - propiedad privada
      }

      // Assert
      expect(email.getValue()).toBe(originalValue);
    });
  });
});
