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
 * @class
 */
export class Email {
  /**
   * Expresión regular para validar formato de email
   * Acepta formato estándar: usuario@dominio.extension
   * @private
   * @static
   * @type {RegExp}
   */
  static #EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Valor del email (privado, inmutable)
   * @private
   * @type {string}
   */
  #value;

  /**
   * Crea una instancia de Email
   * 
   * @param {string} email - Email a validar y almacenar
   * @throws {Error} Si el email es inválido
   * 
   * @example
   * const email = new Email('user@example.com');
   * console.log(email.getValue()); // 'user@example.com'
   */
  constructor(email) {
    this.#validate(email);
    // Normalizar: convertir a minúsculas y eliminar espacios
    this.#value = email.trim().toLowerCase();
  }

  /**
   * Valida el formato del email
   * 
   * @private
   * @param {string} email - Email a validar
   * @throws {Error} Si el email es inválido
   */
  #validate(email) {
    // Verificar que no sea null o undefined
    if (!email) {
      throw new Error('Email no puede estar vacío');
    }

    // Verificar que sea string
    if (typeof email !== 'string') {
      throw new Error('Email debe ser un string');
    }

    // Eliminar espacios
    const trimmedEmail = email.trim();

    // Verificar longitud mínima
    if (trimmedEmail.length < 5) {
      throw new Error('Email debe tener al menos 5 caracteres');
    }

    // Verificar longitud máxima
    if (trimmedEmail.length > 255) {
      throw new Error('Email no puede exceder 255 caracteres');
    }

    // Verificar formato con regex
    if (!Email.#EMAIL_REGEX.test(trimmedEmail)) {
      throw new Error('Formato de email inválido');
    }
  }

  /**
   * Obtiene el valor del email
   * 
   * @returns {string} Email normalizado
   * 
   * @example
   * const email = new Email('User@Example.COM  ');
   * console.log(email.getValue()); // 'user@example.com'
   */
  getValue() {
    return this.#value;
  }

  /**
   * Compara este email con otro
   * Dos emails son iguales si tienen el mismo valor (después de normalizar)
   * 
   * @param {Email} other - Otro email para comparar
   * @returns {boolean} true si son iguales
   * 
   * @example
   * const email1 = new Email('user@example.com');
   * const email2 = new Email('USER@EXAMPLE.COM');
   * console.log(email1.equals(email2)); // true
   */
  equals(other) {
    if (!(other instanceof Email)) {
      return false;
    }
    return this.#value === other.#value;
  }

  /**
   * Obtiene el dominio del email
   * 
   * @returns {string} Dominio del email
   * 
   * @example
   * const email = new Email('user@example.com');
   * console.log(email.getDomain()); // 'example.com'
   */
  getDomain() {
    return this.#value.split('@')[1];
  }

  /**
   * Obtiene el nombre de usuario del email
   * 
   * @returns {string} Nombre de usuario
   * 
   * @example
   * const email = new Email('user@example.com');
   * console.log(email.getUsername()); // 'user'
   */
  getUsername() {
    return this.#value.split('@')[0];
  }

  /**
   * Representación en string del email
   * 
   * @returns {string} Email como string
   */
  toString() {
    return this.#value;
  }

  /**
   * Representación JSON del email
   * 
   * @returns {string} Email como string
   */
  toJSON() {
    return this.#value;
  }

  /**
   * Valida un email sin crear una instancia
   * Útil para validaciones previas
   * 
   * @static
   * @param {string} email - Email a validar
   * @returns {boolean} true si el email es válido
   * 
   * @example
   * Email.isValid('user@example.com') // true
   * Email.isValid('invalid-email') // false
   */
  static isValid(email) {
    try {
      new Email(email);
      return true;
    } catch {
      return false;
    }
  }
}

export default Email;
