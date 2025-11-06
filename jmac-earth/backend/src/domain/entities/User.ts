/**
 * User Entity (Dominio)
 * 
 * Responsabilidades:
 * - Representar un usuario del sistema
 * - Validar reglas de negocio relacionadas con usuarios (username, password)
 * - Delegar validaciones de email y role a sus respectivos Value Objects
 * - Proveer métodos para operaciones de dominio
 * 
 * Nota: Esta es una entidad de dominio PURA.
 * No tiene dependencias de frameworks o librerías externas.
 * No conoce sobre bases de datos o HTTP.
 */

import { Email } from '../value-objects/Email';
import { Role } from '../value-objects/Role';
export { RoleType } from '../value-objects/Role';

export interface CreateUserProps {
  username: string;
  email: Email;
  password: string;  // Ya debe venir hasheado desde el caso de uso
  role: Role;
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
  private _email: Email;
  private _password: string;
  private _role: Role;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    this.validateUsername(props.username);
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
   * Getters
   */
  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get email(): Email {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get role(): Role {
    return this._role;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Métodos de negocio - Verificación de roles
   * Delegan al Role Value Object
   */
  isAdmin(): boolean {
    return this._role.isAdmin();
  }

  isCoordinator(): boolean {
    return this._role.isCoordinator();
  }

  isOperator(): boolean {
    return this._role.isOperator();
  }

  /**
   * Métodos de negocio - Verificación de permisos
   * Delegan al Role Value Object
   */
  canManageUsers(): boolean {
    return this._role.canManageUsers();
  }

  canCreateProjects(): boolean {
    return this._role.canManageProjects();
  }

  canEditProjects(): boolean {
    return this._role.canManageProjects();
  }

  canDeleteProjects(): boolean {
    return this._role.canManageProjects();
  }

  canAssignProjects(): boolean {
    return this._role.canAssignProjects();
  }

  canViewAllProjects(): boolean {
    return this._role.canViewAllProjects();
  }

  /**
   * Métodos de actualización
   */
  updateUsername(newUsername: string): void {
    this.validateUsername(newUsername);
    this._username = newUsername;
    this._updatedAt = new Date();
  }

  updateEmail(newEmail: Email): void {
    this._email = newEmail;
    this._updatedAt = new Date();
  }

  updatePassword(newPassword: string): void {
    this.validatePassword(newPassword);
    this._password = newPassword;
    this._updatedAt = new Date();
  }

  updateRole(newRole: Role): void {
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
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      throw new Error('Username solo puede contener letras, números y guiones bajos');
    }
  }

  private validatePassword(password: string): void {
    if (!password || password.trim().length === 0) {
      throw new Error('Password no puede estar vacío');
    }
  }

  /**
   * Convierte la entidad a un objeto plano para serialización
   * Nota: Password NO se incluye por seguridad
   */
  toJSON(): {
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      username: this._username,
      email: this._email.getValue(),
      role: this._role.getValue(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }

  /**
   * Factory method para crear un nuevo usuario
   */
  static create(props: CreateUserProps): User {
    return new User({
      ...props,
      id: '',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}