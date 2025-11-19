import { HydraulicCalculator } from '../../../../src/domain/services/HydraulicCalculator';
import { HydraulicParameters, FlexiDiameter } from '../../../../src/domain/value-objects/HydraulicParameters';
import { Coordinates } from '../../../../src/domain/value-objects/Coordinates';
import { Elevation } from '../../../../src/domain/value-objects/Elevation';
import { TracePoint } from '../../../../src/domain/entities/TracePoint';

describe('HydraulicCalculator numeric vectors', () => {
  it('matches expected numeric outputs for scenario 1 (12" - 120 m3/h)', () => {
    const params = HydraulicParameters.create({
      flowRate_m3h: 120,
      flexiDiameter: FlexiDiameter.TWELVE_INCH,
      pumpingPressure_kgcm2: 8,
      numberOfLines: 1,
      calculationInterval_m: 50
    });

    const p0 = TracePoint.createStart(Coordinates.create(-38.233023, -68.629742), Elevation.fromMeters(545));
    const p1 = TracePoint.create({ index: 1, coordinates: Coordinates.create(-38.23531, -68.627113), elevation: Elevation.fromMeters(535), distanceFromStart_m: 343 });

    const result = HydraulicCalculator.calculate([p0, p1], params);

    expect(result.points.length).toBe(2);
    expect(result.warnings).toBeDefined();
    expect(Array.isArray(result.warnings)).toBe(true);
    const second = result.points[1]!;

    expect(second.K).toBeCloseTo(0.31851365255322056, 6);
    expect(second.M).toBeCloseTo(-1, 6);
    expect(second.O).toBeCloseTo(-14.481486347446781, 6);
    expect(second.P).toBeCloseTo(-0.9987231963756401, 6);
    expect(result.summary.totalDistance_km).toBeCloseTo(0.343, 6);
  });

  it('matches expected numeric outputs for scenario 2 (10" - 500 m3/h)', () => {
    const params = HydraulicParameters.create({
      flowRate_m3h: 500,
      flexiDiameter: FlexiDiameter.TEN_INCH,
      pumpingPressure_kgcm2: 2,
      numberOfLines: 1,
      calculationInterval_m: 50
    });

    const points = [] as TracePoint[];
    points.push(TracePoint.createStart(Coordinates.create(-38.2330, -68.6297), Elevation.fromMeters(545)));
    points.push(TracePoint.create({ index: 1, coordinates: Coordinates.create(-38.2340, -68.6287), elevation: Elevation.fromMeters(500), distanceFromStart_m: 500 }));
    points.push(TracePoint.create({ index: 2, coordinates: Coordinates.create(-38.2350, -68.6277), elevation: Elevation.fromMeters(450), distanceFromStart_m: 1000 }));

    const result = HydraulicCalculator.calculate(points, params);

    expect(result.points.length).toBe(3);
    const p1 = result.points[1]!;
    const p2 = result.points[2]!;

    expect(p1.K).toBeCloseTo(19.54401183093691, 6);
    expect(p1.P).toBeCloseTo(-3.245240563383662, 6);

    expect(p2.K).toBeCloseTo(39.08802366187382, 6);
    expect(p2.P).toBeCloseTo(-7.000825954353529, 6);

    expect(result.summary.totalDistance_km).toBeCloseTo(1, 6);
    expect(result.summary.totalValves).toBe(2);
  });
});
