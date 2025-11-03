/**
 * User Entity (Dominio)
 * 
 * Responsabilidades:
 * - Representar un usuario del sistema
 * - Validar reglas de negocio relacionadas con usuarios
 * - Proveer métodos para operaciones de dominio
 * 
 * Nota: Esta es una entidad de dominio PURA.
 * No tiene dependencias de frameworks o librerías externas.
 * No conoce sobre bases de datos o HTTP.
 */

/**
 * Enum de roles disponibles en el sistema
 */
export enum UserRole {
  ADMIN = 'admin',
  COORDINATOR = 'coordinator',
  OPERATOR = 'operator'
}

/**
 * Propiedades para crear un usuario
 */
export interface CreateUserProps {
  username: string;
  email: string;
  password: string;  // Ya debe venir hasheado desde el caso de uso
  role: UserRole;
}

/**
 * Propiedades completas de un usuario (incluyendo ID y timestamps)
 */
export interface UserProps extends CreateUserProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Clase User - Entidad de Dominio
 */
export class User {
  private readonly _id: string;
  private _username: string;
  private _email: string;
  private _password: string;
  private _role: UserRole;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    // Validaciones de negocio en el constructor
    this.validateUsername(props.username);
    this.validateEmail(props.email);
    this.validatePassword(props.password);
    
    this._id = props.id;
    this._username = props.username;
    this._email = props.email;
    this._password = props.password;
    this._role = props.role;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * Getters - Inmutabilidad
   */
  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get role(): UserRole {
    return this._role;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Métodos de negocio
   */

  /**
   * Verifica si el usuario es Admin
   */
  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  /**
   * Verifica si el usuario es Coordinador
   */
  isCoordinator(): boolean {
    return this._role === UserRole.COORDINATOR;
  }

  /**
   * Verifica si el usuario es Operario
   */
  isOperator(): boolean {
    return this._role === UserRole.OPERATOR;
  }

  /**
   * Verifica si el usuario puede gestionar otros usuarios
   * Solo Admin puede gestionar usuarios
   */
  canManageUsers(): boolean {
    return this.isAdmin();
  }

  /**
   * Verifica si el usuario puede crear proyectos
   * Admin y Coordinador pueden crear proyectos
   */
  canCreateProjects(): boolean {
    return this.isAdmin() || this.isCoordinator();
  }

  /**
   * Verifica si el usuario puede editar proyectos
   * Admin y Coordinador pueden editar proyectos
   */
  canEditProjects(): boolean {
    return this.isAdmin() || this.isCoordinator();
  }

  /**
   * Verifica si el usuario puede eliminar proyectos
   * Admin y Coordinador pueden eliminar proyectos
   */
  canDeleteProjects(): boolean {
    return this.isAdmin() || this.isCoordinator();
  }

  /**
   * Verifica si el usuario puede asignar proyectos a operarios
   * Admin y Coordinador pueden asignar proyectos
   */
  canAssignProjects(): boolean {
    return this.isAdmin() || this.isCoordinator();
  }

  /**
   * Verifica si el usuario puede ver todos los proyectos
   * Admin y Coordinador pueden ver todos los proyectos
   * Operarios solo ven proyectos asignados
   */
  canViewAllProjects(): boolean {
    return this.isAdmin() || this.isCoordinator();
  }

  /**
   * Actualiza el username
   */
  updateUsername(newUsername: string): void {
    this.validateUsername(newUsername);
    this._username = newUsername;
    this._updatedAt = new Date();
  }

  /**
   * Actualiza el email
   */
  updateEmail(newEmail: string): void {
    this.validateEmail(newEmail);
    this._email = newEmail;
    this._updatedAt = new Date();
  }

  /**
   * Actualiza la contraseña (ya debe venir hasheada)
   */
  updatePassword(newPassword: string): void {
    this.validatePassword(newPassword);
    this._password = newPassword;
    this._updatedAt = new Date();
  }

  /**
   * Actualiza el rol
   */
  updateRole(newRole: UserRole): void {
    this._role = newRole;
    this._updatedAt = new Date();
  }

  /**
   * Validaciones privadas
   */

  private validateUsername(username: string): void {
    if (!username || username.trim().length === 0) {
      throw new Error('Username no puede estar vacío');
    }
    if (username.length < 3) {
      throw new Error('Username debe tener al menos 3 caracteres');
    }
    if (username.length > 50) {
      throw new Error('Username no puede tener más de 50 caracteres');
    }
    // Validar que solo contenga caracteres alfanuméricos y guiones bajos
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      throw new Error('Username solo puede contener letras, números y guiones bajos');
    }
  }

  private validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new Error('Email no puede estar vacío');
    }
    // Regex básico para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email no es válido');
    }
  }

  private validatePassword(password: string): void {
    if (!password || password.trim().length === 0) {
      throw new Error('Password no puede estar vacío');
    }
    // Nota: La contraseña aquí debería ser el hash, no la contraseña plana
    // Por lo tanto, la validación de longitud mínima se hace ANTES del hash
    // Aquí solo validamos que no esté vacía
  }

  /**
   * Convierte la entidad a un objeto plano
   * Útil para serialización
   */
  toJSON(): object {
    return {
      id: this._id,
      username: this._username,
      email: this._email,
      role: this._role,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
      // Nota: NO incluimos password por seguridad
    };
  }

  /**
   * Factory method para crear un nuevo usuario
   */
  static create(props: CreateUserProps): User {
    return new User({
      ...props,
      id: '', // Se asignará en la base de datos
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
