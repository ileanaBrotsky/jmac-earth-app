/**
 * =============================================================================
 * MIGRATION: CREATE PROJECTS TABLE
 * =============================================================================
 * Esta migración crea la tabla 'projects' en PostgreSQL con todos sus campos,
 * índices y constraints necesarios para la gestión de proyectos hidráulicos.
 * 
 * Ejecutar: npm run migration:run
 * Revertir: npm run migration:revert
 * 
 * @module infrastructure/database/migrations/CreateProjectsTable
 * =============================================================================
 */

import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateProjectsTable1700000000002 implements MigrationInterface {
  /**
   * Método UP - Se ejecuta al aplicar la migración
   * Crea la tabla projects con todos sus campos
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla projects
    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'client',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '30',
            isNullable: false,
            default: "'draft'",
          },
          {
            name: 'elevationSource',
            type: 'varchar',
            length: '30',
            isNullable: false,
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'hydraulicParameters',
            type: 'jsonb',
            isNullable: true,
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

    // Crear índice para búsquedas por nombre
    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'idx_projects_name',
        columnNames: ['name'],
      }),
    );

    // Crear índice para búsquedas por status
    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'idx_projects_status',
        columnNames: ['status'],
      }),
    );

    // Crear índice para búsquedas por createdBy (usuario propietario)
    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'idx_projects_created_by',
        columnNames: ['createdBy'],
      }),
    );

    // Crear índice para búsquedas por fecha de creación
    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'idx_projects_created_at',
        columnNames: ['created_at'],
      }),
    );

    console.log('✅ Tabla projects creada exitosamente');
  }

  /**
   * Método DOWN - Se ejecuta al revertir la migración
   * Elimina la tabla projects y todos sus índices
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices primero
    await queryRunner.dropIndex('projects', 'idx_projects_created_at');
    await queryRunner.dropIndex('projects', 'idx_projects_created_by');
    await queryRunner.dropIndex('projects', 'idx_projects_status');
    await queryRunner.dropIndex('projects', 'idx_projects_name');

    // Eliminar tabla
    await queryRunner.dropTable('projects', true); // ifExists

    console.log('✅ Tabla projects eliminada exitosamente');
  }
}
