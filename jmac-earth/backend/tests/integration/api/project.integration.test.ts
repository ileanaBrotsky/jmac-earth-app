import request from 'supertest';
import express, { Express } from 'express';
import { ProjectController } from '@interfaces/controllers/ProjectController';
import { createProjectRoutes } from '@interfaces/routes/project.routes';
import { ProcessKMZResult } from '@application/use-cases/projects/ProcessKMZUseCase';
import { ProcessKMZUseCase } from '@application/use-cases/projects/ProcessKMZUseCase';
import { Project } from '@domain/entities/Project';
import { Trace } from '@domain/entities/Trace';
import { TracePoint } from '@domain/entities/TracePoint';
import { Coordinates } from '@domain/value-objects/Coordinates';
import { Elevation } from '@domain/value-objects/Elevation';
import { ElevationSource } from '@domain/entities/Project';
import { HydraulicParameters, FlexiDiameter } from '@domain/value-objects/HydraulicParameters';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { createSampleKMZ } from '../../fixtures/kmz.fixtures';

class StubProjectRepository {
  async save(project: Project): Promise<Project> {
    return project;
  }
  async findById(): Promise<Project | null> {
    return null;
  }
  async findAll(): Promise<Project[]> {
    return [];
  }
  async delete(): Promise<void> {
    return;
  }
}

describe('Project Routes', () => {
  let app: Express;
  let controller: ProjectController;
  let stubResult: ProcessKMZResult;

  beforeAll(() => {
    const points = [
      TracePoint.createStart(Coordinates.create(-38.233, -68.629), Elevation.fromMeters(545)),
      TracePoint.create({
        index: 1,
        coordinates: Coordinates.create(-38.235, -68.627),
        elevation: Elevation.fromMeters(535),
        distanceFromStart_m: 250
      })
    ];

    const trace = Trace.create(points);
    const project = Project.create({
      name: 'Prueba',
      trace,
      elevationSource: ElevationSource.KMZ
    });

    const params = HydraulicParameters.create({
      flowRate_m3h: 120,
      flexiDiameter: FlexiDiameter.TWELVE_INCH,
      pumpingPressure_kgcm2: 8,
      numberOfLines: 1,
      calculationInterval_m: 50
    });

    project.setHydraulicParameters(params);
    project.markAsCalculated();

    const calculationPoints = points.map(point => ({
      index: point.index,
      distance_m: point.distanceFromStart_m,
      latitude: point.latitude,
      longitude: point.longitude,
      elevation_m: point.elevationMeters,
      K: 0,
      M: 0,
      N: 0,
      O: 0,
      P: 0
    }));

    stubResult = {
      project,
      calculation: {
        points: calculationPoints,
        pumps: [calculationPoints[0]!],
        valves: [],
        alarms: [],
        warnings: [],
        summary: {
          totalDistance_km: 0.25,
          elevationDifference_m: 10,
          totalPumps: 1,
          totalValves: 0
        },
        tracePoints: points,
        elevationSource: 'kmz'
      }
    };

    const stubUseCase = {
      execute: async () => stubResult,
      calculateHydraulics: async () => ({ results: [] }),
      resolveElevationSource: () => ElevationSource.KMZ,
      projectRepository: new StubProjectRepository()
    } as unknown as ProcessKMZUseCase;
    controller = new ProjectController(new StubProjectRepository(), stubUseCase);

    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/v1', createProjectRoutes(controller));
  });

  it('rejects requests without file', async () => {
    const response = await request(app)
      .post('/api/v1/projects')
      .field('name', 'test')
      .field('flowRate_m3h', '120')
      .field('flexiDiameter', '12')
      .field('pumpingPressure_kgcm2', '8')
      .field('numberOfLines', '1')
      .field('calculationInterval_m', '50');

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.error).toContain('KMZ requerido');
  });

  it('rejects invalid diameter', async () => {
    const kmz = await createSampleKMZ('-68.629,-38.233,545 -68.627,-38.235,535');

    const response = await request(app)
      .post('/api/v1/projects')
      .attach('file', kmz, 'trace.kmz')
      .field('name', 'test')
      .field('flowRate_m3h', '120')
      .field('flexiDiameter', '8')
      .field('pumpingPressure_kgcm2', '8')
      .field('numberOfLines', '1')
      .field('calculationInterval_m', '50');

    expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(response.body.error).toContain('diámetro no soportado');
  });

  it('returns project data on success', async () => {
    const kmz = await createSampleKMZ('-68.629,-38.233,545 -68.627,-38.235,535');

    const response = await request(app)
      .post('/api/v1/projects')
      .attach('file', kmz, 'trace.kmz')
      .field('name', 'test project')
      .field('client', 'Cliente')
      .field('description', 'desc')
      .field('flowRate_m3h', '120')
      .field('flexiDiameter', '12')
      .field('pumpingPressure_kgcm2', '8')
      .field('numberOfLines', '1')
      .field('calculationInterval_m', '50');

    expect(response.status).toBe(HTTP_STATUS.CREATED);
    expect(response.body.success).toBe(true);
    expect(response.body.data.project.name).toBe(stubResult.project.name);
    expect(response.body.data.calculation.summary.totalPumps).toBe(1);
  });
});
