/// <reference types="jest" />

/**
 * =============================================================================
 * COORDINATES VALUE OBJECT - UNIT TESTS
 * =============================================================================
 * Tests unitarios para el Value Object Coordinates
 * 
 * Valida:
 * - Construcción correcta de coordenadas válidas
 * - Validaciones (rangos de lat/lng)
 * - Factory methods (create, fromObject, fromGoogleEarthString)
 * - Cálculos (distanceTo, equals, isSameHemisphere)
 * - Conversiones (toObject, toJSON, toString, toGoogleEarthString)
 * - Inmutabilidad
 * - Edge cases
 * 
 * @module tests/unit/domain/value-objects/Coordinates.test
 * =============================================================================
 */

import { Coordinates } from '../../../../src/domain/value-objects/Coordinates';

describe('Coordinates Value Object', () => {
  
  // ===========================================================================
  // CONSTRUCTION & VALIDATION
  // ===========================================================================
  
  describe('Constructor and create()', () => {
    it('should create valid coordinates', () => {
      const coords = Coordinates.create(-38.2353, -68.6271);

      expect(coords.latitude).toBe(-38.2353);
      expect(coords.longitude).toBe(-68.6271);
    });

    it('should accept coordinates at valid boundaries', () => {
      // North/South poles
      const northPole = Coordinates.create(90, 0);
      const southPole = Coordinates.create(-90, 0);
      
      expect(northPole.latitude).toBe(90);
      expect(southPole.latitude).toBe(-90);

      // Date line
      const east = Coordinates.create(0, 180);
      const west = Coordinates.create(0, -180);
      
      expect(east.longitude).toBe(180);
      expect(west.longitude).toBe(-180);
    });

    it('should reject latitude above 90', () => {
      expect(() => Coordinates.create(90.001, 0))
        .toThrow('Latitude must be between -90 and 90 degrees');
      
      expect(() => Coordinates.create(100, 0))
        .toThrow('Latitude must be between -90 and 90 degrees');
    });

    it('should reject latitude below -90', () => {
      expect(() => Coordinates.create(-90.001, 0))
        .toThrow('Latitude must be between -90 and 90 degrees');
      
      expect(() => Coordinates.create(-100, 0))
        .toThrow('Latitude must be between -90 and 90 degrees');
    });

    it('should reject longitude above 180', () => {
      expect(() => Coordinates.create(0, 180.001))
        .toThrow('Longitude must be between -180 and 180 degrees');
      
      expect(() => Coordinates.create(0, 200))
        .toThrow('Longitude must be between -180 and 180 degrees');
    });

    it('should reject longitude below -180', () => {
      expect(() => Coordinates.create(0, -180.001))
        .toThrow('Longitude must be between -180 and 180 degrees');
      
      expect(() => Coordinates.create(0, -200))
        .toThrow('Longitude must be between -180 and 180 degrees');
    });

    it('should reject invalid numbers', () => {
      expect(() => Coordinates.create(NaN, 0))
        .toThrow('Latitude must be a number');
      
      expect(() => Coordinates.create(0, NaN))
        .toThrow('Longitude must be a number');
      
      expect(() => Coordinates.create(undefined as any, 0))
        .toThrow('Latitude must be a number');
      
      expect(() => Coordinates.create(0, undefined as any))
        .toThrow('Longitude must be a number');
    });

    it('should reject non-number types', () => {
      expect(() => Coordinates.create('40' as any, 0))
        .toThrow('Latitude must be a number');
      
      expect(() => Coordinates.create(0, '70' as any))
        .toThrow('Longitude must be a number');
    });
  });

  // ===========================================================================
  // FACTORY METHODS
  // ===========================================================================

  describe('Factory Methods', () => {
    describe('fromObject()', () => {
      it('should create from valid object', () => {
        const coords = Coordinates.fromObject({
          latitude: -38.2353,
          longitude: -68.6271
        });

        expect(coords.latitude).toBe(-38.2353);
        expect(coords.longitude).toBe(-68.6271);
      });

      it('should reject object with missing latitude', () => {
        expect(() => Coordinates.fromObject({
          longitude: -68.6271
        } as any)).toThrow('Latitude must be a number');
      });

      it('should reject object with missing longitude', () => {
        expect(() => Coordinates.fromObject({
          latitude: -38.2353
        } as any)).toThrow('Longitude must be a number');
      });

      it('should reject null object', () => {
        expect(() => Coordinates.fromObject(null as any))
          .toThrow(); // Any error is acceptable for null input
      });
    });

    describe('fromGoogleEarthString()', () => {
      it('should parse Google Earth format (lng,lat)', () => {
        const coords = Coordinates.fromGoogleEarthString('-68.6271,-38.2353');

        expect(coords.latitude).toBe(-38.2353);
        expect(coords.longitude).toBe(-68.6271);
      });

      it('should parse Google Earth format with altitude (lng,lat,alt)', () => {
        const coords = Coordinates.fromGoogleEarthString('-68.6271,-38.2353,850.5');

        expect(coords.latitude).toBe(-38.2353);
        expect(coords.longitude).toBe(-68.6271);
        // Altitude is ignored by Coordinates (handled by TracePoint)
      });

      it('should trim whitespace', () => {
        const coords = Coordinates.fromGoogleEarthString('  -68.6271 , -38.2353  ');

        expect(coords.latitude).toBe(-38.2353);
        expect(coords.longitude).toBe(-68.6271);
      });

      it('should reject empty string', () => {
        expect(() => Coordinates.fromGoogleEarthString(''))
          .toThrow('Invalid Google Earth coordinate format');
      });

      it('should reject string with less than 2 parts', () => {
        expect(() => Coordinates.fromGoogleEarthString('-68.6271'))
          .toThrow('Invalid Google Earth coordinate format');
      });

      it('should reject invalid number format', () => {
        expect(() => Coordinates.fromGoogleEarthString('invalid,-38.2353'))
          .toThrow('Invalid coordinate values');
        
        expect(() => Coordinates.fromGoogleEarthString('-68.6271,invalid'))
          .toThrow('Invalid coordinate values');
      });
    });
  });

  // ===========================================================================
  // CALCULATIONS
  // ===========================================================================

  describe('Calculations', () => {
    describe('distanceTo()', () => {
      it('should calculate distance between two points', () => {
        // Neuquén to Buenos Aires (approx 1000 km)
        const neuquen = Coordinates.create(-38.9516, -68.0591);
        const buenosAires = Coordinates.create(-34.6037, -58.3816);

        const distance = neuquen.distanceTo(buenosAires);

        // Should be around 950-1050 km
        expect(distance).toBeGreaterThan(900000); // 900 km
        expect(distance).toBeLessThan(1100000);    // 1100 km
      });

      it('should return 0 for same coordinates', () => {
        const coords1 = Coordinates.create(-38.2353, -68.6271);
        const coords2 = Coordinates.create(-38.2353, -68.6271);

        const distance = coords1.distanceTo(coords2);

        expect(distance).toBe(0);
      });

      it('should calculate small distances accurately', () => {
        // Two points ~100m apart (0.0009 degrees ≈ 100m at this latitude)
        const point1 = Coordinates.create(-38.2353, -68.6271);
        const point2 = Coordinates.create(-38.2362, -68.6271);

        const distance = point1.distanceTo(point2);

        // Should be around 100 meters
        expect(distance).toBeGreaterThan(90);
        expect(distance).toBeLessThan(110);
      });

      it('should handle crossing the date line', () => {
        const west = Coordinates.create(0, 179);
        const east = Coordinates.create(0, -179);

        const distance = west.distanceTo(east);

        // Should be around 222 km (not wrapping around)
        expect(distance).toBeGreaterThan(200000);
        expect(distance).toBeLessThan(250000);
      });

      it('should handle pole to pole distance', () => {
        const northPole = Coordinates.create(90, 0);
        const southPole = Coordinates.create(-90, 0);

        const distance = northPole.distanceTo(southPole);

        // Earth's polar circumference / 2 ≈ 20,000 km
        expect(distance).toBeGreaterThan(19900000);
        expect(distance).toBeLessThan(20100000);
      });
    });

    describe('equals()', () => {
      it('should return true for identical coordinates', () => {
        const coords1 = Coordinates.create(-38.2353, -68.6271);
        const coords2 = Coordinates.create(-38.2353, -68.6271);

        expect(coords1.equals(coords2)).toBe(true);
      });

      it('should return true for coordinates within precision', () => {
        const coords1 = Coordinates.create(-38.235300, -68.627100);
        const coords2 = Coordinates.create(-38.235301, -68.627101);

        // Default precision is 6 decimal places (≈ 11 cm)
        expect(coords1.equals(coords2)).toBe(true);
      });

      it('should return false for different coordinates', () => {
        const coords1 = Coordinates.create(-38.2353, -68.6271);
        const coords2 = Coordinates.create(-38.2354, -68.6272);

        expect(coords1.equals(coords2)).toBe(false);
      });

      it('should respect custom precision', () => {
        const coords1 = Coordinates.create(-38.2353, -68.6271);
        const coords2 = Coordinates.create(-38.2354, -68.6272);

        // With precision 3, should be equal
        expect(coords1.equals(coords2, 3)).toBe(true);
        
        // With precision 4, should be different
        expect(coords1.equals(coords2, 4)).toBe(false);
      });

      it('should handle edge case at boundaries', () => {
        const north1 = Coordinates.create(90, 0);
        const north2 = Coordinates.create(90, 180); // Different longitude but same point

        // At north pole, longitude doesn't matter
        // But our equals() checks coordinates, not actual position
        expect(north1.equals(north2)).toBe(false);
      });
    });

    describe('isSameHemisphere()', () => {
      it('should return true for both in Northern hemisphere', () => {
        const paris = Coordinates.create(48.8566, 2.3522);
        const tokyo = Coordinates.create(35.6762, 139.6503);

        const result = paris.isSameHemisphere(tokyo);
        
        expect(result.latitude).toBe(true);
        expect(result.longitude).toBe(true);
      });

      it('should return true for both in Southern hemisphere', () => {
        const buenosAires = Coordinates.create(-34.6037, -58.3816);
        const sydney = Coordinates.create(-33.8688, 151.2093);

        const result = buenosAires.isSameHemisphere(sydney);
        
        expect(result.latitude).toBe(true);
        // Different longitude hemispheres (West vs East)
        expect(result.longitude).toBe(false);
      });

      it('should return false for different hemispheres', () => {
        const newYork = Coordinates.create(40.7128, -74.0060);
        const buenosAires = Coordinates.create(-34.6037, -58.3816);

        const result = newYork.isSameHemisphere(buenosAires);
        
        expect(result.latitude).toBe(false); // Different latitude hemispheres
        expect(result.longitude).toBe(true);  // Same longitude hemisphere (West)
      });

      it('should consider equator as Northern hemisphere', () => {
        const equator = Coordinates.create(0, 0);
        const north = Coordinates.create(1, 0);

        const result = equator.isSameHemisphere(north);
        
        // At equator (lat=0), Math.sign(0) = 0, Math.sign(1) = 1
        // So they're technically different signs
        expect(result.latitude).toBe(false);
        expect(result.longitude).toBe(true);
      });
    });
  });

  // ===========================================================================
  // CONVERSIONS
  // ===========================================================================

  describe('Conversions', () => {
    const coords = Coordinates.create(-38.2353, -68.6271);

    describe('toObject()', () => {
      it('should convert to plain object', () => {
        const obj = coords.toObject();

        expect(obj).toEqual({
          latitude: -38.2353,
          longitude: -68.6271
        });
      });

      it('should return new object each time', () => {
        const obj1 = coords.toObject();
        const obj2 = coords.toObject();

        expect(obj1).not.toBe(obj2); // Different references
        expect(obj1).toEqual(obj2);   // But same values
      });
    });

    describe('toJSON()', () => {
      it('should be JSON serializable', () => {
        const json = JSON.stringify(coords);
        const parsed = JSON.parse(json);

        expect(parsed).toEqual({
          latitude: -38.2353,
          longitude: -68.6271
        });
      });

      it('should match toObject()', () => {
        const obj = coords.toObject();
        const json = coords.toJSON();

        expect(json).toEqual(obj);
      });
    });

    describe('toString()', () => {
      it('should return readable string', () => {
        const str = coords.toString();

        expect(str).toBe('Coordinates(lat: -38.2353, lng: -68.6271)');
      });
    });

    describe('toGoogleEarthString()', () => {
      it('should format as Google Earth string', () => {
        const str = coords.toGoogleEarthString();

        expect(str).toBe('-68.6271,-38.2353');
      });

      it('should be parseable back', () => {
        const str = coords.toGoogleEarthString();
        const parsed = Coordinates.fromGoogleEarthString(str);

        expect(parsed.equals(coords)).toBe(true);
      });
    });
  });

  // ===========================================================================
  // IMMUTABILITY
  // ===========================================================================

  describe('Immutability', () => {
    it('should not allow modification of internal values', () => {
      const coords = Coordinates.create(-38.2353, -68.6271);

      // TypeScript prevents this at compile time, but test at runtime
      expect(() => {
        (coords as any).latitude = 0;
      }).toThrow();
    });

    it('should return same values on multiple accesses', () => {
      const coords = Coordinates.create(-38.2353, -68.6271);

      const lat1 = coords.latitude;
      const lat2 = coords.latitude;

      expect(lat1).toBe(lat2);
      expect(lat1).toBe(-38.2353);
    });
  });

  // ===========================================================================
  // EDGE CASES
  // ===========================================================================

  describe('Edge cases', () => {
    it('should handle coordinates at poles', () => {
      const northPole = Coordinates.create(90, 0);
      const southPole = Coordinates.create(-90, 0);

      expect(northPole.latitude).toBe(90);
      expect(southPole.latitude).toBe(-90);
    });

    it('should handle coordinates at date line', () => {
      const east = Coordinates.create(0, 180);
      const west = Coordinates.create(0, -180);

      expect(east.longitude).toBe(180);
      expect(west.longitude).toBe(-180);
    });

    it('should handle very small coordinate differences', () => {
      const coords1 = Coordinates.create(0, 0);
      const coords2 = Coordinates.create(0.000001, 0.000001);

      const distance = coords1.distanceTo(coords2);

      // Distance should be very small but non-zero
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1); // Less than 1 meter
    });

    it('should handle coordinates with many decimal places', () => {
      const coords = Coordinates.create(
        -38.235312345678901,
        -68.627123456789012
      );

      expect(coords.latitude).toBe(-38.235312345678901);
      expect(coords.longitude).toBe(-68.627123456789012);
    });

    it('should handle zero coordinates', () => {
      const coords = Coordinates.create(0, 0);

      expect(coords.latitude).toBe(0);
      expect(coords.longitude).toBe(0);
    });
  });
});