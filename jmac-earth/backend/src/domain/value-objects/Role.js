/**
 * =============================================================================
 * ROLE VALUE OBJECT
 * =============================================================================
 * Representa un rol válido en el sistema.
 * 
 * Este archivo es parte de la CAPA DE DOMINIO (Domain Layer).
 * 
 * @module domain/value-objects/Role
 * =============================================================================
 */

import { ROLES, VALID_ROLES, hasPermission } from '../../shared/constants/roles.js';

/**
 * Value Object que representa un rol del sistema
 * @class
 */
export class Role {
  /**
   * Valor del rol (privado, inmutable)
   * @private
   * @type {string}
   */
  #value;

  /**
   * Crea una instancia de Role
   * 
   * @param {string} role - Rol a validar y almacenar
   * @throws {Error} Si el rol es inválido
   * 
   * @example
   * const role = new Role('admin');
   * console.log(role.getValue()); // 'admin'
   */
  constructor(role) {
    this.#validate(role);
    this.#value = role.toLowerCase();
  }

  /**
   * Valida el rol
   * 
   * @private
   * @param {string} role - Rol a validar
   * @throws {Error} Si el rol es inválido
   */
  #validate(role) {
    // Verificar que no sea null o undefined
    if (!role) {
      throw new Error('Rol no puede estar vacío');
    }

    // Verificar que sea string
    if (typeof role !== 'string') {
      throw new Error('Rol debe ser un string');
    }

    // Normalizar a minúsculas para comparación
    const normalizedRole = role.toLowerCase();

    // Verificar que sea un rol válido
    if (!VALID_ROLES.includes(normalizedRole)) {
      throw new Error(
        `Rol inválido: ${role}. Roles válidos: ${VALID_ROLES.join(', ')}`
      );
    }
  }

  /**
   * Obtiene el valor del rol
   * 
   * @returns {string} Rol normalizado
   * 
   * @example
   * const role = new Role('ADMIN');
   * console.log(role.getValue()); // 'admin'
   */
  getValue() {
    return this.#value;
  }

  /**
   * Compara este rol con otro
   * 
   * @param {Role} other - Otro rol para comparar
   * @returns {boolean} true si son iguales
   * 
   * @example
   * const role1 = new Role('admin');
   * const role2 = new Role('ADMIN');
   * console.log(role1.equals(role2)); // true
   */
  equals(other) {
    if (!(other instanceof Role)) {
      return false;
    }
    return this.#value === other.#value;
  }

  /**
   * Verifica si el rol es ADMIN
   * 
   * @returns {boolean} true si es admin
   * 
   * @example
   * const role = new Role('admin');
   * console.log(role.isAdmin()); // true
   */
  isAdmin() {
    return this.#value === ROLES.ADMIN;
  }

  /**
   * Verifica si el rol es COORDINATOR
   * 
   * @returns {boolean} true si es coordinator
   */
  isCoordinator() {
    return this.#value === ROLES.COORDINATOR;
  }

  /**
   * Verifica si el rol es OPERATOR
   * 
   * @returns {boolean} true si es operator
   */
  isOperator() {
    return this.#value === ROLES.OPERATOR;
  }

  /**
   * Verifica si el rol tiene un permiso específico
   * 
   * @param {string} permission - Permiso a verificar
   * @returns {boolean} true si tiene el permiso
   * 
   * @example
   * const role = new Role('admin');
   * console.log(role.hasPermission('createUser')); // true
   * 
   * const operatorRole = new Role('operator');
   * console.log(operatorRole.hasPermission('deleteProject')); // false
   */
  hasPermission(permission) {
    return hasPermission(this.#value, permission);
  }

  /**
   * Verifica si puede gestionar usuarios
   * Solo ADMIN puede gestionar usuarios
   * 
   * @returns {boolean} true si puede gestionar usuarios
   */
  canManageUsers() {
    return this.hasPermission('createUser');
  }

  /**
   * Verifica si puede gestionar proyectos
   * ADMIN y COORDINATOR pueden gestionar proyectos
   * 
   * @returns {boolean} true si puede gestionar proyectos
   */
  canManageProjects() {
    return this.hasPermission('createProject');
  }

  /**
   * Verifica si puede ver todos los proyectos
   * ADMIN y COORDINATOR pueden ver todos los proyectos
   * OPERATOR solo ve proyectos asignados
   * 
   * @returns {boolean} true si puede ver todos los proyectos
   */
  canViewAllProjects() {
    return this.hasPermission('readAllProjects');
  }

  /**
   * Verifica si puede asignar proyectos
   * ADMIN y COORDINATOR pueden asignar proyectos
   * 
   * @returns {boolean} true si puede asignar proyectos
   */
  canAssignProjects() {
    return this.hasPermission('assignProject');
  }

  /**
   * Representación en string del rol
   * 
   * @returns {string} Rol como string
   */
  toString() {
    return this.#value;
  }

  /**
   * Representación JSON del rol
   * 
   * @returns {string} Rol como string
   */
  toJSON() {
    return this.#value;
  }

  /**
   * Valida un rol sin crear una instancia
   * 
   * @static
   * @param {string} role - Rol a validar
   * @returns {boolean} true si el rol es válido
   * 
   * @example
   * Role.isValid('admin') // true
   * Role.isValid('superuser') // false
   */
  static isValid(role) {
    try {
      new Role(role);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Crea un Role de tipo ADMIN
   * 
   * @static
   * @returns {Role} Rol de admin
   */
  static createAdmin() {
    return new Role(ROLES.ADMIN);
  }

  /**
   * Crea un Role de tipo COORDINATOR
   * 
   * @static
   * @returns {Role} Rol de coordinator
   */
  static createCoordinator() {
    return new Role(ROLES.COORDINATOR);
  }

  /**
   * Crea un Role de tipo OPERATOR
   * 
   * @static
   * @returns {Role} Rol de operator
   */
  static createOperator() {
    return new Role(ROLES.OPERATOR);
  }
}

export default Role;
