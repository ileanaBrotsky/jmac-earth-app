/**
 * =============================================================================
 * USER ENTITY (TypeORM - Infrastructure Layer)
 * =============================================================================
 * Esta es la entidad de INFRAESTRUCTURA que mapea la tabla 'users' en PostgreSQL.
 * 
 * ⚠️ NO CONFUNDIR con la entidad de DOMINIO (User.ts)
 * 
 * Diferencias:
 * - Domain Entity (User.ts):     Lógica de negocio pura, sin dependencias
 * - TypeORM Entity (esta):       Mapeo de tabla, decoradores de TypeORM
 * 
 * El Repository convierte entre ambas.
 * 
 * @module infrastructure/database/entities/User.entity
 * =============================================================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

/**
 * UserEntity - Mapeo de la tabla 'users' en PostgreSQL
 * 
 * Esta clase usa decoradores de TypeORM para definir:
 * - Nombre de tabla
 * - Columnas y sus tipos
 * - Índices
 * - Timestamps automáticos
 */
@Entity('users')
@Index('idx_users_email', ['email'], { unique: true })
@Index('idx_users_username', ['username'], { unique: true })
export class UserEntity {
  /**
   * ID único del usuario (UUID)
   * Generado automáticamente por PostgreSQL
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Nombre de usuario (único)
   * - Mínimo 3 caracteres
   * - Máximo 50 caracteres
   * - Solo letras, números y guiones bajos
   */
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false
  })
  username!: string;

  /**
   * Email del usuario (único)
   * - Formato válido de email
   * - Normalizado a minúsculas
   */
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false
  })
  email!: string;

  /**
   * Contraseña hasheada con bcrypt
   * ⚠️ NUNCA almacenar contraseñas en texto plano
   */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  password!: string;

  /**
   * Rol del usuario
   * Valores válidos: 'admin' | 'coordinator' | 'operator'
   */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: false
  })
  role!: string;

  /**
   * Fecha de creación del registro
   * Se establece automáticamente al insertar
   */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt!: Date;

  /**
   * Fecha de última actualización del registro
   * Se actualiza automáticamente al modificar
   */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt!: Date;
}