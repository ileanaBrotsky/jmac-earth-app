/**
 * =============================================================================
 * MIGRATION: CREATE USERS TABLE
 * =============================================================================
 * Esta migración crea la tabla 'users' en PostgreSQL con todos sus campos,
 * índices y constraints.
 * 
 * Ejecutar: npm run migration:run
 * Revertir: npm run migration:revert
 * 
 * @module infrastructure/database/migrations/CreateUsersTable
 * =============================================================================
 */

import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsersTable1700000000001 implements MigrationInterface {
  /**
   * Método UP - Se ejecuta al aplicar la migración
   * Crea la tabla users con todos sus campos
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla users
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true, // ifNotExists
    );

    // Crear índice único para email
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    // Crear índice único para username
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_username',
        columnNames: ['username'],
        isUnique: true,
      }),
    );

    // Crear índice para role (para queries de filtrado por rol)
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_role',
        columnNames: ['role'],
      }),
    );

    console.log('✅ Tabla users creada exitosamente');
  }

  /**
   * Método DOWN - Se ejecuta al revertir la migración
   * Elimina la tabla users y todos sus índices
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices primero
    await queryRunner.dropIndex('users', 'idx_users_role');
    await queryRunner.dropIndex('users', 'idx_users_username');
    await queryRunner.dropIndex('users', 'idx_users_email');

    // Eliminar tabla
    await queryRunner.dropTable('users', true); // ifExists

    console.log('✅ Tabla users eliminada exitosamente');
  }
}