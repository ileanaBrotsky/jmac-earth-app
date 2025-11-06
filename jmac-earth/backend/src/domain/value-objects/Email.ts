/**
 * Email Value Object
 * 
 * Value Object inmutable que representa un email válido.
 * Encapsula validaciones de formato y proporciona métodos útiles.
 * 
 * @module domain/value-objects/Email
 */

export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_LENGTH = 5;
  private static readonly MAX_LENGTH = 255;

  private readonly value: string;

  /**
   * Crea una instancia de Email
   * 
   * @param {string} email - Email a validar y almacenar
   * @throws {Error} Si el email es inválido
   */
  constructor(email: string) {
    this.validate(email);
    this.value = email.trim().toLowerCase();
  }

  /**
   * Valida el formato del email
   */
  private validate(email: string): void {
    if (!email) {
      throw new Error('Email no puede estar vacío');
    }

    if (typeof email !== 'string') {
      throw new Error('Email debe ser un string');
    }

    const trimmedEmail = email.trim();

    if (trimmedEmail.length < Email.MIN_LENGTH) {
      throw new Error(`Email debe tener al menos ${Email.MIN_LENGTH} caracteres`);
    }

    if (trimmedEmail.length > Email.MAX_LENGTH) {
      throw new Error(`Email no puede exceder ${Email.MAX_LENGTH} caracteres`);
    }

    if (!Email.EMAIL_REGEX.test(trimmedEmail)) {
      throw new Error('Formato de email inválido');
    }
  }

  /**
   * Obtiene el valor del email normalizado
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Compara este email con otro
   */
  equals(other: Email): boolean {
    if (!(other instanceof Email)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Obtiene el dominio del email (parte después del @)
   */
  getDomain(): string {
    const parts = this.value.split('@');
    const domain = parts[1];
    if (!domain) {
      throw new Error('Email inválido: no se pudo extraer el dominio');
    }
    return domain;
  }

  /**
   * Obtiene el nombre de usuario del email (parte antes del @)
   */
  getUsername(): string {
    const parts = this.value.split('@');
    const username = parts[0];
    if (!username) {
      throw new Error('Email inválido: no se pudo extraer el nombre de usuario');
    }
    return username;
  }

  /**
   * Representación en string del email
   */
  toString(): string {
    return this.value;
  }

  /**
   * Representación JSON del email
   */
  toJSON(): string {
    return this.value;
  }

  /**
   * Valida un email sin crear una instancia
   * 
   * @param {string} email - Email a validar
   * @returns {boolean} true si el email es válido
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