/**
 * =============================================================================
 * MIGRATION: CREATE TRACES TABLE
 * =============================================================================
 * Esta migración crea la tabla 'traces' en PostgreSQL con todos sus campos
 * e índices necesarios. Una traza pertenece a un único proyecto (relación 1:1).
 * 
 * Ejecutar: npm run migration:run
 * Revertir: npm run migration:revert
 * 
 * @module infrastructure/database/migrations/CreateTracesTable
 * =============================================================================
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateTracesTable1700000000003 implements MigrationInterface {
  /**
   * Método UP - Se ejecuta al aplicar la migración
   * Crea la tabla traces con todos sus campos
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla traces
    await queryRunner.createTable(
      new Table({
        name: 'traces',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'totalDistance_m',
            type: 'double precision',
            isNullable: false,
            default: 0,
          },
          {
            name: 'pointCount',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'elevationProfile',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'project_id',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
          },
        ],
      }),
      true, // ifNotExists
    );

    // Agregar foreign key hacia projects
    await queryRunner.createForeignKey(
      'traces',
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'CASCADE',
      }),
    );

    // Crear índice para búsquedas por project_id
    await queryRunner.createIndex(
      'traces',
      new TableIndex({
        name: 'idx_traces_project_id',
        columnNames: ['project_id'],
        isUnique: true,
      }),
    );

    console.log('✅ Tabla traces creada exitosamente');
  }

  /**
   * Método DOWN - Se ejecuta al revertir la migración
   * Elimina la tabla traces y todas sus relaciones
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Obtener la tabla antes de eliminarla para acceder a las foreign keys
    const table = await queryRunner.getTable('traces');
    
    if (table) {
      // Eliminar foreign keys
      const foreignKey = table.foreignKeys.find(
        fk => fk.columnNames.includes('project_id')
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('traces', foreignKey);
      }
    }

    // Eliminar índices
    await queryRunner.dropIndex('traces', 'idx_traces_project_id');

    // Eliminar tabla
    await queryRunner.dropTable('traces', true); // ifExists

    console.log('✅ Tabla traces eliminada exitosamente');
  }
}
