/**
 * =============================================================================
 * ROLE VALUE OBJECT
 * =============================================================================
 * Representa un rol válido en el sistema.
 * 
 * Este archivo es parte de la CAPA DE DOMINIO (Domain Layer).
 * Los Value Objects son INMUTABLES y contienen lógica de validación.
 * 
 * Características de un Value Object:
 * - Inmutable (no se puede modificar después de creado)
 * - Se compara por valor, no por referencia
 * - Encapsula lógica de validación y reglas de negocio
 * - No tiene identidad propia
 * 
 * @module domain/value-objects/Role
 * =============================================================================
 */

/**
 * Enum de roles disponibles en el sistema
 * 
 * @enum {string}
 */
export enum RoleType {
  /**
   * ADMIN: Acceso total al sistema
   * - CRUD de usuarios
   * - CRUD de proyectos
   * - Asignación de proyectos
   * - Ver todos los proyectos
   */
  ADMIN = 'admin',

  /**
   * COORDINATOR: Gestión de proyectos
   * - Crear, editar, eliminar proyectos
   * - Asignar proyectos a operarios
   * - Ver todos los proyectos
   * - NO puede gestionar usuarios
   */
  COORDINATOR = 'coordinator',

  /**
   * OPERATOR: Solo lectura de proyectos asignados
   * - Ver proyectos asignados
   * - Descargar KMZ de proyectos asignados
   * - NO puede crear/editar proyectos
   * - NO puede ver proyectos no asignados
   */
  OPERATOR = 'operator'
}

/**
 * Tipo de permiso en el sistema
 * 
 * @typedef {string} Permission
 */
type Permission = 
  // Permisos de usuarios
  | 'createUser'
  | 'readUser'
  | 'updateUser'
  | 'deleteUser'
  // Permisos de proyectos
  | 'createProject'
  | 'readProject'
  | 'readAllProjects'
  | 'updateProject'
  | 'deleteProject'
  | 'assignProject'
  // Permisos de exportación
  | 'exportKMZ'
  | 'exportPDF';

/**
 * Matriz de permisos por rol
 * Define qué acciones puede realizar cada rol
 * 
 * @type {Record<RoleType, Record<Permission, boolean>>}
 */
const ROLE_PERMISSIONS: Record<RoleType, Record<Permission, boolean>> = {
  [RoleType.ADMIN]: {
    // Gestión de usuarios
    createUser: true,
    readUser: true,
    updateUser: true,
    deleteUser: true,
    
    // Gestión de proyectos
    createProject: true,
    readProject: true,
    readAllProjects: true,
    updateProject: true,
    deleteProject: true,
    assignProject: true,
    
    // Exportación
    exportKMZ: true,
    exportPDF: true
  },
  
  [RoleType.COORDINATOR]: {
    // Gestión de usuarios
    createUser: false,
    readUser: false,
    updateUser: false,
    deleteUser: false,
    
    // Gestión de proyectos
    createProject: true,
    readProject: true,
    readAllProjects: true,
    updateProject: true,
    deleteProject: true,
    assignProject: true,
    
    // Exportación
    exportKMZ: true,
    exportPDF: true
  },
  
  [RoleType.OPERATOR]: {
    // Gestión de usuarios
    createUser: false,
    readUser: false,
    updateUser: false,
    deleteUser: false,
    
    // Gestión de proyectos
    createProject: false,
    readProject: true,          // Solo proyectos asignados
    readAllProjects: false,     // NO puede ver todos
    updateProject: false,
    deleteProject: false,
    assignProject: false,
    
    // Exportación
    exportKMZ: true,           // Solo de proyectos asignados
    exportPDF: false
  }
};

/**
 * Value Object que representa un rol del sistema
 * 
 * @class Role
 * @example
 * ```typescript
 * const role = new Role(RoleType.ADMIN);
 * console.log(role.getValue()); // 'admin'
 * console.log(role.isAdmin()); // true
 * console.log(role.canManageUsers()); // true
 * ```
 */
export class Role {
  /**
   * Valor del rol (privado, inmutable)
   * @private
   * @readonly
   */
  private readonly value: RoleType;

  /**
   * Crea una instancia de Role
   * 
   * @param {string | RoleType} role - Rol a validar y almacenar
   * @throws {Error} Si el rol es inválido
   * 
   * @example
   * ```typescript
   * const role1 = new Role(RoleType.ADMIN);
   * const role2 = new Role('admin');
   * const role3 = new Role('ADMIN'); // Se normaliza a minúsculas
   * ```
   */
  constructor(role: string | RoleType) {
    this.validate(role);
    // Normalizar a minúsculas y convertir a RoleType
    this.value = role.toLowerCase() as RoleType;
  }

  /**
   * Valida el rol
   * 
   * @private
   * @param {string | RoleType} role - Rol a validar
   * @throws {Error} Si el rol es inválido
   */
  private validate(role: string | RoleType): void {
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
    const validRoles = Object.values(RoleType);
    if (!validRoles.includes(normalizedRole as RoleType)) {
      throw new Error(
        `Rol inválido: ${role}. Roles válidos: ${validRoles.join(', ')}`
      );
    }
  }

  /**
   * Obtiene el valor del rol
   * 
   * @returns {RoleType} Rol normalizado
   * 
   * @example
   * ```typescript
   * const role = new Role('ADMIN');
   * console.log(role.getValue()); // 'admin' (normalizado)
   * ```
   */
  getValue(): RoleType {
    return this.value;
  }

  /**
   * Compara este rol con otro
   * 
   * @param {Role} other - Otro rol para comparar
   * @returns {boolean} true si son iguales
   * 
   * @example
   * ```typescript
   * const role1 = new Role(RoleType.ADMIN);
   * const role2 = new Role('ADMIN');
   * console.log(role1.equals(role2)); // true
   * ```
   */
  equals(other: Role): boolean {
    if (!(other instanceof Role)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Verifica si el rol es ADMIN
   * 
   * @returns {boolean} true si es admin
   * 
   * @example
   * ```typescript
   * const role = new Role(RoleType.ADMIN);
   * console.log(role.isAdmin()); // true
   * ```
   */
  isAdmin(): boolean {
    return this.value === RoleType.ADMIN;
  }

  /**
   * Verifica si el rol es COORDINATOR
   * 
   * @returns {boolean} true si es coordinator
   */
  isCoordinator(): boolean {
    return this.value === RoleType.COORDINATOR;
  }

  /**
   * Verifica si el rol es OPERATOR
   * 
   * @returns {boolean} true si es operator
   */
  isOperator(): boolean {
    return this.value === RoleType.OPERATOR;
  }

  /**
   * Verifica si el rol tiene un permiso específico
   * 
   * @param {Permission} permission - Permiso a verificar
   * @returns {boolean} true si tiene el permiso
   * 
   * @example
   * ```typescript
   * const adminRole = new Role(RoleType.ADMIN);
   * console.log(adminRole.hasPermission('createUser')); // true
   * 
   * const operatorRole = new Role(RoleType.OPERATOR);
   * console.log(operatorRole.hasPermission('deleteProject')); // false
   * ```
   */
  hasPermission(permission: Permission): boolean {
    return ROLE_PERMISSIONS[this.value]?.[permission] ?? false;
  }

  /**
   * Verifica si puede gestionar usuarios
   * Solo ADMIN puede gestionar usuarios
   * 
   * @returns {boolean} true si puede gestionar usuarios
   * 
   * @example
   * ```typescript
   * const admin = new Role(RoleType.ADMIN);
   * console.log(admin.canManageUsers()); // true
   * 
   * const coordinator = new Role(RoleType.COORDINATOR);
   * console.log(coordinator.canManageUsers()); // false
   * ```
   */
  canManageUsers(): boolean {
    return this.hasPermission('createUser');
  }

  /**
   * Verifica si puede gestionar proyectos
   * ADMIN y COORDINATOR pueden gestionar proyectos
   * 
   * @returns {boolean} true si puede gestionar proyectos
   */
  canManageProjects(): boolean {
    return this.hasPermission('createProject');
  }

  /**
   * Verifica si puede ver todos los proyectos
   * ADMIN y COORDINATOR pueden ver todos los proyectos
   * OPERATOR solo ve proyectos asignados
   * 
   * @returns {boolean} true si puede ver todos los proyectos
   */
  canViewAllProjects(): boolean {
    return this.hasPermission('readAllProjects');
  }

  /**
   * Verifica si puede asignar proyectos
   * ADMIN y COORDINATOR pueden asignar proyectos
   * 
   * @returns {boolean} true si puede asignar proyectos
   */
  canAssignProjects(): boolean {
    return this.hasPermission('assignProject');
  }

  /**
   * Representación en string del rol
   * 
   * @returns {string} Rol como string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Representación JSON del rol
   * 
   * @returns {string} Rol como string
   */
  toJSON(): string {
    return this.value;
  }

  /**
   * Valida un rol sin crear una instancia
   * 
   * @static
   * @param {string} role - Rol a validar
   * @returns {boolean} true si el rol es válido
   * 
   * @example
   * ```typescript
   * Role.isValid('admin') // true
   * Role.isValid('superuser') // false
   * ```
   */
  static isValid(role: string): boolean {
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
   * 
   * @example
   * ```typescript
   * const adminRole = Role.createAdmin();
   * console.log(adminRole.getValue()); // 'admin'
   * ```
   */
  static createAdmin(): Role {
    return new Role(RoleType.ADMIN);
  }

  /**
   * Crea un Role de tipo COORDINATOR
   * 
   * @static
   * @returns {Role} Rol de coordinator
   */
  static createCoordinator(): Role {
    return new Role(RoleType.COORDINATOR);
  }

  /**
   * Crea un Role de tipo OPERATOR
   * 
   * @static
   * @returns {Role} Rol de operator
   */
  static createOperator(): Role {
    return new Role(RoleType.OPERATOR);
  }

  /**
   * Obtiene todos los roles válidos
   * 
   * @static
   * @returns {RoleType[]} Array con todos los roles válidos
   */
  static getAllRoles(): RoleType[] {
    return Object.values(RoleType);
  }
}