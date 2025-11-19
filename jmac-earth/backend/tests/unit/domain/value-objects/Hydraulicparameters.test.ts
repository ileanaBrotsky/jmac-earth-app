/// <reference types="jest" />

/**
 * =============================================================================
 * HYDRAULIC PARAMETERS VALUE OBJECT - UNIT TESTS
 * =============================================================================
 * Tests unitarios para el Value Object HydraulicParameters
 * 
 * Valida:
 * - Factory method (create)
 * - Validaciones de rangos
 * - Getters (flow rate, pressure, diameter, lines, interval)
 * - Conversiones (m³/h ↔ BPM, kg/cm² ↔ PSI)
 * - Comportamiento (equals, with* methods)
 * - Serialización (toObject, toJSON, toString, toSummary)
 * - Inmutabilidad
 * - Edge cases
 * 
 * @module tests/unit/domain/value-objects/HydraulicParameters.test
 * =============================================================================
 */

import { HydraulicParameters, FlexiDiameter } from '../../../../src/domain/value-objects/HydraulicParameters';

describe('HydraulicParameters Value Object', () => {
  
  // ===========================================================================
  // VALID PARAMETERS (for reuse in tests)
  // ===========================================================================
  
  const validParams = {
    flowRate_m3h: 120,
    flexiDiameter: FlexiDiameter.TWELVE_INCH,
    pumpingPressure_kgcm2: 8,
    numberOfLines: 2,
    calculationInterval_m: 50
  };

  // ===========================================================================
  // FACTORY METHOD
  // ===========================================================================
  
  describe('create()', () => {
    it('should create parameters with valid values', () => {
      const params = HydraulicParameters.create(validParams);

      expect(params.flowRate_m3h).toBe(120);
      expect(params.flexiDiameter).toBe(FlexiDiameter.TWELVE_INCH);
      expect(params.pumpingPressure_kgcm2).toBe(8);
      expect(params.numberOfLines).toBe(2);
      expect(params.calculationInterval_m).toBe(50);
    });

    it('should accept 10 inch flexi diameter', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        flexiDiameter: FlexiDiameter.TEN_INCH
      });

      expect(params.flexiDiameter).toBe(FlexiDiameter.TEN_INCH);
      expect(params.flexiDiameterInches).toBe(10);
    });

    it('should accept single line configuration', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        numberOfLines: 1
      });

      expect(params.numberOfLines).toBe(1);
      expect(params.hasMultipleLines).toBe(false);
    });
  });

  // ===========================================================================
  // VALIDATIONS - Flow Rate
  // ===========================================================================
  
  describe('Validations - Flow Rate', () => {
    it('should reject negative flow rate', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        flowRate_m3h: -10
      })).toThrow('Flow rate too low');
    });

    it('should reject zero flow rate', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        flowRate_m3h: 0
      })).toThrow('Flow rate too low');
    });

    it('should reject flow rate below minimum (1 m³/h)', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        flowRate_m3h: 0.5
      })).toThrow('Flow rate too low');
    });

    it('should accept minimum flow rate (1 m³/h)', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        flowRate_m3h: 1
      });

      expect(params.flowRate_m3h).toBe(1);
    });

    it('should reject flow rate above maximum (1000 m³/h)', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        flowRate_m3h: 1001
      })).toThrow('Flow rate too high');
    });

    it('should accept maximum flow rate (1000 m³/h)', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        flowRate_m3h: 1000
      });

      expect(params.flowRate_m3h).toBe(1000);
    });

    it('should reject invalid numbers', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        flowRate_m3h: NaN
      })).toThrow('Flow rate must be a number');
    });
  });

  // ===========================================================================
  // VALIDATIONS - Flexi Diameter
  // ===========================================================================
  
  describe('Validations - Flexi Diameter', () => {
    it('should reject invalid diameter', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        flexiDiameter: '8' as FlexiDiameter
      })).toThrow('Invalid flexi diameter');
    });

    it('should accept TEN_INCH', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        flexiDiameter: FlexiDiameter.TEN_INCH
      });

      expect(params.flexiDiameter).toBe(FlexiDiameter.TEN_INCH);
    });

    it('should accept TWELVE_INCH', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        flexiDiameter: FlexiDiameter.TWELVE_INCH
      });

      expect(params.flexiDiameter).toBe(FlexiDiameter.TWELVE_INCH);
    });
  });

  // ===========================================================================
  // VALIDATIONS - Pumping Pressure
  // ===========================================================================
  
  describe('Validations - Pumping Pressure', () => {
    it('should reject negative pressure', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        pumpingPressure_kgcm2: -5
      })).toThrow('Pumping pressure too low');
    });

    it('should reject zero pressure', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        pumpingPressure_kgcm2: 0
      })).toThrow('Pumping pressure too low');
    });

    it('should reject pressure below minimum (1 kg/cm²)', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        pumpingPressure_kgcm2: 0.5
      })).toThrow('Pumping pressure too low');
    });

    it('should accept minimum pressure (1 kg/cm²)', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        pumpingPressure_kgcm2: 1
      });

      expect(params.pumpingPressure_kgcm2).toBe(1);
    });

    it('should reject pressure above maximum (20 kg/cm²)', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        pumpingPressure_kgcm2: 21
      })).toThrow('Pumping pressure too high');
    });

    it('should accept maximum pressure (20 kg/cm²)', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        pumpingPressure_kgcm2: 20
      });

      expect(params.pumpingPressure_kgcm2).toBe(20);
    });
  });

  // ===========================================================================
  // VALIDATIONS - Number of Lines
  // ===========================================================================
  
  describe('Validations - Number of Lines', () => {
    it('should reject zero lines', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        numberOfLines: 0
      })).toThrow('Number of lines too low');
    });

    it('should reject negative lines', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        numberOfLines: -1
      })).toThrow('Number of lines too low');
    });

    it('should reject non-integer lines', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        numberOfLines: 2.5
      })).toThrow('Number of lines must be an integer');
    });

    it('should accept minimum lines (1)', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        numberOfLines: 1
      });

      expect(params.numberOfLines).toBe(1);
    });

    it('should reject lines above maximum (10)', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        numberOfLines: 11
      })).toThrow('Number of lines too high');
    });

    it('should accept maximum lines (10)', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        numberOfLines: 10
      });

      expect(params.numberOfLines).toBe(10);
    });
  });

  // ===========================================================================
  // VALIDATIONS - Calculation Interval
  // ===========================================================================
  
  describe('Validations - Calculation Interval', () => {
    it('should reject zero interval', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        calculationInterval_m: 0
      })).toThrow('Calculation interval too small');
    });

    it('should reject negative interval', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        calculationInterval_m: -50
      })).toThrow('Calculation interval too small');
    });

    it('should reject interval below minimum (10m)', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        calculationInterval_m: 5
      })).toThrow('Calculation interval too small');
    });

    it('should accept minimum interval (10m)', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        calculationInterval_m: 10
      });

      expect(params.calculationInterval_m).toBe(10);
    });

    it('should reject interval above maximum (500m)', () => {
      expect(() => HydraulicParameters.create({
        ...validParams,
        calculationInterval_m: 501
      })).toThrow('Calculation interval too large');
    });

    it('should accept maximum interval (500m)', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        calculationInterval_m: 500
      });

      expect(params.calculationInterval_m).toBe(500);
    });
  });

  // ===========================================================================
  // GETTERS - Flow Rate Conversions
  // ===========================================================================
  
  describe('Flow Rate Conversions', () => {
    const params = HydraulicParameters.create(validParams);

    it('should convert m³/h to BPM correctly', () => {
      // 120 m³/h * 0.1048 = 12.576 BPM
      expect(params.flowRate_bpm).toBeCloseTo(12.576, 3);
    });

    it('should calculate flow per line correctly', () => {
      // 120 m³/h / 2 lines = 60 m³/h per line
      expect(params.flowRatePerLine_m3h).toBe(60);
    });

    it('should calculate BPM per line correctly', () => {
      // 60 m³/h * 0.1048 = 6.288 BPM per line
      expect(params.flowRatePerLine_bpm).toBeCloseTo(6.288, 3);
    });

    it('should handle single line correctly', () => {
      const singleLine = HydraulicParameters.create({
        ...validParams,
        numberOfLines: 1
      });

      expect(singleLine.flowRatePerLine_m3h).toBe(120);
      expect(singleLine.flowRatePerLine_bpm).toBeCloseTo(12.576, 3);
    });
  });

  // ===========================================================================
  // GETTERS - Pressure Conversions
  // ===========================================================================
  
  describe('Pressure Conversions', () => {
    const params = HydraulicParameters.create(validParams);

    it('should convert kg/cm² to PSI correctly', () => {
      // 8 kg/cm² * 14.2233 = 113.7864 PSI
      expect(params.pumpingPressure_psi).toBeCloseTo(113.7864, 3);
    });

    it('should handle minimum pressure conversion', () => {
      const minPressure = HydraulicParameters.create({
        ...validParams,
        pumpingPressure_kgcm2: 1
      });

      expect(minPressure.pumpingPressure_psi).toBeCloseTo(14.2233, 3);
    });

    it('should handle maximum pressure conversion', () => {
      const maxPressure = HydraulicParameters.create({
        ...validParams,
        pumpingPressure_kgcm2: 20
      });

      expect(maxPressure.pumpingPressure_psi).toBeCloseTo(284.466, 3);
    });
  });

  // ===========================================================================
  // GETTERS - Diameter
  // ===========================================================================
  
  describe('Diameter Getters', () => {
    it('should return diameter enum', () => {
      const params = HydraulicParameters.create(validParams);

      expect(params.flexiDiameter).toBe(FlexiDiameter.TWELVE_INCH);
    });

    it('should return diameter as number (10")', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        flexiDiameter: FlexiDiameter.TEN_INCH
      });

      expect(params.flexiDiameterInches).toBe(10);
    });

    it('should return diameter as number (12")', () => {
      const params = HydraulicParameters.create({
        ...validParams,
        flexiDiameter: FlexiDiameter.TWELVE_INCH
      });

      expect(params.flexiDiameterInches).toBe(12);
    });
  });

  // ===========================================================================
  // GETTERS - Number of Lines
  // ===========================================================================
  
  describe('Number of Lines Getters', () => {
    it('should return numberOfLines', () => {
      const params = HydraulicParameters.create(validParams);

      expect(params.numberOfLines).toBe(2);
    });

    it('should indicate multiple lines', () => {
      const multiLine = HydraulicParameters.create({
        ...validParams,
        numberOfLines: 2
      });

      expect(multiLine.hasMultipleLines).toBe(true);
    });

    it('should indicate single line', () => {
      const singleLine = HydraulicParameters.create({
        ...validParams,
        numberOfLines: 1
      });

      expect(singleLine.hasMultipleLines).toBe(false);
    });
  });

  // ===========================================================================
  // DOMAIN BEHAVIOR - equals()
  // ===========================================================================
  
  describe('equals()', () => {
    it('should return true for identical parameters', () => {
      const params1 = HydraulicParameters.create(validParams);
      const params2 = HydraulicParameters.create(validParams);

      expect(params1.equals(params2)).toBe(true);
    });

    it('should return false for different flow rates', () => {
      const params1 = HydraulicParameters.create(validParams);
      const params2 = HydraulicParameters.create({
        ...validParams,
        flowRate_m3h: 130
      });

      expect(params1.equals(params2)).toBe(false);
    });

    it('should return false for different diameters', () => {
      const params1 = HydraulicParameters.create(validParams);
      const params2 = HydraulicParameters.create({
        ...validParams,
        flexiDiameter: FlexiDiameter.TEN_INCH
      });

      expect(params1.equals(params2)).toBe(false);
    });

    it('should return false for different pressures', () => {
      const params1 = HydraulicParameters.create(validParams);
      const params2 = HydraulicParameters.create({
        ...validParams,
        pumpingPressure_kgcm2: 10
      });

      expect(params1.equals(params2)).toBe(false);
    });

    it('should return false for different number of lines', () => {
      const params1 = HydraulicParameters.create(validParams);
      const params2 = HydraulicParameters.create({
        ...validParams,
        numberOfLines: 3
      });

      expect(params1.equals(params2)).toBe(false);
    });
  });

  // ===========================================================================
  // DOMAIN BEHAVIOR - with* methods (Immutability)
  // ===========================================================================
  
  describe('with* methods (Immutability)', () => {
    const original = HydraulicParameters.create(validParams);

    describe('withFlowRate()', () => {
      it('should create new instance with modified flow rate', () => {
        const modified = original.withFlowRate(150);

        expect(modified.flowRate_m3h).toBe(150);
        expect(original.flowRate_m3h).toBe(120); // Original unchanged
        expect(modified).not.toBe(original);
      });

      it('should preserve other parameters', () => {
        const modified = original.withFlowRate(150);

        expect(modified.flexiDiameter).toBe(original.flexiDiameter);
        expect(modified.pumpingPressure_kgcm2).toBe(original.pumpingPressure_kgcm2);
        expect(modified.numberOfLines).toBe(original.numberOfLines);
      });
    });

    describe('withNumberOfLines()', () => {
      it('should create new instance with modified lines', () => {
        const modified = original.withNumberOfLines(3);

        expect(modified.numberOfLines).toBe(3);
        expect(original.numberOfLines).toBe(2); // Original unchanged
        expect(modified).not.toBe(original);
      });

      it('should recalculate flow per line', () => {
        const modified = original.withNumberOfLines(3);

        // 120 m³/h / 3 lines = 40 m³/h per line
        expect(modified.flowRatePerLine_m3h).toBe(40);
      });
    });

    describe('withInterval()', () => {
      it('should create new instance with modified interval', () => {
        const modified = original.withInterval(100);

        expect(modified.calculationInterval_m).toBe(100);
        expect(original.calculationInterval_m).toBe(50); // Original unchanged
        expect(modified).not.toBe(original);
      });
    });
  });

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================
  
  describe('Serialization', () => {
    const params = HydraulicParameters.create(validParams);

    describe('toObject()', () => {
      it('should convert to plain object', () => {
        const obj = params.toObject();

        expect(obj).toEqual(validParams);
      });

      it('should return new object each time', () => {
        const obj1 = params.toObject();
        const obj2 = params.toObject();

        expect(obj1).not.toBe(obj2);
        expect(obj1).toEqual(obj2);
      });
    });

    describe('toJSON()', () => {
      it('should serialize to JSON', () => {
        const json = params.toJSON();

        expect(json).toEqual(validParams);
      });

      it('should work with JSON.stringify', () => {
        const jsonString = JSON.stringify(params);
        const parsed = JSON.parse(jsonString);

        expect(parsed.flowRate_m3h).toBe(120);
        expect(parsed.flexiDiameter).toBe('12');
      });
    });

    describe('toSummary()', () => {
      it('should return summary with all conversions', () => {
        const summary = params.toSummary();

        expect(summary).toHaveProperty('flowRate');
        expect(summary).toHaveProperty('flexi');
        expect(summary).toHaveProperty('pumpingPressure');
        expect(summary).toHaveProperty('numberOfLines');
        expect(summary).toHaveProperty('calculationInterval_m');
      });

      it('should include flow rate conversions', () => {
        const summary = params.toSummary();

        expect(summary.flowRate.total_m3h).toBe(120);
        expect(summary.flowRate.total_bpm).toBeCloseTo(12.576, 3);
        expect(summary.flowRate.perLine_m3h).toBe(60);
        expect(summary.flowRate.perLine_bpm).toBeCloseTo(6.288, 3);
      });

      it('should include pressure conversions', () => {
        const summary = params.toSummary();

        expect(summary.pumpingPressure.kgcm2).toBe(8);
        expect(summary.pumpingPressure.psi).toBeCloseTo(113.7864, 3);
      });

      it('should include flexi diameter info', () => {
        const summary = params.toSummary();

        expect(summary.flexi.diameter).toBe(FlexiDiameter.TWELVE_INCH);
        expect(summary.flexi.diameterInches).toBe(12);
      });
    });

    describe('toString()', () => {
      it('should return readable string', () => {
        const str = params.toString();

        expect(str).toContain('HydraulicParameters');
        expect(str).toContain('120m³/h');
        expect(str).toContain('12.58BPM');
        expect(str).toContain('8kg/cm²');
        expect(str).toContain('2');
        expect(str).toContain('50m');
      });
    });
  });

  // ===========================================================================
  // EDGE CASES
  // ===========================================================================
  
  describe('Edge cases', () => {
    it('should handle typical JMAC project parameters', () => {
      const typical = HydraulicParameters.create({
        flowRate_m3h: 120,
        flexiDiameter: FlexiDiameter.TWELVE_INCH,
        pumpingPressure_kgcm2: 8,
        numberOfLines: 2,
        calculationInterval_m: 50
      });

      expect(typical.flowRate_bpm).toBeCloseTo(12.576, 2);
      expect(typical.flowRatePerLine_bpm).toBeCloseTo(6.288, 2);
    });

    it('should handle minimum valid configuration', () => {
      const minimal = HydraulicParameters.create({
        flowRate_m3h: 1,
        flexiDiameter: FlexiDiameter.TEN_INCH,
        pumpingPressure_kgcm2: 1,
        numberOfLines: 1,
        calculationInterval_m: 10
      });

      expect(minimal.flowRate_m3h).toBe(1);
      expect(minimal.numberOfLines).toBe(1);
    });

    it('should handle maximum valid configuration', () => {
      const maximal = HydraulicParameters.create({
        flowRate_m3h: 1000,
        flexiDiameter: FlexiDiameter.TWELVE_INCH,
        pumpingPressure_kgcm2: 20,
        numberOfLines: 10,
        calculationInterval_m: 500
      });

      expect(maximal.flowRate_m3h).toBe(1000);
      expect(maximal.numberOfLines).toBe(10);
    });

    it('should handle decimal flow rates', () => {
      const decimal = HydraulicParameters.create({
        ...validParams,
        flowRate_m3h: 123.456
      });

      expect(decimal.flowRate_m3h).toBe(123.456);
      expect(decimal.flowRate_bpm).toBeCloseTo(12.938, 2);
    });

    it('should handle many lines distribution', () => {
      const manyLines = HydraulicParameters.create({
        ...validParams,
        flowRate_m3h: 100,
        numberOfLines: 5
      });

      expect(manyLines.flowRatePerLine_m3h).toBe(20);
      expect(manyLines.flowRatePerLine_bpm).toBeCloseTo(2.096, 2);
    });
  });
});