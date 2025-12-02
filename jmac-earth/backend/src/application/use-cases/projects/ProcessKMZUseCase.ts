import { CalculateHydraulicsUseCase } from '@application/use-cases/CalculateHydraulicsUseCase';
import { CalculationResult, ElevationOrigin } from '@domain/services/HydraulicCalculator';
import { HydraulicParameters, FlexiDiameter } from '@domain/value-objects/HydraulicParameters';
import { Trace } from '@domain/entities/Trace';
import { ElevationSource, Project } from '@domain/entities/Project';
import { IProjectRepository } from '@domain/repositories/IProjectRepository';

export interface ProcessKMZPayload {
  name: string;
  client?: string;
  description?: string;
  createdBy?: string;
  flowRate_m3h: number;
  flexiDiameter: FlexiDiameter;
  pumpingPressure_kgcm2: number;
  numberOfLines: number;
  calculationInterval_m: number;
}

export interface ProcessKMZResult {
  project: Project;
  calculation: CalculationResult;
}

export interface ICalculateHydraulicsUseCase {
  execute(kmzBuffer: Buffer, params: HydraulicParameters): Promise<CalculationResult>;
}

export class ProcessKMZUseCase {
  private readonly calculateHydraulics: ICalculateHydraulicsUseCase;
  private readonly projectRepository: IProjectRepository;

  constructor(
    projectRepository: IProjectRepository,
    calculateHydraulicsUseCase?: ICalculateHydraulicsUseCase
  ) {
    if (!projectRepository) {
      throw new Error('ProcessKMZUseCase: projectRepository is required');
    }

    this.projectRepository = projectRepository;
    this.calculateHydraulics = calculateHydraulicsUseCase ?? new CalculateHydraulicsUseCase();
  }

  async execute(kmzBuffer: Buffer, payload: ProcessKMZPayload): Promise<ProcessKMZResult> {
    if (!kmzBuffer || kmzBuffer.length === 0) {
      throw new Error('ProcessKMZUseCase: KMZ file is required');
    }

    if (!payload) {
      throw new Error('ProcessKMZUseCase: payload is required');
    }

    if (!payload.name || payload.name.trim().length === 0) {
      throw new Error('ProcessKMZUseCase: project name is required');
    }

    const params = HydraulicParameters.create({
      flowRate_m3h: payload.flowRate_m3h,
      flexiDiameter: payload.flexiDiameter,
      pumpingPressure_kgcm2: payload.pumpingPressure_kgcm2,
      numberOfLines: payload.numberOfLines,
      calculationInterval_m: payload.calculationInterval_m
    });

    const calculation = await this.calculateHydraulics.execute(kmzBuffer, params);
    const tracePoints = calculation.tracePoints;

    if (!tracePoints || tracePoints.length === 0) {
      throw new Error('ProcessKMZUseCase: No se pudieron generar puntos de traza');
    }

    const trace = Trace.create(tracePoints);
    const elevationSource = this.resolveElevationSource(calculation.elevationSource);

    const project = Project.create({
      name: payload.name,
      client: payload.client,
      description: payload.description,
      trace,
      elevationSource,
      createdBy: payload.createdBy
    });

    project.setHydraulicParameters(params);
    project.markAsCalculated();

    const saved = await this.projectRepository.save(project);

    return {
      project: saved,
      calculation
    };
  }

  private resolveElevationSource(origin?: ElevationOrigin): ElevationSource {
    return origin === 'api' ? ElevationSource.API : ElevationSource.KMZ;
  }
}
