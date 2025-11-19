/**
 * =============================================================================
 * TRACE POINT ENTITY (TypeORM)
 * =============================================================================
 * Mapea cada punto de una traza hidráulica a la tabla `trace_points`.
 *
 * Esta entidad forma parte de la capa Infrastructure y guarda los datos
 * geoespaciales que se usan en los cálculos.
 *
 * @module infrastructure/database/entities/TracePoint.entity
 * =============================================================================
 */

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { TraceEntity } from './Trace.entity';

@Entity('trace_points')
export class TracePointEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  index!: number;

  @Column({ type: 'double precision' })
  latitude!: number;

  @Column({ type: 'double precision' })
  longitude!: number;

  @Column({ type: 'double precision' })
  elevation_m!: number;

  @Column({ type: 'double precision' })
  distance_from_start_m!: number;

  @Column({ type: 'double precision', nullable: true })
  segment_distance_m?: number;

  @ManyToOne(() => TraceEntity, trace => trace.points, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'trace_id' })
  trace!: TraceEntity;
}
