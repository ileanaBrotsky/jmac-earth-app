import { HydraulicParameters } from '../value-objects/HydraulicParameters';
import { TracePoint } from '../entities/TracePoint';

/**
 * Advertencia emitida durante cálculo hidráulico
 */
export interface HydraulicWarning {
  type: 'BOUNDS_EXCEEDED' | 'UNUSUAL_CONDITION' | 'DATA_QUALITY';
  message: string;
  context?: Record<string, any>;
}

export interface CalculationPointResult {
  index: number;
  distance_m: number;
  latitude: number;
  longitude: number;
  elevation_m: number;
  K: number; // friction loss (PSI)
  M: number; // static pressure (kg/cm2)
  N: number; // accumulated height (kg/cm2)
  O: number; // combined pressure (PSI)
  P: number; // combined pressure (kg/cm2)
}

export interface CalculationResult {
  points: CalculationPointResult[];
  pumps: CalculationPointResult[];
  valves: CalculationPointResult[];
  alarms: Array<{ type: string; index: number; distance_m: number; value: number; message: string }>;
  warnings: HydraulicWarning[];
  summary: {
    totalDistance_km: number;
    elevationDifference_m: number;
    totalPumps: number;
    totalValves: number;
  };
}

/**
 * HydraulicCalculator
 * Implementa el algoritmo descrito en ALGORITMO_HIDRAULICO_DOCUMENTADO.md
 * 
 * Límites físicos de presión para equipo JMAC:
 * - Presión máxima en bomba: 150 PSI (~10.5 kg/cm²)
 * - Presión mínima (vacío): -100 PSI (~-7 kg/cm²)
 */
export class HydraulicCalculator {
  // Límites físicos para el equipo
  private static readonly MAX_PRESSURE_PSI = 150;
  private static readonly MIN_PRESSURE_PSI = -100;
  // Coefficient tables (partial) from documentation
  private static COEFFICIENTS_12: Record<number, number> = {
    12: 0.026,
    13: 0.030,
    14: 0.039,
    15: 0.048,
    17: 0.056,
    18: 0.065,
    19: 0.074,
    20: 0.082,
    21: 0.091,
    23: 0.100,
    24: 0.113,
    26: 0.130,
    29: 0.152,
    31: 0.173,
    33: 0.199,
    36: 0.229,
    38: 0.260,
    40: 0.377,
    43: 0.325,
    45: 0.359,
    48: 0.398,
    60: 0.628,
    71: 0.887,
    83: 1.190
  };

  private static COEFFICIENTS_10: Record<number, number> = {
    12: 0.069,
    13: 0.082,
    14: 0.090,
    15: 0.112,
    17: 0.129,
    18: 0.151,
    19: 0.168,
    20: 0.190,
    21: 0.212,
    23: 0.233,
    24: 0.260,
    26: 0.311,
    29: 0.367,
    31: 0.429,
    33: 0.498,
    36: 0.558,
    38: 0.636,
    40: 0.718,
    43: 0.797,
    45: 0.887,
    48: 0.978,
    60: 1.560,
    71: 2.200,
    83: 2.970
  };

  private static getCoefficientTable(diameterInches: number): Record<number, number> {
    if (diameterInches === 12) return HydraulicCalculator.COEFFICIENTS_12;
    return HydraulicCalculator.COEFFICIENTS_10;
  }

  private static interpolateCoefficient(bpm: number, table: Record<number, number>): number {
    const keys = Object.keys(table).map(k => parseFloat(k)).sort((a, b) => a - b);
    if (keys.length === 0) return 0;

    const first = keys[0]!;
    const last = keys[keys.length - 1]!;

    if (bpm <= first) return table[first] ?? 0;
    if (bpm >= last) return table[last] ?? 0;

    let lower = first;
    let upper = last;
    for (let i = 0; i < keys.length - 1; i++) {
      const cur = keys[i]!;
      const next = keys[i + 1]!;
      if (bpm === cur) return table[cur] ?? 0;
      if (bpm > cur && bpm < next) {
        lower = cur;
        upper = next;
        break;
      }
    }

    const coefLower = table[lower] ?? 0;
    const coefUpper = table[upper] ?? 0;
    const ratio = (bpm - lower) / (upper - lower);
    return coefLower + (coefUpper - coefLower) * ratio;
  }

  static calculate(points: TracePoint[], params: HydraulicParameters): CalculationResult {
    if (!Array.isArray(points)) throw new Error('HydraulicCalculator.calculate: points must be an array');
    if (!params) throw new Error('HydraulicCalculator.calculate: params is required');
    if (points.length === 0) throw new Error('HydraulicCalculator.calculate: points array cannot be empty');

    const warnings: HydraulicWarning[] = [];
    const results: CalculationPointResult[] = [];
    const table = this.getCoefficientTable(params.flexiDiameterInches);
    if (!table || Object.keys(table).length === 0) throw new Error(`HydraulicCalculator.calculate: missing coefficient table for diameter ${params.flexiDiameterInches}`);
    const bpmPerLine = params.flowRatePerLine_bpm;
    const coef = this.interpolateCoefficient(bpmPerLine, table);

    let N_accum = 0; // accumulated height in kg/cm2

    for (let i = 0; i < points.length; i++) {
      const p = points[i]!;
      const dist = p.distanceFromStart_m;
      const elev = p.elevationMeters;

      // K: friction loss (PSI)
      const K = (dist / 1609.34) * (5280 / 100) * coef;

      // M: static pressure (kg/cm2)
      let M = 0;
      if (i > 0) {
        const prev = points[i - 1]!;
        M = -((prev.elevationMeters - elev) / 10);
      }

      // N: accumulated height (kg/cm2)
      const N = N_accum + M;
      N_accum = N;

      // O: combined pressure (PSI)
      const O = i === 0 ? N + K : K + (N * 14.8);

      // P: combined pressure (kg/cm2)
      const P = O / 14.5;

      // Detectar si presión excede límites físicos
      if (O > HydraulicCalculator.MAX_PRESSURE_PSI) {
        warnings.push({
          type: 'BOUNDS_EXCEEDED',
          message: `Presión O excede límite máximo en punto ${p.index}`,
          context: { index: p.index, distance_m: dist, O, maxPSI: HydraulicCalculator.MAX_PRESSURE_PSI }
        });
      }
      if (O < HydraulicCalculator.MIN_PRESSURE_PSI) {
        warnings.push({
          type: 'BOUNDS_EXCEEDED',
          message: `Presión O es menor que mínimo (vacío peligroso) en punto ${p.index}`,
          context: { index: p.index, distance_m: dist, O, minPSI: HydraulicCalculator.MIN_PRESSURE_PSI }
        });
      }

      results.push({
        index: p.index,
        distance_m: dist,
        latitude: p.latitude,
        longitude: p.longitude,
        elevation_m: elev,
        K,
        M,
        N,
        O,
        P
      });
    }

    // Detect pumps and valves
    const pumps: CalculationPointResult[] = [];
    const valves: CalculationPointResult[] = [];
    const alarms: Array<{ type: string; index: number; distance_m: number; value: number; message: string }> = [];

    let ultima_presion_bomba = 0;
    if (results.length > 0) {
      pumps.push(results[0]!);
      ultima_presion_bomba = 0;
    }

    for (let i = 1; i < results.length; i++) {
      const r = results[i]!;

      // Pump placement
      if (r.P >= ultima_presion_bomba + params.pumpingPressure_kgcm2) {
        pumps.push(r);
        ultima_presion_bomba = r.P;
      }

      // Valve placement: N < -pumpingPressure
      if (r.N < -params.pumpingPressure_kgcm2) {
        valves.push(r);
      }

      // Alarm: O > 200 or < -200 (PSI)
      if (r.O > 200 || r.O < -200) {
        alarms.push({ type: 'PRESION_CRITICA', index: r.index, distance_m: r.distance_m, value: r.O, message: 'Presión fuera de rango seguro' });
      }
    }

    const summary = {
      totalDistance_km: points.length ? points[points.length - 1]!.distanceFromStart_m / 1000 : 0,
      elevationDifference_m: points.length ? points[points.length - 1]!.elevationMeters - points[0]!.elevationMeters : 0,
      totalPumps: pumps.length,
      totalValves: valves.length
    };

    return { points: results, pumps, valves, alarms, warnings, summary };
  }
}

export default HydraulicCalculator;
