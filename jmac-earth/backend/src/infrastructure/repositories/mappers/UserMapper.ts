/**
 * =============================================================================
 * USER MAPPER
 * =============================================================================
 * Clase que convierte entre la entidad de Dominio (User) y la entidad de
 * Infraestructura (UserEntity de TypeORM).
 * 
 * Este mapper es crucial en Clean Architecture porque:
 * - Mantiene el Dominio independiente de la infraestructura
 * - El Dominio NO conoce TypeORM
 * - TypeORM Entity NO conoce el Dominio
 * 
 * Responsabilidades:
 * - toDomain(): TypeORM Entity → Domain Entity
 * - toPersistence(): Domain Entity → TypeORM Entity
 * 
 * @module infrastructure/repositories/mappers/UserMapper
 * =============================================================================
 */

import { User, UserProps } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { Role } from '../../../domain/value-objects/Role';
import { UserEntity } from '../../database/entities/User.entity';

/**
 * UserMapper - Convierte entre capas de Domain e Infrastructure
 */
export class UserMapper {
  /**
   * Convierte de TypeORM Entity a Domain Entity
   * 
   * Esta conversión se usa cuando recuperamos datos de la base de datos
   * y necesitamos trabajar con ellos en la lógica de negocio.
   * 
   * @param {UserEntity} entity - Entidad de TypeORM (desde PostgreSQL)
   * @returns {User} Entidad de Dominio (para lógica de negocio)
   * 
   * @example
   * ```typescript
   * const userEntity = await repository.findOne({ where: { id } });
   * const domainUser = UserMapper.toDomain(userEntity);
   * 
   * // Ahora podemos usar métodos del dominio:
   * if (domainUser.canManageUsers()) { ... }
   * ```
   */
  static toDomain(entity: UserEntity): User {
    // Reconstruir Value Objects
    const email = new Email(entity.email);
    const role = new Role(entity.role);

    // Reconstruir User Entity del dominio
    const userProps: UserProps = {
      id: entity.id,
      username: entity.username,
      email: email,
      password: entity.password,
      role: role,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };

    return new User(userProps);
  }

  /**
   * Convierte de Domain Entity a TypeORM Entity
   * 
   * Esta conversión se usa cuando queremos guardar datos del dominio
   * en la base de datos.
   * 
   * @param {User} user - Entidad de Dominio (desde lógica de negocio)
   * @returns {UserEntity} Entidad de TypeORM (para guardar en PostgreSQL)
   * 
   * @example
   * ```typescript
   * const domainUser = User.create({
   *   username: 'johndoe',
   *   email: new Email('john@example.com'),
   *   password: '$2b$10$hashedpassword',
   *   role: Role.createOperator()
   * });
   * 
   * const entity = UserMapper.toPersistence(domainUser);
   * await repository.save(entity);
   * ```
   */
  static toPersistence(user: User): UserEntity {
    const entity = new UserEntity();

    // Mapear campos simples
   if (user.id && user.id !== '') {
    entity.id = user.id;
  }
    entity.username = user.username;
    entity.password = user.password;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;

    // Extraer valores primitivos de Value Objects
    entity.email = user.email.getValue();
    entity.role = user.role.getValue();

    return entity;
  }

  /**
   * Convierte un array de TypeORM Entities a Domain Entities
   * 
   * Útil para operaciones que retornan múltiples usuarios (findAll, etc.)
   * 
   * @param {UserEntity[]} entities - Array de entidades de TypeORM
   * @returns {User[]} Array de entidades de Dominio
   * 
   * @example
   * ```typescript
   * const entities = await repository.find();
   * const domainUsers = UserMapper.toDomainArray(entities);
   * ```
   */
  static toDomainArray(entities: UserEntity[]): User[] {
    return entities.map(entity => this.toDomain(entity));
  }
}