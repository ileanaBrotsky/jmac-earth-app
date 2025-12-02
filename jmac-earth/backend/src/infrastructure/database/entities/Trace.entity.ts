/**
 * =============================================================================
 * TRACE ENTITY (TypeORM)
 * =============================================================================
 * Representa una traza completa almacenada en PostgreSQL. Guarda el resumen
 * geoespacial y la relación uno-a-uno con el proyecto relacionado.
 *
 * @module infrastructure/database/entities/Trace.entity
 * =============================================================================
 */

import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { ProjectEntity } from './Project.entity';
import { TracePointEntity } from './TracePoint.entity';

@Entity('traces')
export class TraceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'double precision', default: 0 })
  totalDistance_m!: number;

  @Column({ type: 'int' })
  pointCount!: number;

  @Column({ type: 'jsonb', nullable: true })
  elevationProfile?: {
    min_m: number;
    max_m: number;
    start_m: number;
    end_m: number;
    difference_m: number;
  };

  @OneToMany(() => TracePointEntity, point => point.trace, {
    cascade: true,
    eager: true
  })
  points!: TracePointEntity[];

  @OneToOne(() => ProjectEntity, project => project.trace, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'project_id' })
  project!: ProjectEntity;
}
