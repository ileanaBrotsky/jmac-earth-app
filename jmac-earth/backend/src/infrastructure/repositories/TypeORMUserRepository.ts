/**
 * =============================================================================
 * TYPEORM USER REPOSITORY
 * =============================================================================
 * Implementación concreta del repositorio de usuarios usando TypeORM.
 * 
 * Este archivo es parte de la CAPA DE INFRAESTRUCTURA (Infrastructure Layer).
 * Implementa la interface IUserRepository definida en el Dominio.
 * 
 * Responsabilidades:
 * - Guardar/recuperar Users de PostgreSQL usando TypeORM
 * - Convertir entre Domain Entities y TypeORM Entities usando el Mapper
 * - Manejar errores de base de datos (duplicados, not found, etc.)
 * 
 * @module infrastructure/repositories/TypeORMUserRepository
 * =============================================================================
 */

import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { UserEntity } from '../database/entities/User.entity';
import { UserMapper } from './mappers/UserMapper';
import AppDataSource from '../database/data-source';

/**
 * Implementación de IUserRepository usando TypeORM y PostgreSQL
 */
export class TypeORMUserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  /**
   * Constructor
   * 
   * Inicializa el repositorio de TypeORM para UserEntity.
   * Si no se proporciona un DataSource, usa el por defecto.
   */
  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  /**
   * Guardar un nuevo usuario en la base de datos
   * 
   * @param {User} user - Usuario del dominio a guardar
   * @returns {Promise<User>} Usuario guardado con ID generado
   * @throws {Error} Si el email o username ya existen (constraint violation)
   */
  async save(user: User): Promise<User> {
    try {
      // Convertir de Domain Entity a TypeORM Entity
      const entity = UserMapper.toPersistence(user);

      // Guardar en PostgreSQL
      const savedEntity = await this.repository.save(entity);

      // Convertir de vuelta a Domain Entity
      return UserMapper.toDomain(savedEntity);
    } catch (error: any) {
      // Manejar errores de PostgreSQL (duplicados, constraints, etc.)
      if (error.code === '23505') { // Unique violation
        if (error.detail?.includes('email')) {
          throw new Error('Email ya está en uso');
        }
        if (error.detail?.includes('username')) {
          throw new Error('Username ya está en uso');
        }
      }
      throw error;
    }
  }

  /**
   * Buscar un usuario por su ID
   * 
   * @param {string} id - UUID del usuario
   * @returns {Promise<User | null>} Usuario encontrado o null
   */
  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { id }
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  /**
   * Buscar un usuario por su email
   * 
   * @param {Email} email - Email del usuario (Value Object)
   * @returns {Promise<User | null>} Usuario encontrado o null
   */
  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { email: email.getValue() }
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  /**
   * Buscar un usuario por su username
   * 
   * @param {string} username - Username del usuario
   * @returns {Promise<User | null>} Usuario encontrado o null
   */
  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { username }
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  /**
   * Obtener todos los usuarios
   * 
   * @returns {Promise<User[]>} Array de todos los usuarios
   */
  async findAll(): Promise<User[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' } // Más recientes primero
    });

    return UserMapper.toDomainArray(entities);
  }

  /**
   * Actualizar un usuario existente
   * 
   * @param {User} user - Usuario del dominio con cambios
   * @returns {Promise<User>} Usuario actualizado
   * @throws {Error} Si el usuario no existe
   * @throws {Error} Si el nuevo email/username ya están tomados
   */
  async update(user: User): Promise<User> {
    try {
      // Verificar que el usuario existe
      const exists = await this.repository.findOne({
        where: { id: user.id }
      });

      if (!exists) {
        throw new Error(`Usuario con ID ${user.id} no encontrado`);
      }

      // Convertir a TypeORM Entity
      const entity = UserMapper.toPersistence(user);

      // Actualizar en PostgreSQL
      await this.repository.save(entity);

      // Recuperar el usuario actualizado
      const updatedEntity = await this.repository.findOne({
        where: { id: user.id }
      });

      if (!updatedEntity) {
        throw new Error('Error al recuperar usuario actualizado');
      }

      return UserMapper.toDomain(updatedEntity);
    } catch (error: any) {
      // Manejar errores de PostgreSQL (duplicados, constraints, etc.)
      if (error.code === '23505') { // Unique violation
        if (error.detail?.includes('email')) {
          throw new Error('Email ya está en uso');
        }
        if (error.detail?.includes('username')) {
          throw new Error('Username ya está en uso');
        }
      }
      throw error;
    }
  }

  /**
   * Eliminar un usuario por su ID
   * 
   * @param {string} id - UUID del usuario a eliminar
   * @returns {Promise<void>}
   * @throws {Error} Si el usuario no existe
   */
  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);

    if (result.affected === 0) {
      throw new Error(`Usuario con ID ${id} no encontrado`);
    }
  }

  /**
   * Verificar si existe un usuario con el email dado
   * 
   * @param {Email} email - Email a verificar
   * @returns {Promise<boolean>} true si existe, false si no
   */
  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email.getValue() }
    });

    return count > 0;
  }

  /**
   * Verificar si existe un usuario con el username dado
   * 
   * @param {string} username - Username a verificar
   * @returns {Promise<boolean>} true si existe, false si no
   */
  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { username }
    });

    return count > 0;
  }
}