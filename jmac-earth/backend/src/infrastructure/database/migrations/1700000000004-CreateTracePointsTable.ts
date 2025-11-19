/**
 * =============================================================================
 * MIGRATION: CREATE TRACE POINTS TABLE
 * =============================================================================
 * Esta migración crea la tabla 'trace_points' en PostgreSQL. Cada punto
 * representa un nodo en la traza hidráulica con coordenadas y elevación.
 * 
 * Ejecutar: npm run migration:run
 * Revertir: npm run migration:revert
 * 
 * @module infrastructure/database/migrations/CreateTracePointsTable
 * =============================================================================
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateTracePointsTable1700000000004 implements MigrationInterface {
  /**
   * Método UP - Se ejecuta al aplicar la migración
   * Crea la tabla trace_points con todos sus campos
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla trace_points
    await queryRunner.createTable(
      new Table({
        name: 'trace_points',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'index',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'latitude',
            type: 'double precision',
            isNullable: false,
          },
          {
            name: 'longitude',
            type: 'double precision',
            isNullable: false,
          },
          {
            name: 'elevation_m',
            type: 'double precision',
            isNullable: false,
          },
          {
            name: 'distance_from_start_m',
            type: 'double precision',
            isNullable: false,
          },
          {
            name: 'segment_distance_m',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'trace_id',
            type: 'uuid',
            isNullable: false,
          },
        ],
      }),
      true, // ifNotExists
    );

    // Agregar foreign key hacia traces
    await queryRunner.createForeignKey(
      'trace_points',
      new TableForeignKey({
        columnNames: ['trace_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'traces',
        onDelete: 'CASCADE',
      }),
    );

    // Crear índice para búsquedas por trace_id
    await queryRunner.createIndex(
      'trace_points',
      new TableIndex({
        name: 'idx_trace_points_trace_id',
        columnNames: ['trace_id'],
      }),
    );

    // Crear índice para búsquedas por índice (orden dentro de la traza)
    await queryRunner.createIndex(
      'trace_points',
      new TableIndex({
        name: 'idx_trace_points_index',
        columnNames: ['index'],
      }),
    );

    // Crear índice geoespacial para búsquedas por coordenadas
    // Nota: Requiere extensión PostGIS para máximo rendimiento, pero funciona sin ella
    await queryRunner.createIndex(
      'trace_points',
      new TableIndex({
        name: 'idx_trace_points_coordinates',
        columnNames: ['latitude', 'longitude'],
      }),
    );

    console.log('✅ Tabla trace_points creada exitosamente');
  }

  /**
   * Método DOWN - Se ejecuta al revertir la migración
   * Elimina la tabla trace_points y todas sus relaciones
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Obtener la tabla antes de eliminarla para acceder a las foreign keys
    const table = await queryRunner.getTable('trace_points');
    
    if (table) {
      // Eliminar foreign keys
      const foreignKey = table.foreignKeys.find(
        fk => fk.columnNames.includes('trace_id')
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('trace_points', foreignKey);
      }
    }

    // Eliminar índices
    await queryRunner.dropIndex('trace_points', 'idx_trace_points_coordinates');
    await queryRunner.dropIndex('trace_points', 'idx_trace_points_index');
    await queryRunner.dropIndex('trace_points', 'idx_trace_points_trace_id');

    // Eliminar tabla
    await queryRunner.dropTable('trace_points', true); // ifExists

    console.log('✅ Tabla trace_points eliminada exitosamente');
  }
}
