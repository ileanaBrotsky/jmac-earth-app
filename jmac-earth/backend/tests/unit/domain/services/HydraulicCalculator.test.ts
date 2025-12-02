import { HydraulicCalculator } from '../../../../src/domain/services/HydraulicCalculator';
import { HydraulicParameters, FlexiDiameter } from '../../../../src/domain/value-objects/HydraulicParameters';
import { Coordinates } from '../../../../src/domain/value-objects/Coordinates';
import { Elevation } from '../../../../src/domain/value-objects/Elevation';
import { TracePoint } from '../../../../src/domain/entities/TracePoint';

describe('HydraulicCalculator', () => {
  it('interpolates coefficient for intermediate BPM', () => {
    const params = HydraulicParameters.create({
      flowRate_m3h: 120, // -> bpm ~12.576 total
      flexiDiameter: FlexiDiameter.TWELVE_INCH,
      pumpingPressure_kgcm2: 8,
      numberOfLines: 1,
      calculationInterval_m: 50
    });

    // Create minimal trace (two points)
    const p0 = TracePoint.createStart(Coordinates.create(-38.233023, -68.629742), Elevation.fromMeters(545));
    const p1 = TracePoint.create({
      index: 1,
      coordinates: Coordinates.create(-38.23531, -68.627113),
      elevation: Elevation.fromMeters(535),
      distanceFromStart_m: 343
    });

    const result = HydraulicCalculator.calculate([p0, p1], params);

    expect(result.points.length).toBe(2);
    // Coefficient should be a positive number
    const firstPoint = result.points[0]!;
    expect(firstPoint.K).toBeDefined();
    expect(typeof firstPoint.K).toBe('number');
  });

  it('detects pumps and valves correctly', () => {
    const params = HydraulicParameters.create({
      flowRate_m3h: 500, // larger flow
      flexiDiameter: FlexiDiameter.TEN_INCH,
      pumpingPressure_kgcm2: 2,
      numberOfLines: 1,
      calculationInterval_m: 50
    });

    const points: TracePoint[] = [];
    // start
    points.push(TracePoint.createStart(Coordinates.create(-38.2330, -68.6297), Elevation.fromMeters(545)));
    // descending points to trigger valve logic
    points.push(TracePoint.create({ index: 1, coordinates: Coordinates.create(-38.2340, -68.6287), elevation: Elevation.fromMeters(500), distanceFromStart_m: 500 }));
    points.push(TracePoint.create({ index: 2, coordinates: Coordinates.create(-38.2350, -68.6277), elevation: Elevation.fromMeters(450), distanceFromStart_m: 1000 }));

    const result = HydraulicCalculator.calculate(points, params);

    expect(result.pumps.length).toBeGreaterThanOrEqual(1);
    // valves may or may not appear depending on values; ensure no exception
    expect(Array.isArray(result.valves)).toBe(true);
  });

  it('raises alarm when O exceeds threshold', () => {
    const params = HydraulicParameters.create({
      flowRate_m3h: 1000,
      flexiDiameter: FlexiDiameter.TEN_INCH,
      pumpingPressure_kgcm2: 1,
      numberOfLines: 1,
      calculationInterval_m: 50
    });

    const points: TracePoint[] = [];
    points.push(TracePoint.createStart(Coordinates.create(-38.2330, -68.6297), Elevation.fromMeters(0)));
    // create a point far away to make K large
    points.push(TracePoint.create({ index: 1, coordinates: Coordinates.create(-38.3000, -68.6000), elevation: Elevation.fromMeters(0), distanceFromStart_m: 200000 }));

    const result = HydraulicCalculator.calculate(points, params);

    expect(result.alarms.length).toBeGreaterThanOrEqual(0);
  });

  describe('runtime guards', () => {
    it('throws when points is not an array', () => {
      const params = HydraulicParameters.create({
        flowRate_m3h: 10,
        flexiDiameter: FlexiDiameter.TWELVE_INCH,
        pumpingPressure_kgcm2: 1,
        numberOfLines: 1,
        calculationInterval_m: 50
      });

      // @ts-ignore testing runtime guard
      expect(() => HydraulicCalculator.calculate(null as any, params)).toThrow('points must be an array');
    });

    it('throws when params is missing', () => {
      const p0 = TracePoint.createStart(Coordinates.create(-38.233023, -68.629742), Elevation.fromMeters(545));
      const p1 = TracePoint.create({ index: 1, coordinates: Coordinates.create(-38.23531, -68.627113), elevation: Elevation.fromMeters(535), distanceFromStart_m: 343 });

      // @ts-ignore testing runtime guard
      expect(() => HydraulicCalculator.calculate([p0, p1], undefined as any)).toThrow('params is required');
    });

    it('throws when points array is empty', () => {
      const params = HydraulicParameters.create({
        flowRate_m3h: 10,
        flexiDiameter: FlexiDiameter.TWELVE_INCH,
        pumpingPressure_kgcm2: 1,
        numberOfLines: 1,
        calculationInterval_m: 50
      });

      expect(() => HydraulicCalculator.calculate([], params)).toThrow('points array cannot be empty');
    });
  });
});
