/**
 * =============================================================================
 * USER REPOSITORY INTERFACE
 * =============================================================================
 * Contrato que define las operaciones de persistencia para la entidad User.
 * 
 * Este archivo es parte de la CAPA DE DOMINIO (Domain Layer).
 * Define QUÉ operaciones están disponibles, pero NO cómo se implementan.
 * 
 * Beneficios:
 * - Dependency Inversion: Las capas superiores no conocen la DB
 * - Testeable: Podemos mockear el repositorio fácilmente
 * - Intercambiable: Podemos cambiar de PostgreSQL a MongoDB sin tocar el dominio
 * 
 * @module domain/repositories/IUserRepository
 * =============================================================================
 */

import { User } from '../entities/User';
import { Email } from '../value-objects/Email';

/**
 * Interface del repositorio de usuarios
 * 
 * Define todas las operaciones de persistencia disponibles para Users.
 * Las implementaciones concretas (TypeORMUserRepository, MongoUserRepository, etc.)
 * deben implementar esta interface.
 */
export interface IUserRepository {
  /**
   * Guardar un nuevo usuario en la base de datos
   * 
   * @param {User} user - Usuario del dominio a guardar
   * @returns {Promise<User>} Usuario guardado con ID generado
   * @throws {Error} Si el email o username ya existen
   * 
   * @example
   * ```typescript
   * const user = User.create({
   *   username: 'johndoe',
   *   email: new Email('john@example.com'),
   *   password: '$2b$10$hashedpassword',
   *   role: Role.createOperator()
   * });
   * 
   * const savedUser = await repository.save(user);
   * console.log(savedUser.id); // UUID generado
   * ```
   */
  save(user: User): Promise<User>;

  /**
   * Buscar un usuario por su ID
   * 
   * @param {string} id - UUID del usuario
   * @returns {Promise<User | null>} Usuario encontrado o null
   * 
   * @example
   * ```typescript
   * const user = await repository.findById('123e4567-e89b-12d3-a456-426614174000');
   * if (user) {
   *   console.log(user.username);
   * }
   * ```
   */
  findById(id: string): Promise<User | null>;

  /**
   * Buscar un usuario por su email
   * 
   * @param {Email} email - Email del usuario (Value Object)
   * @returns {Promise<User | null>} Usuario encontrado o null
   * 
   * @example
   * ```typescript
   * const email = new Email('john@example.com');
   * const user = await repository.findByEmail(email);
   * ```
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Buscar un usuario por su username
   * 
   * @param {string} username - Username del usuario
   * @returns {Promise<User | null>} Usuario encontrado o null
   * 
   * @example
   * ```typescript
   * const user = await repository.findByUsername('johndoe');
   * ```
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Obtener todos los usuarios
   * 
   * @returns {Promise<User[]>} Array de todos los usuarios
   * 
   * @example
   * ```typescript
   * const users = await repository.findAll();
   * console.log(`Total users: ${users.length}`);
   * ```
   */
  findAll(): Promise<User[]>;

  /**
   * Actualizar un usuario existente
   * 
   * @param {User} user - Usuario del dominio con cambios
   * @returns {Promise<User>} Usuario actualizado
   * @throws {Error} Si el usuario no existe
   * @throws {Error} Si el nuevo email/username ya están tomados
   * 
   * @example
   * ```typescript
   * const user = await repository.findById('123e4567-e89b-12d3-a456-426614174000');
   * user.updateUsername('newtusername');
   * await repository.update(user);
   * ```
   */
  update(user: User): Promise<User>;

  /**
   * Eliminar un usuario por su ID
   * 
   * @param {string} id - UUID del usuario a eliminar
   * @returns {Promise<void>}
   * @throws {Error} Si el usuario no existe
   * 
   * @example
   * ```typescript
   * await repository.delete('123e4567-e89b-12d3-a456-426614174000');
   * ```
   */
  delete(id: string): Promise<void>;

  /**
   * Verificar si existe un usuario con el email dado
   * 
   * @param {Email} email - Email a verificar
   * @returns {Promise<boolean>} true si existe, false si no
   * 
   * @example
   * ```typescript
   * const email = new Email('john@example.com');
   * const exists = await repository.existsByEmail(email);
   * if (exists) {
   *   throw new Error('Email ya está en uso');
   * }
   * ```
   */
  existsByEmail(email: Email): Promise<boolean>;

  /**
   * Verificar si existe un usuario con el username dado
   * 
   * @param {string} username - Username a verificar
   * @returns {Promise<boolean>} true si existe, false si no
   * 
   * @example
   * ```typescript
   * const exists = await repository.existsByUsername('johndoe');
   * if (exists) {
   *   throw new Error('Username ya está en uso');
   * }
   * ```
   */
  existsByUsername(username: string): Promise<boolean>;
}