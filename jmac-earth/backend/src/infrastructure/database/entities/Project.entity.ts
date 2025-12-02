/**
 * =============================================================================
 * PROJECT ENTITY (TypeORM)
 * =============================================================================
 * Mapea la tabla `projects` en PostgreSQL.
 *
 * Guarda metadata del proyecto, parámetros hidráulicos y enlaza la traza
 * asociada mediante una relación uno a uno.
 *
 * @module infrastructure/database/entities/Project.entity
 * =============================================================================
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';
import { ElevationSource, ProjectStatus } from '@domain/entities/Project';
import { FlexiDiameter } from '@domain/value-objects/HydraulicParameters';
import { TraceEntity } from './Trace.entity';

@Entity('projects')
export class ProjectEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 200, nullable: true })
  client?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 30 })
  status!: ProjectStatus;

  @Column({ type: 'varchar', length: 30 })
  elevationSource!: ElevationSource;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  hydraulicParameters?: {
    flowRate_m3h: number;
    flexiDiameter: FlexiDiameter;
    pumpingPressure_kgcm2: number;
    numberOfLines: number;
    calculationInterval_m: number;
  };

  @OneToOne(() => TraceEntity, trace => trace.project, {
    cascade: true,
    eager: true
  })
  trace?: TraceEntity;
}
