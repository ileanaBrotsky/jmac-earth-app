/**
 * =============================================================================
 * EMAIL VALUE OBJECT
 * =============================================================================
 * Representa un email válido en el dominio.
 * 
 * Este archivo es parte de la CAPA DE DOMINIO (Domain Layer).
 * Los Value Objects son INMUTABLES y contienen lógica de validación.
 * 
 * Características de un Value Object:
 * - Inmutable (no se puede modificar después de creado)
 * - Se compara por valor, no por referencia
 * - Encapsula lógica de validación
 * - No tiene identidad propia
 * 
 * @module domain/value-objects/Email
 * =============================================================================
 */

/**
 * Value Object que representa un email válido
 * 
 * @class Email
 * @example
 * ```typescript
 * const email = new Email('user@example.com');
 * console.log(email.getValue()); // 'user@example.com'
 * console.log(email.getDomain()); // 'example.com'
 * ```
 */
export class Email {
  /**
   * Expresión regular para validar formato de email
   * Acepta formato estándar: usuario@dominio.extension
   * @private
   * @static
   * @readonly
   */
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Longitud mínima permitida para un email
   * @private
   * @static
   * @readonly
   */
  private static readonly MIN_LENGTH = 5;

  /**
   * Longitud máxima permitida para un email
   * @private
   * @static
   * @readonly
   */
  private static readonly MAX_LENGTH = 255;

  /**
   * Valor del email (privado, inmutable)
   * @private
   * @readonly
   */
  private readonly value: string;

  /**
   * Crea una instancia de Email
   * 
   * @param {string} email - Email a validar y almacenar
   * @throws {Error} Si el email es inválido
   * 
   * @example
   * ```typescript
   * const email = new Email('user@example.com');
   * const emailUppercase = new Email('USER@EXAMPLE.COM'); // Se normaliza a minúsculas
   * ```
   */
  constructor(email: string) {
    this.validate(email);
    // Normalizar: convertir a minúsculas y eliminar espacios
    this.value = email.trim().toLowerCase();
  }

  /**
   * Valida el formato del email
   * 
   * @private
   * @param {string} email - Email a validar
   * @throws {Error} Si el email es inválido
   */
  private validate(email: string): void {
    // Verificar que no sea null o undefined
    if (!email) {
      throw new Error('Email no puede estar vacío');
    }

    // Verificar que sea string
    if (typeof email !== 'string') {
      throw new Error('Email debe ser un string');
    }

    // Eliminar espacios para validación
    const trimmedEmail = email.trim();

    // Verificar longitud mínima
    if (trimmedEmail.length < Email.MIN_LENGTH) {
      throw new Error(`Email debe tener al menos ${Email.MIN_LENGTH} caracteres`);
    }

    // Verificar longitud máxima
    if (trimmedEmail.length > Email.MAX_LENGTH) {
      throw new Error(`Email no puede exceder ${Email.MAX_LENGTH} caracteres`);
    }

    // Verificar formato con regex
    if (!Email.EMAIL_REGEX.test(trimmedEmail)) {
      throw new Error('Formato de email inválido');
    }
  }

  /**
   * Obtiene el valor del email
   * 
   * @returns {string} Email normalizado (minúsculas, sin espacios)
   * 
   * @example
   * ```typescript
   * const email = new Email('User@Example.COM  ');
   * console.log(email.getValue()); // 'user@example.com'
   * ```
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Compara este email con otro
   * Dos emails son iguales si tienen el mismo valor (después de normalizar)
   * 
   * @param {Email} other - Otro email para comparar
   * @returns {boolean} true si son iguales
   * 
   * @example
   * ```typescript
   * const email1 = new Email('user@example.com');
   * const email2 = new Email('USER@EXAMPLE.COM');
   * console.log(email1.equals(email2)); // true
   * 
   * const email3 = new Email('other@example.com');
   * console.log(email1.equals(email3)); // false
   * ```
   */
  equals(other: Email): boolean {
    if (!(other instanceof Email)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Obtiene el dominio del email
   * 
   * @returns {string} Dominio del email (parte después del @)
   * 
   * @example
   * ```typescript
   * const email = new Email('user@example.com');
   * console.log(email.getDomain()); // 'example.com'
   * 
   * const email2 = new Email('admin@mail.company.org');
   * console.log(email2.getDomain()); // 'mail.company.org'
   * ```
   */
  getDomain(): string {
    return this.value.split('@')[1];
  }

  /**
   * Obtiene el nombre de usuario del email
   * 
   * @returns {string} Nombre de usuario (parte antes del @)
   * 
   * @example
   * ```typescript
   * const email = new Email('user.name@example.com');
   * console.log(email.getUsername()); // 'user.name'
   * ```
   */
  getUsername(): string {
    return this.value.split('@')[0];
  }

  /**
   * Representación en string del email
   * 
   * @returns {string} Email como string
   * 
   * @example
   * ```typescript
   * const email = new Email('user@example.com');
   * console.log(email.toString()); // 'user@example.com'
   * console.log(`Email: ${email}`); // 'Email: user@example.com'
   * ```
   */
  toString(): string {
    return this.value;
  }

  /**
   * Representación JSON del email
   * Útil para serialización
   * 
   * @returns {string} Email como string
   * 
   * @example
   * ```typescript
   * const email = new Email('user@example.com');
   * console.log(JSON.stringify({ email })); 
   * // {"email":"user@example.com"}
   * ```
   */
  toJSON(): string {
    return this.value;
  }

  /**
   * Valida un email sin crear una instancia
   * Útil para validaciones previas sin lanzar excepciones
   * 
   * @static
   * @param {string} email - Email a validar
   * @returns {boolean} true si el email es válido
   * 
   * @example
   * ```typescript
   * Email.isValid('user@example.com') // true
   * Email.isValid('invalid-email') // false
   * Email.isValid('') // false
   * Email.isValid(null) // false
   * ```
   */
  static isValid(email: string): boolean {
    try {
      new Email(email);
      return true;
    } catch {
      return false;
    }
  }
}