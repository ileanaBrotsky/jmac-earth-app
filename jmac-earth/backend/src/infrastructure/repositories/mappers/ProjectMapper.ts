/**
 * =============================================================================
 * PROJECT MAPPER
 * =============================================================================
 * Convierte entre la entidad de dominio Project y la entidad de infraestructura
 * ProjectEntity (TypeORM). Mantiene el dominio aislado de la base de datos.
 *
 * @module infrastructure/repositories/mappers/ProjectMapper
 * =============================================================================
 */

import { Trace } from '../../../domain/entities/Trace';
import { Project, ProjectProps } from '../../../domain/entities/Project';
import { TracePoint } from '../../../domain/entities/TracePoint';
import { HydraulicParameters } from '../../../domain/value-objects/HydraulicParameters';
import { FlexiDiameter } from '../../../domain/value-objects/HydraulicParameters';
import { TraceEntity } from '../../database/entities/Trace.entity';
import { ProjectEntity } from '../../database/entities/Project.entity';
import { TracePointMapper } from './TracePointMapper';

export class ProjectMapper {
  static toDomain(entity: ProjectEntity): Project {
    if (!entity.trace) {
      throw new Error(`ProjectEntity ${entity.id} is missing trace data`);
    }

    const sortedPoints = [...entity.trace.points].sort((a, b) => a.index - b.index);
    const tracePoints: TracePoint[] = sortedPoints.map(point => TracePointMapper.toDomain(point));

    const trace = Trace.create(tracePoints);

    const hydraulicParameters = entity.hydraulicParameters
      ? HydraulicParameters.create({
        flowRate_m3h: entity.hydraulicParameters.flowRate_m3h,
        flexiDiameter: entity.hydraulicParameters.flexiDiameter as FlexiDiameter,
        pumpingPressure_kgcm2: entity.hydraulicParameters.pumpingPressure_kgcm2,
        numberOfLines: entity.hydraulicParameters.numberOfLines,
        calculationInterval_m: entity.hydraulicParameters.calculationInterval_m
      })
      : undefined;

    const props: ProjectProps = {
      id: entity.id,
      name: entity.name,
      client: entity.client,
      description: entity.description,
      trace,
      elevationSource: entity.elevationSource,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      hydraulicParameters
    };

    return Project.reconstitute(props);
  }

  static toPersistence(project: Project): ProjectEntity {
    const entity = new ProjectEntity();

    entity.id = project.id;
    entity.name = project.name;
    entity.client = project.client;
    entity.description = project.description;
    entity.status = project.status;
    entity.elevationSource = project.elevationSource;
    entity.createdBy = project.createdBy;
    entity.createdAt = project.createdAt;
    entity.updatedAt = project.updatedAt;
    entity.hydraulicParameters = project.hydraulicParameters?.toObject();

    const trace = project.trace;
    const traceEntity = new TraceEntity();

    const elevationProfile = trace.elevationProfile;
    traceEntity.totalDistance_m = trace.totalDistance;
    traceEntity.pointCount = trace.pointCount;
    traceEntity.elevationProfile = {
      min_m: elevationProfile.min.meters,
      max_m: elevationProfile.max.meters,
      start_m: elevationProfile.start.meters,
      end_m: elevationProfile.end.meters,
      difference_m: elevationProfile.difference
    };

    traceEntity.project = entity;
    traceEntity.points = trace.points.map(point => TracePointMapper.toPersistence(point, traceEntity));

    entity.trace = traceEntity;

    return entity;
  }
}
