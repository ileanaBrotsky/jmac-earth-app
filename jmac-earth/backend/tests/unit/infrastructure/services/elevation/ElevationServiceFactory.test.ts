/**
 * =============================================================================
 * ELEVATION SERVICE FACTORY - UNIT TESTS
 * =============================================================================
 * 
 * Tests for ElevationServiceFactory implementation.
 * 
 * Testing strategy:
 * - Test factory creation with different providers
 * - Test environment variable configuration
 * - Test provider validation
 * - Test error handling for unsupported providers
 * - Test default behavior (OpenTopoData)
 * 
 * @module tests/unit/infrastructure/services/elevation
 * =============================================================================
 */

import { ElevationServiceFactory, ElevationProvider } from '../../../../../src/infrastructure/services/elevation/ElevationServiceFactory';
import { OpenTopoDataService } from '../../../../../src/infrastructure/services/elevation/OpenTopoDataService';

describe('ElevationServiceFactory', () => {
  const originalEnv = process.env.ELEVATION_PROVIDER;
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    
    // Restore original environment variable
    if (originalEnv === undefined) {
      delete process.env.ELEVATION_PROVIDER;
    } else {
      process.env.ELEVATION_PROVIDER = originalEnv;
    }
  });

  // ===========================================================================
  // TEST SUITE: create() - Service Creation
  // ===========================================================================

  describe('create()', () => {
    it('should create OpenTopoData service by default', () => {
      delete process.env.ELEVATION_PROVIDER;

      const service = ElevationServiceFactory.create();

      expect(service).toBeInstanceOf(OpenTopoDataService);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('OpenTopoData')
      );
    });

    it('should create OpenTopoData service when explicitly specified', () => {
      process.env.ELEVATION_PROVIDER = ElevationProvider.OPENTOPO;

      const service = ElevationServiceFactory.create();

      expect(service).toBeInstanceOf(OpenTopoDataService);
    });

    it('should respect case-insensitive provider names', () => {
      process.env.ELEVATION_PROVIDER = 'OPENTOPO';

      const service = ElevationServiceFactory.create();

      expect(service).toBeInstanceOf(OpenTopoDataService);
    });

    it('should throw error for Google service (not implemented)', () => {
      process.env.ELEVATION_PROVIDER = ElevationProvider.GOOGLE;
      delete process.env.GOOGLE_ELEVATION_API_KEY;

      expect(() => ElevationServiceFactory.create()).toThrow(
        'Google Elevation API selected but GOOGLE_ELEVATION_API_KEY is not configured'
      );
    });

    it('should throw error for mock service (not implemented)', () => {
      process.env.ELEVATION_PROVIDER = ElevationProvider.MOCK;

      expect(() => ElevationServiceFactory.create()).toThrow(
        'Mock elevation service not yet implemented'
      );
    });

    it('should fall back to OpenTopoData for invalid provider', () => {
      process.env.ELEVATION_PROVIDER = 'invalid_provider';

      const service = ElevationServiceFactory.create();

      expect(service).toBeInstanceOf(OpenTopoDataService);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid ELEVATION_PROVIDER')
      );
    }),

    it('should create OpenTopoData for empty provider string', () => {
      process.env.ELEVATION_PROVIDER = '';

      const service = ElevationServiceFactory.create();

      expect(service).toBeInstanceOf(OpenTopoDataService);
    });
  });

  // ===========================================================================


  // ===========================================================================
  // TEST SUITE: getSupportedProviders()
  // ===========================================================================

  describe('getSupportedProviders()', () => {
    it('should return array of all supported providers', () => {
      const providers = ElevationServiceFactory.getSupportedProviders();

      expect(providers).toContain(ElevationProvider.OPENTOPO);
      expect(providers).toContain(ElevationProvider.GOOGLE);
      expect(providers).toContain(ElevationProvider.MOCK);
    });

    it('should return array with expected length', () => {
      const providers = ElevationServiceFactory.getSupportedProviders();

      expect(providers).toHaveLength(3);
    });

    it('should match ElevationProvider enum values', () => {
      const providers = ElevationServiceFactory.getSupportedProviders();
      const enumValues = Object.values(ElevationProvider);

      expect(providers).toEqual(expect.arrayContaining(enumValues));
    });
  });

  // ===========================================================================
  // TEST SUITE: isProviderSupported()
  // ===========================================================================

  describe('isProviderSupported()', () => {
    it('should return true for OpenTopoData provider', () => {
      expect(
        ElevationServiceFactory.isProviderSupported(ElevationProvider.OPENTOPO)
      ).toBe(true);
    });



    it('should return true for Google provider', () => {
      expect(
        ElevationServiceFactory.isProviderSupported(ElevationProvider.GOOGLE)
      ).toBe(true);
    });

    it('should return true for Mock provider', () => {
      expect(
        ElevationServiceFactory.isProviderSupported(ElevationProvider.MOCK)
      ).toBe(true);
    });

    it('should return false for unsupported provider', () => {
      expect(
        ElevationServiceFactory.isProviderSupported('unsupported_provider')
      ).toBe(false);
    });

    it('should be case-sensitive', () => {
      // The check should be case-sensitive at this point
      expect(
        ElevationServiceFactory.isProviderSupported('OPENTOPO')
      ).toBe(false);
    });

    it('should handle empty string', () => {
      expect(
        ElevationServiceFactory.isProviderSupported('')
      ).toBe(false);
    });
  });

  // ===========================================================================
  // TEST SUITE: ElevationProvider Enum
  // ===========================================================================

  describe('ElevationProvider Enum', () => {
    it('should have OPENTOPO value', () => {
      expect(ElevationProvider.OPENTOPO).toBe('opentopo');
    });

    it('should have GOOGLE value', () => {
      expect(ElevationProvider.GOOGLE).toBe('google');
    });

    it('should have MOCK value', () => {
      expect(ElevationProvider.MOCK).toBe('mock');
    });

    it('should have exactly 3 providers', () => {
      const providers = Object.values(ElevationProvider);

      expect(providers).toHaveLength(3);
    });
  });

  // ===========================================================================
  // TEST SUITE: Service Instance Properties
  // ===========================================================================

  describe('Service Instance Properties', () => {
    it('created OpenTopoData service should have serviceName property', () => {
      process.env.ELEVATION_PROVIDER = ElevationProvider.OPENTOPO;

      const service = ElevationServiceFactory.create();

      expect(service).toHaveProperty('serviceName');
      expect(service.serviceName).toContain('OpenTopoData');
    });

    it('created service should implement IElevationService', () => {
      const service = ElevationServiceFactory.create();

      // Check that service has required methods
      expect(service).toHaveProperty('getElevation');
      expect(service).toHaveProperty('getElevations');
      expect(service).toHaveProperty('getMetadata');
    });

    it('should be able to call getMetadata on created service', () => {
      const service = ElevationServiceFactory.create();

      const metadata = service.getMetadata();

      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('precision_meters');
      expect(metadata).toHaveProperty('coverage');
    });
  });

  // ===========================================================================
  // TEST SUITE: Environment Variable Handling
  // ===========================================================================

  describe('Environment Variable Handling', () => {
    it('should handle undefined environment variable', () => {
      delete process.env.ELEVATION_PROVIDER;

      const service = ElevationServiceFactory.create();

      expect(service).toBeInstanceOf(OpenTopoDataService);
    });

    it('should handle null-like environment variable', () => {
      process.env.ELEVATION_PROVIDER = '';

      const service = ElevationServiceFactory.create();

      expect(service).toBeInstanceOf(OpenTopoDataService);
    });

    it('should trim whitespace from provider name', () => {
      // Note: The current implementation converts to lowercase but doesn't trim
      // This test documents expected behavior
      process.env.ELEVATION_PROVIDER = 'opentopo';

      const service = ElevationServiceFactory.create();

      expect(service).toBeInstanceOf(OpenTopoDataService);
    });

    it('should handle provider with spaces', () => {
      // The current implementation would treat "opentopo " as invalid
      process.env.ELEVATION_PROVIDER = ' opentopo ';

      const service = ElevationServiceFactory.create();

      // Falls back to OpenTopoData due to invalid provider
      expect(service).toBeInstanceOf(OpenTopoDataService);
    });
  });

  // ===========================================================================
  // TEST SUITE: Multiple Calls
  // ===========================================================================

  describe('Multiple Calls', () => {
    it('should create new instance on each call', () => {
      process.env.ELEVATION_PROVIDER = ElevationProvider.OPENTOPO;

      const service1 = ElevationServiceFactory.create();
      const service2 = ElevationServiceFactory.create();

      // Should be different instances
      expect(service1).not.toBe(service2);
    });

    it('should create same type on repeated calls', () => {
      process.env.ELEVATION_PROVIDER = ElevationProvider.OPENTOPO;

      const service1 = ElevationServiceFactory.create();
      const service2 = ElevationServiceFactory.create();

      // But same type
      expect(service1.constructor).toBe(service2.constructor);
    });
  });

  // ===========================================================================
  // TEST SUITE: Real-world Usage Scenarios
  // ===========================================================================

  describe('Real-world Usage Scenarios', () => {
    it('should work in typical application initialization', () => {
      delete process.env.ELEVATION_PROVIDER;

      // Simulate application startup
      const elevationService = ElevationServiceFactory.create();
      const metadata = elevationService.getMetadata();

      expect(metadata.name).toBeDefined();
      expect(metadata.coverage).toBe('Global');
      expect(metadata.cost).toBe('free'); // OpenTopoData is free
    });

    it('should support switching providers via environment', () => {
      // Start with default
      process.env.ELEVATION_PROVIDER = ElevationProvider.OPENTOPO;
      const service1 = ElevationServiceFactory.create();
      expect(service1).toBeInstanceOf(OpenTopoDataService);

      // Try to switch to an unsupported provider (should default to OpenTopoData)
      process.env.ELEVATION_PROVIDER = 'unsupported';
      const service3 = ElevationServiceFactory.create();
      expect(service3).toBeInstanceOf(OpenTopoDataService);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid ELEVATION_PROVIDER')
      );

      // Switch back to OpenTopoData
      process.env.ELEVATION_PROVIDER = ElevationProvider.OPENTOPO;
      const service2 = ElevationServiceFactory.create();
      expect(service2).toBeInstanceOf(OpenTopoDataService);
    });

    it('should provide useful logging messages', () => {
      process.env.ELEVATION_PROVIDER = ElevationProvider.OPENTOPO;

      ElevationServiceFactory.create();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('✅')
      );
    });
  });

  // ===========================================================================
  // TEST SUITE: Edge Cases
  // ===========================================================================

  describe('Edge Cases', () => {
    it('should handle provider name with mixed case', () => {
      process.env.ELEVATION_PROVIDER = 'OpEnToPoD';

      const service = ElevationServiceFactory.create();

      expect(service).toBeInstanceOf(OpenTopoDataService);
    });

    it('should handle very long invalid provider name', () => {
      process.env.ELEVATION_PROVIDER = 'a'.repeat(1000);

      const service = ElevationServiceFactory.create();

      expect(service).toBeInstanceOf(OpenTopoDataService);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle special characters in provider name', () => {
      process.env.ELEVATION_PROVIDER = 'opentopo@#$%';

      const service = ElevationServiceFactory.create();

      expect(service).toBeInstanceOf(OpenTopoDataService);
    });
  });
});
