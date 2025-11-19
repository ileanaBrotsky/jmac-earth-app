/**
 * =============================================================================
 * ENTITIES TEST - SIMPLIFIED VERSION
 * =============================================================================
 * Tests unitarios simplificados para TracePoint, Trace y Project entities.
 * 
 * Valida las funcionalidades críticas de cada entidad.
 * 
 * @module tests/unit/domain/entities
 * =============================================================================
 */

import { TracePoint } from '../../../../src/domain/entities/TracePoint';
import { Trace } from '../../../../src/domain/entities/Trace';
import { Project, ProjectStatus, ElevationSource } from '../../../../src/domain/entities/Project';
import { Coordinates } from '../../../../src/domain/value-objects/Coordinates';
import { Elevation } from '../../../../src/domain/value-objects/Elevation';
import { HydraulicParameters, FlexiDiameter } from '../../../../src/domain/value-objects/HydraulicParameters';

describe('TracePoint Entity', () => {
  
  const validCoords = Coordinates.create(-38.2353, -68.6271);
  const validElevation = Elevation.fromMeters(545);

  describe('Factory Methods', () => {
    it('should create TracePoint with create()', () => {
      const point = TracePoint.create({
        index: 0,
        coordinates: validCoords,
        elevation: validElevation,
        distanceFromStart_m: 0
      });

      expect(point).toBeInstanceOf(TracePoint);
      expect(point.index).toBe(0);
      expect(point.distanceFromStart_m).toBe(0);
    });

    it('should create starting point with createStart()', () => {
      const start = TracePoint.createStart(validCoords, validElevation);

      expect(start.index).toBe(0);
      expect(start.distanceFromStart_m).toBe(0);
      expect(start.isStart).toBe(true);
    });

    it('should create point with segment distance', () => {
      const point = TracePoint.createWithSegment({
        index: 1,
        coordinates: validCoords,
        elevation: validElevation,
        distanceFromStart_m: 100,
        segmentDistance_m: 100
      });

      expect(point.segmentDistance_m).toBe(100);
    });
  });

  describe('Validation', () => {
    it('should reject negative index', () => {
      expect(() => TracePoint.create({
        index: -1,
        coordinates: validCoords,
        elevation: validElevation,
        distanceFromStart_m: 0
      })).toThrow('index must be non-negative');
    });

    it('should reject negative distance', () => {
      expect(() => TracePoint.create({
        index: 0,
        coordinates: validCoords,
        elevation: validElevation,
        distanceFromStart_m: -10
      })).toThrow('must be non-negative');
    });
  });

  describe('Getters', () => {
    it('should expose coordinates and elevation', () => {
      const point = TracePoint.createStart(validCoords, validElevation);

      expect(point.coordinates).toBeInstanceOf(Coordinates);
      expect(point.elevation).toBeInstanceOf(Elevation);
      expect(point.latitude).toBe(-38.2353);
      expect(point.longitude).toBe(-68.6271);
      expect(point.elevationMeters).toBe(545);
    });
  });

  describe('Serialization', () => {
    it('should convert to plain object', () => {
      const point = TracePoint.createStart(validCoords, validElevation);
      const obj = point.toObject();

      expect(obj).toHaveProperty('index');
      expect(obj).toHaveProperty('latitude');
      expect(obj).toHaveProperty('longitude');
      expect(obj).toHaveProperty('elevation_m');
      expect(obj).toHaveProperty('distanceFromStart_m');
    });
  });
});

describe('Trace Entity', () => {
  
  const coords1 = Coordinates.create(-38.2353, -68.6271);
  const coords2 = Coordinates.create(-38.2363, -68.6281);
  const elev1 = Elevation.fromMeters(545);
  const elev2 = Elevation.fromMeters(540);

  describe('Factory Methods', () => {
    it('should create Trace from TracePoints array', () => {
      const points = [
        TracePoint.createStart(coords1, elev1),
        TracePoint.create({
          index: 1,
          coordinates: coords2,
          elevation: elev2,
          distanceFromStart_m: 100
        })
      ];

      const trace = Trace.create(points);

      expect(trace).toBeInstanceOf(Trace);
      expect(trace.pointCount).toBe(2);
    });

    it('should create Trace from coordinates and elevations', () => {
      const trace = Trace.fromCoordinatesAndElevations([
        { coordinates: coords1, elevation: elev1 },
        { coordinates: coords2, elevation: elev2 }
      ]);

      expect(trace).toBeInstanceOf(Trace);
      expect(trace.pointCount).toBe(2);
    });
  });

  describe('Validation', () => {
    it('should reject empty points array', () => {
      expect(() => Trace.create([])).toThrow('at least one point');
    });
  });

  describe('Getters', () => {
    it('should return correct point count and distances', () => {
      const points = [
        TracePoint.createStart(coords1, elev1),
        TracePoint.create({
          index: 1,
          coordinates: coords2,
          elevation: elev2,
          distanceFromStart_m: 150
        })
      ];

      const trace = Trace.create(points);

      expect(trace.pointCount).toBe(2);
      expect(trace.totalDistance).toBe(150);
      expect(trace.totalDistanceKm).toBeCloseTo(0.15, 2);
    });

    it('should return start and end points', () => {
      const points = [
        TracePoint.createStart(coords1, elev1),
        TracePoint.create({
          index: 1,
          coordinates: coords2,
          elevation: elev2,
          distanceFromStart_m: 100
        })
      ];

      const trace = Trace.create(points);

      expect(trace.startPoint.index).toBe(0);
      expect(trace.endPoint.index).toBe(1);
    });
  });

  describe('Serialization', () => {
    it('should convert to plain object', () => {
      const points = [
        TracePoint.createStart(coords1, elev1),
        TracePoint.create({
          index: 1,
          coordinates: coords2,
          elevation: elev2,
          distanceFromStart_m: 100
        })
      ];

      const trace = Trace.create(points);
      const obj = trace.toObject();

      expect(obj).toHaveProperty('points');
      expect(obj).toHaveProperty('totalDistance_m');
      expect(obj).toHaveProperty('pointCount');
      expect(obj).toHaveProperty('elevationProfile');
      expect(Array.isArray(obj.points)).toBe(true);
      expect(obj.points).toHaveLength(2);
    });
  });
});

describe('Project Entity', () => {
  
  const coords1 = Coordinates.create(-38.2353, -68.6271);
  const coords2 = Coordinates.create(-38.2363, -68.6281);
  const elev1 = Elevation.fromMeters(545);
  const elev2 = Elevation.fromMeters(540);

  let validTrace: Trace;
  let validParams: HydraulicParameters;

  beforeEach(() => {
    validTrace = Trace.fromCoordinatesAndElevations([
      { coordinates: coords1, elevation: elev1 },
      { coordinates: coords2, elevation: elev2 }
    ]);

    validParams = HydraulicParameters.create({
      flowRate_m3h: 120,
      flexiDiameter: FlexiDiameter.TWELVE_INCH,
      pumpingPressure_kgcm2: 8,
      numberOfLines: 1,
      calculationInterval_m: 50
    });
  });

  describe('Factory Methods', () => {
    it('should create Project with create()', () => {
      const project = Project.create({
        name: 'Proyecto Test',
        trace: validTrace,
        elevationSource: ElevationSource.API
      });

      expect(project).toBeInstanceOf(Project);
      expect(project.name).toBe('Proyecto Test');
      expect(project.status).toBe(ProjectStatus.DRAFT);
      expect(project.isDraft).toBe(true);
    });

    it('should create project with optional fields', () => {
      const project = Project.create({
        name: 'Proyecto Test',
        client: 'Cliente Test',
        description: 'Descripción test',
        trace: validTrace,
        elevationSource: ElevationSource.KMZ,
        createdBy: 'user-123'
      });

      expect(project.client).toBe('Cliente Test');
      expect(project.description).toBe('Descripción test');
      expect(project.createdBy).toBe('user-123');
    });
  });

  describe('Validation', () => {
    it('should reject empty name', () => {
      expect(() => Project.create({
        name: '',
        trace: validTrace,
        elevationSource: ElevationSource.API
      })).toThrow('Project name is required');
    });

    it('should reject short name', () => {
      expect(() => Project.create({
        name: 'AB',
        trace: validTrace,
        elevationSource: ElevationSource.API
      })).toThrow('at least 3 characters');
    });
  });

  describe('Hydraulic Parameters', () => {
    it('should start without parameters', () => {
      const project = Project.create({
        name: 'Proyecto Test',
        trace: validTrace,
        elevationSource: ElevationSource.API
      });

      expect(project.hydraulicParameters).toBeUndefined();
      expect(project.isReadyForCalculation).toBe(false);
    });

    it('should set hydraulic parameters', () => {
      const project = Project.create({
        name: 'Proyecto Test',
        trace: validTrace,
        elevationSource: ElevationSource.API
      });

      project.setHydraulicParameters(validParams);

      expect(project.hydraulicParameters).toBeInstanceOf(HydraulicParameters);
      expect(project.isReadyForCalculation).toBe(true);
    });
  });

  describe('Status Management', () => {
    it('should start in DRAFT status', () => {
      const project = Project.create({
        name: 'Proyecto Test',
        trace: validTrace,
        elevationSource: ElevationSource.API
      });

      expect(project.status).toBe(ProjectStatus.DRAFT);
      expect(project.isDraft).toBe(true);
      expect(project.isCalculated).toBe(false);
    });
  });

  describe('Trace Integration', () => {
    it('should access trace properties through project', () => {
      const project = Project.create({
        name: 'Proyecto Test',
        trace: validTrace,
        elevationSource: ElevationSource.API
      });

      expect(project.trace).toBe(validTrace);
      expect(project.trace.totalDistance).toBe(validTrace.totalDistance);
      expect(project.trace.totalDistanceKm).toBe(validTrace.totalDistanceKm);
      expect(project.trace.pointCount).toBe(validTrace.pointCount);
    });
  });

  describe('Update Methods', () => {
    it('should update name', () => {
      const project = Project.create({
        name: 'Proyecto Test',
        trace: validTrace,
        elevationSource: ElevationSource.API
      });

      project.updateName('Nuevo Nombre');

      expect(project.name).toBe('Nuevo Nombre');
    });
  });

  describe('Serialization', () => {
    it('should convert to plain object', () => {
      const project = Project.create({
        name: 'Proyecto Test',
        client: 'Cliente Test',
        description: 'Descripción test',
        trace: validTrace,
        elevationSource: ElevationSource.API
      });

      const obj = project.toObject();

      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('name');
      expect(obj).toHaveProperty('trace');
      expect(obj).toHaveProperty('status');
      expect(obj).toHaveProperty('createdAt');
      expect(obj).toHaveProperty('updatedAt');
      expect(obj.name).toBe('Proyecto Test');
      expect(obj.client).toBe('Cliente Test');
    });
  });
});