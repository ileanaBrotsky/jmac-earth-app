/**
 * =============================================================================
 * EMAIL VALUE OBJECT - UNIT TESTS
 * =============================================================================
 * Tests unitarios para el Value Object Email
 * 
 * Valida:
 * - Construcción correcta de emails válidos
 * - Normalización (lowercase, trim)
 * - Validaciones (formato, longitud, tipo)
 * - Métodos de comparación y utilidad
 * - Inmutabilidad
 * 
 * @module tests/unit/domain/value-objects/Email.test
 * =============================================================================
 */

import { Email } from '../../../../src/domain/value-objects/Email';

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
      expect(() => new Email(null as any)).toThrow('Email no puede estar vacío');
      expect(() => new Email(undefined as any)).toThrow('Email no puede estar vacío');
    });

    test('debe lanzar error si el email no es un string', () => {
      // Arrange, Act & Assert
      expect(() => new Email(123 as any)).toThrow('Email debe ser un string');
      expect(() => new Email({} as any)).toThrow('Email debe ser un string');
      expect(() => new Email([] as any)).toThrow('Email debe ser un string');
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

    test('debe aceptar emails válidos con diferentes formatos', () => {
      // Arrange & Act & Assert
      expect(() => new Email('user@example.com')).not.toThrow();
      expect(() => new Email('user.name@example.com')).not.toThrow();
      expect(() => new Email('user+tag@example.com')).not.toThrow();
      expect(() => new Email('user_name@example.co.uk')).not.toThrow();
      expect(() => new Email('123@example.com')).not.toThrow();
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
      expect(email.equals('user@example.com' as any)).toBe(false);
      expect(email.equals(null as any)).toBe(false);
      expect(email.equals({} as any)).toBe(false);
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

    test('debe retornar el nombre de usuario con caracteres especiales', () => {
      // Arrange
      const email = new Email('user+tag@example.com');

      // Act
      const username = email.getUsername();

      // Assert
      expect(username).toBe('user+tag');
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

    test('debe funcionar con template literals', () => {
      // Arrange
      const email = new Email('user@example.com');

      // Act
      const message = `Email: ${email}`;

      // Assert
      expect(message).toBe('Email: user@example.com');
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
      expect(Email.isValid('USER@EXAMPLE.COM')).toBe(true);
    });

    test('debe retornar false para emails inválidos', () => {
      // Act & Assert
      expect(Email.isValid('invalid-email')).toBe(false);
      expect(Email.isValid('@example.com')).toBe(false);
      expect(Email.isValid('user@')).toBe(false);
      expect(Email.isValid('')).toBe(false);
      expect(Email.isValid(null as any)).toBe(false);
      expect(Email.isValid(undefined as any)).toBe(false);
    });
  });

  describe('inmutabilidad', () => {
    test('getValue debe retornar siempre el mismo valor', () => {
      // Arrange
      const email = new Email('user@example.com');

      // Act
      const value1 = email.getValue();
      const value2 = email.getValue();

      // Assert
      expect(value1).toBe(value2);
      expect(value1).toBe('user@example.com');
    });

    test('dos instancias con el mismo email deben ser iguales', () => {
      // Arrange
      const email1 = new Email('user@example.com');
      const email2 = new Email('user@example.com');

      // Act & Assert
      expect(email1.equals(email2)).toBe(true);
      expect(email1.getValue()).toBe(email2.getValue());
    });

    test('la normalización debe ser consistente', () => {
      // Arrange
      const email1 = new Email('USER@EXAMPLE.COM');
      const email2 = new Email('user@example.com');
      const email3 = new Email('  User@Example.Com  ');

      // Act & Assert
      expect(email1.getValue()).toBe('user@example.com');
      expect(email2.getValue()).toBe('user@example.com');
      expect(email3.getValue()).toBe('user@example.com');
      expect(email1.equals(email2)).toBe(true);
      expect(email2.equals(email3)).toBe(true);
    });
  });

  describe('casos edge', () => {
    test('debe manejar emails con múltiples puntos en el username', () => {
      // Arrange & Act
      const email = new Email('first.middle.last@example.com');

      // Assert
      expect(email.getValue()).toBe('first.middle.last@example.com');
      expect(email.getUsername()).toBe('first.middle.last');
    });

    test('debe manejar emails con números', () => {
      // Arrange & Act
      const email = new Email('user123@example123.com');

      // Assert
      expect(email.getValue()).toBe('user123@example123.com');
    });

    test('debe manejar subdominios múltiples', () => {
      // Arrange & Act
      const email = new Email('user@mail.subdomain.example.com');

      // Assert
      expect(email.getDomain()).toBe('mail.subdomain.example.com');
    });

    test('debe manejar correctamente espacios múltiples', () => {
      // Arrange & Act
      const email = new Email('   user@example.com   ');

      // Assert
      expect(email.getValue()).toBe('user@example.com');
    });
  });
});