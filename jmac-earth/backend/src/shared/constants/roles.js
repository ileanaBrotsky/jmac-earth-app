/**
 * =============================================================================
 * ROLES CONSTANTS
 * =============================================================================
 * Define los roles disponibles en el sistema y sus permisos.
 * 
 * Este archivo es parte de la CAPA COMPARTIDA (Shared Layer).
 * No debe depender de ninguna otra capa.
 * 
 * @module shared/constants/roles
 * =============================================================================
 */

/**
 * Enum de roles disponibles en el sistema
 * @readonly
 * @enum {string}
 */
export const ROLES = Object.freeze({
  /**
   * ADMIN: Acceso total al sistema
   * - CRUD de usuarios
   * - CRUD de proyectos
   * - Asignación de proyectos a operarios
   * - Ver todos los proyectos
   */
  ADMIN: 'admin',

  /**
   * COORDINATOR: Gestión de proyectos
   * - Crear, editar, eliminar proyectos
   * - Asignar proyectos a operarios
   * - Ver todos los proyectos
   * - NO puede gestionar usuarios
   */
  COORDINATOR: 'coordinator',

  /**
   * OPERATOR: Solo lectura
   * - Ver proyectos asignados a él
   * - Descargar KMZ de proyectos asignados
   * - NO puede crear/editar proyectos
   * - NO puede ver proyectos no asignados
   */
  OPERATOR: 'operator'
});

/**
 * Array de todos los roles válidos
 * Útil para validaciones
 * @type {string[]}
 */
export const VALID_ROLES = Object.values(ROLES);

/**
 * Matriz de permisos por rol
 * Define qué acciones puede realizar cada rol
 * 
 * @type {Object.<string, Object.<string, boolean>>}
 */
export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: {
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
  
  [ROLES.COORDINATOR]: {
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
  
  [ROLES.OPERATOR]: {
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
});

/**
 * Verifica si un rol tiene un permiso específico
 * 
 * @param {string} role - Rol a verificar
 * @param {string} permission - Permiso a verificar
 * @returns {boolean} true si el rol tiene el permiso
 * 
 * @example
 * hasPermission(ROLES.ADMIN, 'createUser') // true
 * hasPermission(ROLES.OPERATOR, 'deleteProject') // false
 */
export const hasPermission = (role, permission) => {
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Rol inválido: ${role}`);
  }
  
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
};

/**
 * Obtiene todos los permisos de un rol
 * 
 * @param {string} role - Rol del cual obtener permisos
 * @returns {Object.<string, boolean>} Objeto con todos los permisos
 * 
 * @example
 * getPermissions(ROLES.ADMIN)
 * // { createUser: true, readUser: true, ... }
 */
export const getPermissions = (role) => {
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Rol inválido: ${role}`);
  }
  
  return { ...ROLE_PERMISSIONS[role] };
};

/**
 * Verifica si un rol es válido
 * 
 * @param {string} role - Rol a validar
 * @returns {boolean} true si el rol es válido
 * 
 * @example
 * isValidRole('admin') // true
 * isValidRole('superuser') // false
 */
export const isValidRole = (role) => {
  return VALID_ROLES.includes(role);
};
