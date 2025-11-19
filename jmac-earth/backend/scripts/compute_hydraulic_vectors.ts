import 'reflect-metadata';
import { HydraulicCalculator } from '../src/domain/services/HydraulicCalculator';
import { HydraulicParameters, FlexiDiameter } from '../src/domain/value-objects/HydraulicParameters';
import { Coordinates } from '../src/domain/value-objects/Coordinates';
import { Elevation } from '../src/domain/value-objects/Elevation';
import { TracePoint } from '../src/domain/entities/TracePoint';

function scenario1() {
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
  return { params: params.toSummary(), firstPoint: result.points[0], secondPoint: result.points[1], summary: result.summary };
}

function scenario2() {
  const params = HydraulicParameters.create({
    flowRate_m3h: 500,
    flexiDiameter: FlexiDiameter.TEN_INCH,
    pumpingPressure_kgcm2: 2,
    numberOfLines: 1,
    calculationInterval_m: 50
  });

  const points = [] as any[];
  points.push(TracePoint.createStart(Coordinates.create(-38.2330, -68.6297), Elevation.fromMeters(545)));
  points.push(TracePoint.create({ index: 1, coordinates: Coordinates.create(-38.2340, -68.6287), elevation: Elevation.fromMeters(500), distanceFromStart_m: 500 }));
  points.push(TracePoint.create({ index: 2, coordinates: Coordinates.create(-38.2350, -68.6277), elevation: Elevation.fromMeters(450), distanceFromStart_m: 1000 }));

  const result = HydraulicCalculator.calculate(points, params);
  return { params: params.toSummary(), points: result.points, pumps: result.pumps.map(p => ({ index: p.index, P: p.P })), summary: result.summary };
}

console.log(JSON.stringify({ scenario1: scenario1(), scenario2: scenario2() }, null, 2));
