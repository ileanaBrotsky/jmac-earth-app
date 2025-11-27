/**
 * =============================================================================
 * TRACE POINT MAPPER
 * =============================================================================
 * Convierte entre la entidad de dominio TracePoint y la entidad de infraestructura
 * TracePointEntity.
 *
 * @module infrastructure/repositories/mappers/TracePointMapper
 * =============================================================================
 */

import { TracePoint } from '../../../domain/entities/TracePoint';
import { Coordinates } from '../../../domain/value-objects/Coordinates';
import { Elevation } from '../../../domain/value-objects/Elevation';
import { TraceEntity } from '../../database/entities/Trace.entity';
import { TracePointEntity } from '../../database/entities/TracePoint.entity';

export class TracePointMapper {
  static toPersistence(point: TracePoint, trace: TraceEntity): TracePointEntity {
    const entity = new TracePointEntity();

    entity.trace = trace;
    entity.index = point.index;
    entity.latitude = point.latitude;
    entity.longitude = point.longitude;
    entity.elevation_m = point.elevationMeters;
    entity.distance_from_start_m = point.distanceFromStart_m;
    entity.segment_distance_m = point.segmentDistance_m;

    return entity;
  }

  static toDomain(entity: TracePointEntity): TracePoint {
    const coordinates = Coordinates.create(entity.latitude, entity.longitude);
    const elevation = Elevation.fromMeters(entity.elevation_m);

    return TracePoint.createWithSegment({
      index: entity.index,
      coordinates,
      elevation,
      distanceFromStart_m: entity.distance_from_start_m,
      segmentDistance_m: entity.segment_distance_m
    });
  }
}
