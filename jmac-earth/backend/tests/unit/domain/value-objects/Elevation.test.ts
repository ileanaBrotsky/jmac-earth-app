/// <reference types="jest" />

/**
 * =============================================================================
 * ELEVATION VALUE OBJECT - UNIT TESTS
 * =============================================================================
 * Tests unitarios para el Value Object Elevation
 * 
 * Valida:
 * - Factory methods (fromMeters, fromFeet, fromKilometers, seaLevel)
 * - Validaciones (rango válido: -500m a 9000m)
 * - Getters (meters, feet, kilometers, miles)
 * - Comparaciones (equals, isHigherThan, isLowerThan, max, min)
 * - Cálculos (differenceTo, add, subtract)
 * - Conversiones (toNumber, toObject, toJSON, toString, format)
 * - Propiedades booleanas (isSeaLevel, isBelowSeaLevel, isAboveSeaLevel)
 * - Inmutabilidad
 * - Edge cases
 * 
 * @module tests/unit/domain/value-objects/Elevation.test
 * =============================================================================
 */

import { Elevation, ElevationUnit } from '../../../../src/domain/value-objects/Elevation';

describe('Elevation Value Object', () => {
  
  // ===========================================================================
  // FACTORY METHODS
  // ===========================================================================
  
  describe('Factory Methods', () => {
    describe('fromMeters()', () => {
      it('should create elevation from meters', () => {
        const elevation = Elevation.fromMeters(508);

        expect(elevation.meters).toBe(508);
      });

      it('should accept negative values (below sea level)', () => {
        const elevation = Elevation.fromMeters(-100);

        expect(elevation.meters).toBe(-100);
        expect(elevation.isBelowSeaLevel).toBe(true);
      });

      it('should accept zero (sea level)', () => {
        const elevation = Elevation.fromMeters(0);

        expect(elevation.meters).toBe(0);
        expect(elevation.isSeaLevel).toBe(true);
      });

      it('should reject values below minimum (-500m)', () => {
        expect(() => Elevation.fromMeters(-501))
          .toThrow('Elevation too low');
        
        expect(() => Elevation.fromMeters(-1000))
          .toThrow('Elevation too low');
      });

      it('should reject values above maximum (9000m)', () => {
        expect(() => Elevation.fromMeters(9001))
          .toThrow('Elevation too high');
        
        expect(() => Elevation.fromMeters(10000))
          .toThrow('Elevation too high');
      });

      it('should accept boundary values', () => {
        const min = Elevation.fromMeters(-500);
        const max = Elevation.fromMeters(9000);

        expect(min.meters).toBe(-500);
        expect(max.meters).toBe(9000);
      });

      it('should reject invalid numbers', () => {
        expect(() => Elevation.fromMeters(NaN))
          .toThrow('Elevation must be a number');
        
        expect(() => Elevation.fromMeters(Infinity))
          .toThrow('Elevation must be finite');
        
        expect(() => Elevation.fromMeters(-Infinity))
          .toThrow('Elevation must be finite');
      });

      it('should reject non-number types', () => {
        expect(() => Elevation.fromMeters('508' as any))
          .toThrow('Elevation must be a number');
        
        expect(() => Elevation.fromMeters(null as any))
          .toThrow('Elevation must be a number');
        
        expect(() => Elevation.fromMeters(undefined as any))
          .toThrow('Elevation must be a number');
      });
    });

    describe('fromFeet()', () => {
      it('should create elevation from feet', () => {
        const elevation = Elevation.fromFeet(1666.67);

        // 1666.67 feet ≈ 508 meters
        expect(elevation.meters).toBeCloseTo(508, 0);
      });

      it('should convert correctly', () => {
        const elevation = Elevation.fromFeet(3280.84);

        // 3280.84 feet = 1000 meters
        expect(elevation.meters).toBeCloseTo(1000, 0);
      });

      it('should work with negative values', () => {
        const elevation = Elevation.fromFeet(-328.084);

        // -328.084 feet ≈ -100 meters
        expect(elevation.meters).toBeCloseTo(-100, 0);
      });
    });

    describe('fromKilometers()', () => {
      it('should create elevation from kilometers', () => {
        const elevation = Elevation.fromKilometers(1);

        expect(elevation.meters).toBe(1000);
        expect(elevation.kilometers).toBe(1);
      });

      it('should work with decimal values', () => {
        const elevation = Elevation.fromKilometers(0.508);

        expect(elevation.meters).toBeCloseTo(508, 0);
      });

      it('should work with negative values', () => {
        const elevation = Elevation.fromKilometers(-0.1);

        expect(elevation.meters).toBe(-100);
      });
    });

    describe('seaLevel()', () => {
      it('should create sea level elevation (0m)', () => {
        const elevation = Elevation.seaLevel();

        expect(elevation.meters).toBe(0);
        expect(elevation.isSeaLevel).toBe(true);
      });
    });
  });

  // ===========================================================================
  // GETTERS
  // ===========================================================================

  describe('Getters', () => {
    const elevation = Elevation.fromMeters(508);

    describe('meters', () => {
      it('should return elevation in meters', () => {
        expect(elevation.meters).toBe(508);
      });
    });

    describe('feet', () => {
      it('should convert to feet correctly', () => {
        // 508 meters ≈ 1666.67 feet
        expect(elevation.feet).toBeCloseTo(1666.67, 1);
      });
    });

    describe('kilometers', () => {
      it('should convert to kilometers correctly', () => {
        expect(elevation.kilometers).toBeCloseTo(0.508, 3);
      });
    });

    describe('miles', () => {
      it('should convert to miles correctly', () => {
        // 508 meters ≈ 0.3156 miles
        expect(elevation.miles).toBeCloseTo(0.3156, 3);
      });
    });

    describe('isSeaLevel', () => {
      it('should return true for elevation at sea level', () => {
        const seaLevel = Elevation.fromMeters(0);
        expect(seaLevel.isSeaLevel).toBe(true);
      });

      it('should return true within 10cm of sea level', () => {
        const almostSeaLevel = Elevation.fromMeters(0.05);
        expect(almostSeaLevel.isSeaLevel).toBe(true);
      });

      it('should return false for elevation above sea level', () => {
        const above = Elevation.fromMeters(10);
        expect(above.isSeaLevel).toBe(false);
      });

      it('should return false for elevation below sea level', () => {
        const below = Elevation.fromMeters(-10);
        expect(below.isSeaLevel).toBe(false);
      });
    });

    describe('isBelowSeaLevel', () => {
      it('should return true for negative elevation', () => {
        const below = Elevation.fromMeters(-100);
        expect(below.isBelowSeaLevel).toBe(true);
      });

      it('should return false for sea level', () => {
        const seaLevel = Elevation.fromMeters(0);
        expect(seaLevel.isBelowSeaLevel).toBe(false);
      });

      it('should return false for positive elevation', () => {
        const above = Elevation.fromMeters(100);
        expect(above.isBelowSeaLevel).toBe(false);
      });
    });

    describe('isAboveSeaLevel', () => {
      it('should return true for positive elevation', () => {
        const above = Elevation.fromMeters(100);
        expect(above.isAboveSeaLevel).toBe(true);
      });

      it('should return false for sea level', () => {
        const seaLevel = Elevation.fromMeters(0);
        expect(seaLevel.isAboveSeaLevel).toBe(false);
      });

      it('should return false for negative elevation', () => {
        const below = Elevation.fromMeters(-100);
        expect(below.isAboveSeaLevel).toBe(false);
      });
    });
  });

  // ===========================================================================
  // COMPARISONS
  // ===========================================================================

  describe('Comparisons', () => {
    describe('equals()', () => {
      it('should return true for identical elevations', () => {
        const elev1 = Elevation.fromMeters(508);
        const elev2 = Elevation.fromMeters(508);

        expect(elev1.equals(elev2)).toBe(true);
      });

      it('should return true for elevations within epsilon (1cm)', () => {
        const elev1 = Elevation.fromMeters(508.000);
        const elev2 = Elevation.fromMeters(508.005);

        expect(elev1.equals(elev2)).toBe(true);
      });

      it('should return false for different elevations', () => {
        const elev1 = Elevation.fromMeters(508);
        const elev2 = Elevation.fromMeters(509);

        expect(elev1.equals(elev2)).toBe(false);
      });

      it('should work with negative values', () => {
        const elev1 = Elevation.fromMeters(-100);
        const elev2 = Elevation.fromMeters(-100);

        expect(elev1.equals(elev2)).toBe(true);
      });
    });

    describe('isHigherThan()', () => {
      it('should return true when this elevation is higher', () => {
        const higher = Elevation.fromMeters(600);
        const lower = Elevation.fromMeters(500);

        expect(higher.isHigherThan(lower)).toBe(true);
      });

      it('should return false when elevations are equal', () => {
        const elev1 = Elevation.fromMeters(500);
        const elev2 = Elevation.fromMeters(500);

        expect(elev1.isHigherThan(elev2)).toBe(false);
      });

      it('should return false when this elevation is lower', () => {
        const lower = Elevation.fromMeters(400);
        const higher = Elevation.fromMeters(500);

        expect(lower.isHigherThan(higher)).toBe(false);
      });

      it('should work with negative values', () => {
        const higher = Elevation.fromMeters(-50);
        const lower = Elevation.fromMeters(-100);

        expect(higher.isHigherThan(lower)).toBe(true);
      });
    });

    describe('isLowerThan()', () => {
      it('should return true when this elevation is lower', () => {
        const lower = Elevation.fromMeters(400);
        const higher = Elevation.fromMeters(500);

        expect(lower.isLowerThan(higher)).toBe(true);
      });

      it('should return false when elevations are equal', () => {
        const elev1 = Elevation.fromMeters(500);
        const elev2 = Elevation.fromMeters(500);

        expect(elev1.isLowerThan(elev2)).toBe(false);
      });

      it('should return false when this elevation is higher', () => {
        const higher = Elevation.fromMeters(600);
        const lower = Elevation.fromMeters(500);

        expect(higher.isLowerThan(lower)).toBe(false);
      });
    });

    describe('max()', () => {
      it('should return the higher elevation', () => {
        const elev1 = Elevation.fromMeters(500);
        const elev2 = Elevation.fromMeters(600);

        const result = elev1.max(elev2);
        expect(result.meters).toBe(600);
      });

      it('should return this when equal', () => {
        const elev1 = Elevation.fromMeters(500);
        const elev2 = Elevation.fromMeters(500);

        const result = elev1.max(elev2);
        expect(result.meters).toBe(500);
        expect(result.equals(elev1)).toBe(true);
      });

      it('should work with negative values', () => {
        const elev1 = Elevation.fromMeters(-100);
        const elev2 = Elevation.fromMeters(-50);

        const result = elev1.max(elev2);
        expect(result.meters).toBe(-50);
      });
    });

    describe('min()', () => {
      it('should return the lower elevation', () => {
        const elev1 = Elevation.fromMeters(600);
        const elev2 = Elevation.fromMeters(500);

        const result = elev1.min(elev2);
        expect(result.meters).toBe(500);
      });

      it('should return this when equal', () => {
        const elev1 = Elevation.fromMeters(500);
        const elev2 = Elevation.fromMeters(500);

        const result = elev1.min(elev2);
        expect(result.meters).toBe(500);
        expect(result.equals(elev1)).toBe(true);
      });

      it('should work with negative values', () => {
        const elev1 = Elevation.fromMeters(-50);
        const elev2 = Elevation.fromMeters(-100);

        const result = elev1.min(elev2);
        expect(result.meters).toBe(-100);
      });
    });
  });

  // ===========================================================================
  // CALCULATIONS
  // ===========================================================================

  describe('Calculations', () => {
    describe('differenceTo()', () => {
      it('should calculate positive difference (this is higher)', () => {
        const higher = Elevation.fromMeters(545);
        const lower = Elevation.fromMeters(505);

        const diff = higher.differenceTo(lower);
        expect(diff).toBe(40);
      });

      it('should calculate negative difference (this is lower)', () => {
        const lower = Elevation.fromMeters(505);
        const higher = Elevation.fromMeters(545);

        const diff = lower.differenceTo(higher);
        expect(diff).toBe(-40);
      });

      it('should return zero for equal elevations', () => {
        const elev1 = Elevation.fromMeters(500);
        const elev2 = Elevation.fromMeters(500);

        const diff = elev1.differenceTo(elev2);
        expect(diff).toBe(0);
      });

      it('should work across sea level', () => {
        const above = Elevation.fromMeters(100);
        const below = Elevation.fromMeters(-50);

        const diff = above.differenceTo(below);
        expect(diff).toBe(150);
      });
    });

    describe('add()', () => {
      it('should add meters and return new Elevation', () => {
        const base = Elevation.fromMeters(500);
        const result = base.add(50);

        expect(result.meters).toBe(550);
        expect(base.meters).toBe(500); // Original unchanged (immutable)
      });

      it('should work with negative values (subtract)', () => {
        const base = Elevation.fromMeters(500);
        const result = base.add(-50);

        expect(result.meters).toBe(450);
      });

      it('should work across sea level', () => {
        const below = Elevation.fromMeters(-20);
        const result = below.add(50);

        expect(result.meters).toBe(30);
      });

      it('should throw if result exceeds maximum', () => {
        const high = Elevation.fromMeters(8999);
        
        expect(() => high.add(2)).toThrow('Elevation too high');
      });

      it('should throw if result below minimum', () => {
        const low = Elevation.fromMeters(-499);
        
        expect(() => low.add(-2)).toThrow('Elevation too low');
      });
    });

    describe('subtract()', () => {
      it('should subtract meters and return new Elevation', () => {
        const base = Elevation.fromMeters(500);
        const result = base.subtract(50);

        expect(result.meters).toBe(450);
        expect(base.meters).toBe(500); // Original unchanged
      });

      it('should work with negative values (add)', () => {
        const base = Elevation.fromMeters(500);
        const result = base.subtract(-50);

        expect(result.meters).toBe(550);
      });

      it('should work across sea level', () => {
        const above = Elevation.fromMeters(20);
        const result = above.subtract(50);

        expect(result.meters).toBe(-30);
      });
    });
  });

  // ===========================================================================
  // CONVERSIONS
  // ===========================================================================

  describe('Conversions', () => {
    const elevation = Elevation.fromMeters(508);

    describe('toNumber()', () => {
      it('should convert to number (meters)', () => {
        const num = elevation.toNumber();

        expect(num).toBe(508);
        expect(typeof num).toBe('number');
      });
    });

    describe('toObject()', () => {
      it('should convert to plain object', () => {
        const obj = elevation.toObject();

        expect(obj).toEqual({
          value: 508,
          unit: ElevationUnit.METERS
        });
      });

      it('should return new object each time', () => {
        const obj1 = elevation.toObject();
        const obj2 = elevation.toObject();

        expect(obj1).not.toBe(obj2); // Different references
        expect(obj1).toEqual(obj2);   // Same values
      });
    });

    describe('toJSON()', () => {
      it('should serialize to number (meters)', () => {
        const json = elevation.toJSON();

        expect(json).toBe(508);
      });

      it('should work with JSON.stringify', () => {
        const jsonString = JSON.stringify(elevation);
        const parsed = JSON.parse(jsonString);

        expect(parsed).toBe(508);
      });
    });

    describe('toString()', () => {
      it('should return readable string with meters and feet', () => {
        const str = elevation.toString();

        expect(str).toMatch(/Elevation\(508\.00m \/ \d+\.\d+ft\)/);
      });

      it('should work with negative elevations', () => {
        const below = Elevation.fromMeters(-100);
        const str = below.toString();

        expect(str).toContain('-100.00m');
      });
    });

    describe('format()', () => {
      it('should format in meters by default', () => {
        const str = elevation.format();

        expect(str).toBe('508.00 m');
      });

      it('should format in feet', () => {
        const str = elevation.format(ElevationUnit.FEET, 2);

        expect(str).toMatch(/\d+\.\d{2} ft/);
      });

      it('should format in kilometers', () => {
        const str = elevation.format(ElevationUnit.KILOMETERS, 3);

        expect(str).toBe('0.508 km');
      });

      it('should format in miles', () => {
        const str = elevation.format(ElevationUnit.MILES, 4);

        expect(str).toMatch(/\d+\.\d{4} mi/);
      });

      it('should respect decimal places parameter', () => {
        const str = elevation.format(ElevationUnit.METERS, 0);

        expect(str).toBe('508 m');
      });
    });
  });

  // ===========================================================================
  // IMMUTABILITY
  // ===========================================================================

  describe('Immutability', () => {
    it('should not allow modification of internal value', () => {
      const elevation = Elevation.fromMeters(508);

      // TypeScript prevents this at compile time with readonly
      // At runtime, we verify the getter returns consistent values
      const meters1 = elevation.meters;
      const meters2 = elevation.meters;
      
      expect(meters1).toBe(508);
      expect(meters2).toBe(508);
      expect(meters1).toBe(meters2);
    });

    it('should return same value on multiple accesses', () => {
      const elevation = Elevation.fromMeters(508);

      const meters1 = elevation.meters;
      const meters2 = elevation.meters;

      expect(meters1).toBe(meters2);
      expect(meters1).toBe(508);
    });

    it('add() should not modify original', () => {
      const original = Elevation.fromMeters(500);
      const modified = original.add(100);

      expect(original.meters).toBe(500);
      expect(modified.meters).toBe(600);
      expect(original).not.toBe(modified);
    });

    it('subtract() should not modify original', () => {
      const original = Elevation.fromMeters(500);
      const modified = original.subtract(100);

      expect(original.meters).toBe(500);
      expect(modified.meters).toBe(400);
      expect(original).not.toBe(modified);
    });
  });

  // ===========================================================================
  // EDGE CASES
  // ===========================================================================

  describe('Edge cases', () => {
    it('should handle minimum elevation (-500m)', () => {
      const min = Elevation.fromMeters(-500);

      expect(min.meters).toBe(-500);
      expect(min.isBelowSeaLevel).toBe(true);
    });

    it('should handle maximum elevation (9000m)', () => {
      const max = Elevation.fromMeters(9000);

      expect(max.meters).toBe(9000);
      expect(max.isAboveSeaLevel).toBe(true);
    });

    it('should handle very small positive values', () => {
      const tiny = Elevation.fromMeters(0.001);

      expect(tiny.meters).toBe(0.001);
      expect(tiny.isSeaLevel).toBe(true); // Within 10cm threshold
    });

    it('should handle very small negative values', () => {
      const tiny = Elevation.fromMeters(-0.001);

      expect(tiny.meters).toBe(-0.001);
      expect(tiny.isSeaLevel).toBe(true); // Within 10cm threshold
    });

    it('should handle typical Argentine elevations', () => {
      // Buenos Aires
      const buenosAires = Elevation.fromMeters(25);
      expect(buenosAires.isAboveSeaLevel).toBe(true);

      // Mendoza
      const mendoza = Elevation.fromMeters(750);
      expect(mendoza.meters).toBe(750);

      // Aconcagua base camp
      const aconcagua = Elevation.fromMeters(4200);
      expect(aconcagua.kilometers).toBeCloseTo(4.2, 1);
    });

    it('should handle conversions between units accurately', () => {
      const meters = Elevation.fromMeters(1000);
      const feet = Elevation.fromFeet(3280.84);
      const km = Elevation.fromKilometers(1);

      expect(meters.equals(feet)).toBe(true);
      expect(meters.equals(km)).toBe(true);
      expect(feet.equals(km)).toBe(true);
    });

    it('should handle many decimal places', () => {
      const precise = Elevation.fromMeters(508.123456789);

      expect(precise.meters).toBe(508.123456789);
    });

    it('should handle zero correctly', () => {
      const zero = Elevation.fromMeters(0);

      expect(zero.meters).toBe(0);
      expect(zero.feet).toBe(0);
      expect(zero.kilometers).toBe(0);
      expect(zero.miles).toBe(0);
      expect(zero.isSeaLevel).toBe(true);
      expect(zero.isBelowSeaLevel).toBe(false);
      expect(zero.isAboveSeaLevel).toBe(false);
    });
  });
});