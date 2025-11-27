import { Request, Response, NextFunction } from 'express';
import { MulterRequest } from '@infrastructure/middleware/multer.types';
import { ProcessKMZUseCase } from '@application/use-cases/projects/ProcessKMZUseCase';
import { TypeORMProjectRepository } from '@infrastructure/repositories/TypeORMProjectRepository';
import { IProjectRepository } from '@domain/repositories/IProjectRepository';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { FlexiDiameter } from '@domain/value-objects/HydraulicParameters';

export class ProjectController {
  private readonly projectRepository: IProjectRepository;
  private readonly processKMZUseCase: ProcessKMZUseCase;

  constructor(
    projectRepository?: IProjectRepository,
    processKMZUseCase?: ProcessKMZUseCase
  ) {
    this.projectRepository = projectRepository ?? new TypeORMProjectRepository();
    this.processKMZUseCase = processKMZUseCase ?? new ProcessKMZUseCase(this.projectRepository);
  }

  async createProject(req: MulterRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Archivo KMZ requerido'
        });
        return;
      }

      const {
        name,
        client,
        description,
        createdBy,
        flowRate_m3h,
        flexiDiameter,
        pumpingPressure_kgcm2,
        numberOfLines,
        calculationInterval_m
      } = req.body;

      if (
        !name ||
        !flowRate_m3h ||
        !flexiDiameter ||
        !pumpingPressure_kgcm2 ||
        !numberOfLines ||
        !calculationInterval_m
      ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Todos los parámetros son requeridos: name, flowRate_m3h, flexiDiameter, pumpingPressure_kgcm2, numberOfLines, calculationInterval_m'
        });
        return;
      }

      const flowRate = parseFloat(flowRate_m3h);
      const pressure = parseFloat(pumpingPressure_kgcm2);
      const lines = parseInt(numberOfLines, 10);
      const interval = parseFloat(calculationInterval_m);
      const diameter = this.parseFlexiDiameter(flexiDiameter);

      if (isNaN(flowRate) || isNaN(pressure) || isNaN(lines) || isNaN(interval) || !diameter) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Parámetros numéricos inválidos o diámetro no soportado'
        });
        return;
      }

      const payload = {
        name,
        client,
        description,
        createdBy,
        flowRate_m3h: flowRate,
        flexiDiameter: diameter,
        pumpingPressure_kgcm2: pressure,
        numberOfLines: lines,
        calculationInterval_m: interval
      };

      const result = await this.processKMZUseCase.execute(req.file.buffer, payload);

      // Normalize calculation points to use lat/lon property names
      const normalizedPoints = result.calculation.points.map(point => ({
        ...point,
        lat: point.latitude,
        lon: point.longitude
      }));

      const normalizedPumps = result.calculation.pumps.map(pump => ({
        ...pump,
        lat: pump.latitude,
        lon: pump.longitude
      }));

      const normalizedValves = result.calculation.valves.map(valve => ({
        ...valve,
        lat: valve.latitude,
        lon: valve.longitude
      }));

      // Build the response with complete calculation data
      const calculationData = {
        trace: {
          points: normalizedPoints,
          totalDistance_m: result.calculation.summary.totalDistance_km * 1000,
          pointCount: normalizedPoints.length
        },
        pumps: normalizedPumps,
        valves: normalizedValves,
        alarms: result.calculation.alarms,
        warnings: result.calculation.warnings,
        summary: result.calculation.summary
      };

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          project: result.project.toObject(),
          calculation: calculationData
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: message
      });
    }
  }

  async listProjects(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await this.projectRepository.findAll();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          projects: projects.map(project => project.getSummary())
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'ID del proyecto es requerido'
        });
        return;
      }
      
      const project = await this.projectRepository.findById(id);

      if (!project) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: `Proyecto con id ${id} no encontrado`
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          project: project.toObject()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  private parseFlexiDiameter(value: string): FlexiDiameter | null {
    if (!value) return null;

    if (value === '12' || value === '12"' || value === '12in') {
      return FlexiDiameter.TWELVE_INCH;
    }

    if (value === '10' || value === '10"' || value === '10in') {
      return FlexiDiameter.TEN_INCH;
    }

    return null;
  }
}
