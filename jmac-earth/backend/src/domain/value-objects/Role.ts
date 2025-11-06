/**
 * Role Value Object
 * 
 * Value Object inmutable que representa un rol del sistema.
 * Encapsula la lógica de permisos y validaciones de rol.
 * 
 * @module domain/value-objects/Role
 */

/**
 * Enum de roles disponibles en el sistema
 */
export enum RoleType {
  ADMIN = 'admin',
  COORDINATOR = 'coordinator',
  OPERATOR = 'operator'
}

/**
 * Tipo de permiso en el sistema
 */
type Permission = 
  | 'createUser'
  | 'readUser'
  | 'updateUser'
  | 'deleteUser'
  | 'createProject'
  | 'readProject'
  | 'readAllProjects'
  | 'updateProject'
  | 'deleteProject'
  | 'assignProject'
  | 'exportKMZ'
  | 'exportPDF';

/**
 * Matriz de permisos por rol
 * Define qué acciones puede realizar cada rol
 */
const ROLE_PERMISSIONS: Record<RoleType, Record<Permission, boolean>> = {
  [RoleType.ADMIN]: {
    createUser: true,
    readUser: true,
    updateUser: true,
    deleteUser: true,
    createProject: true,
    readProject: true,
    readAllProjects: true,
    updateProject: true,
    deleteProject: true,
    assignProject: true,
    exportKMZ: true,
    exportPDF: true
  },
  
  [RoleType.COORDINATOR]: {
    createUser: false,
    readUser: false,
    updateUser: false,
    deleteUser: false,
    createProject: true,
    readProject: true,
    readAllProjects: true,
    updateProject: true,
    deleteProject: true,
    assignProject: true,
    exportKMZ: true,
    exportPDF: true
  },
  
  [RoleType.OPERATOR]: {
    createUser: false,
    readUser: false,
    updateUser: false,
    deleteUser: false,
    createProject: false,
    readProject: true,
    readAllProjects: false,
    updateProject: false,
    deleteProject: false,
    assignProject: false,
    exportKMZ: true,
    exportPDF: false
  }
};

/**
 * Value Object que representa un rol del sistema
 */
export class Role {
  private readonly value: RoleType;

  /**
   * Crea una instancia de Role
   * 
   * @param {string | RoleType} role - Rol a validar y almacenar
   * @throws {Error} Si el rol es inválido
   */
  constructor(role: string | RoleType) {
    this.validate(role);
    this.value = role.toLowerCase() as RoleType;
  }

  /**
   * Valida el rol
   */
  private validate(role: string | RoleType): void {
    if (!role) {
      throw new Error('Rol no puede estar vacío');
    }

    if (typeof role !== 'string') {
      throw new Error('Rol debe ser un string');
    }

    const normalizedRole = role.toLowerCase();
    const validRoles = Object.values(RoleType);
    
    if (!validRoles.includes(normalizedRole as RoleType)) {
      throw new Error(
        `Rol inválido: ${role}. Roles válidos: ${validRoles.join(', ')}`
      );
    }
  }

  /**
   * Obtiene el valor del rol normalizado
   */
  getValue(): RoleType {
    return this.value;
  }

  /**
   * Compara este rol con otro
   */
  equals(other: Role): boolean {
    if (!(other instanceof Role)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Verifica si el rol es ADMIN
   */
  isAdmin(): boolean {
    return this.value === RoleType.ADMIN;
  }

  /**
   * Verifica si el rol es COORDINATOR
   */
  isCoordinator(): boolean {
    return this.value === RoleType.COORDINATOR;
  }

  /**
   * Verifica si el rol es OPERATOR
   */
  isOperator(): boolean {
    return this.value === RoleType.OPERATOR;
  }

  /**
   * Verifica si el rol tiene un permiso específico
   */
  hasPermission(permission: Permission): boolean {
    return ROLE_PERMISSIONS[this.value]?.[permission] ?? false;
  }

  /**
   * Verifica si puede gestionar usuarios
   * Solo ADMIN puede gestionar usuarios
   */
  canManageUsers(): boolean {
    return this.hasPermission('createUser');
  }

  /**
   * Verifica si puede gestionar proyectos
   * ADMIN y COORDINATOR pueden gestionar proyectos
   */
  canManageProjects(): boolean {
    return this.hasPermission('createProject');
  }

  /**
   * Verifica si puede ver todos los proyectos
   * ADMIN y COORDINATOR pueden ver todos los proyectos
   * OPERATOR solo ve proyectos asignados
   */
  canViewAllProjects(): boolean {
    return this.hasPermission('readAllProjects');
  }

  /**
   * Verifica si puede asignar proyectos
   * ADMIN y COORDINATOR pueden asignar proyectos
   */
  canAssignProjects(): boolean {
    return this.hasPermission('assignProject');
  }

  /**
   * Representación en string del rol
   */
  toString(): string {
    return this.value;
  }

  /**
   * Representación JSON del rol
   */
  toJSON(): string {
    return this.value;
  }

  /**
   * Valida un rol sin crear una instancia
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
   * Factory methods para crear roles específicos
   */
  static createAdmin(): Role {
    return new Role(RoleType.ADMIN);
  }

  static createCoordinator(): Role {
    return new Role(RoleType.COORDINATOR);
  }

  static createOperator(): Role {
    return new Role(RoleType.OPERATOR);
  }

  /**
   * Obtiene todos los roles válidos
   */
  static getAllRoles(): RoleType[] {
    return Object.values(RoleType);
  }
}