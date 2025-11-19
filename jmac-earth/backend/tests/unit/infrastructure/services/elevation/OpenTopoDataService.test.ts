/**
 * =============================================================================
 * OPENTOPO DATA SERVICE - UNIT TESTS
 * =============================================================================
 * 
 * Tests for OpenTopoDataService implementation.
 * 
 * Testing strategy:
 * - Mock fetch API to avoid real API calls
 * - Test batching logic (100 coords per request)
 * - Test rate limiting (1 second between requests)
 * - Test error handling
 * - Test metadata
 * 
 * @module tests/unit/infrastructure/services/elevation
 * =============================================================================
 */

import { OpenTopoDataService } from '../../../../../src/infrastructure/services/elevation/OpenTopoDataService';
import { CoordinateInput } from '../../../../../src/domain/interfaces/IElevationService';

// Mock global fetch
global.fetch = jest.fn();

describe('OpenTopoDataService', () => {
  let service: OpenTopoDataService;

  beforeEach(() => {
    service = new OpenTopoDataService();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ===========================================================================
  // HELPER FUNCTIONS - Mock API Responses
  // ===========================================================================

  /**
   * Create a successful OpenTopoData API response
   */
  function createSuccessResponse(coordinates: CoordinateInput[], baseElevation = 500) {
    return {
      results: coordinates.map((coord, index) => ({
        elevation: baseElevation + index * 10, // Varying elevations
        location: {
          lat: coord.latitude,
          lng: coord.longitude
        }
      })),
      status: 'OK'
    };
  }

  /**
   * Mock fetch to return successful response
   */
  function mockFetchSuccess(coordinates: CoordinateInput[], baseElevation = 500) {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      url: '',
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      text: jest.fn(),
      json: async () => createSuccessResponse(coordinates, baseElevation)
    } as Response);
  }

  /**
   * Mock fetch to return error response
   */
  function mockFetchError(status: number, statusText: string) {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status,
      statusText,
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      url: '',
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      text: jest.fn(),
      json: jest.fn()
    } as Response);
  }

  /**
   * Mock fetch to return invalid JSON
   */
  function mockFetchInvalidJson() {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      url: '',
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      text: jest.fn(),
      json: async () => {
        throw new Error('Invalid JSON');
      }
    } as Response);
  }

  /**
   * Mock fetch to throw network error
   */
  function mockFetchNetworkError() {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error('Network error')
    );
  }

  // ===========================================================================
  // TEST SUITE: getElevation() - Single coordinate
  // ===========================================================================

  describe('getElevation()', () => {
    it('should get elevation for single coordinate', async () => {
      const coord = { latitude: -38.2353, longitude: -68.6271 };
      mockFetchSuccess([coord], 545);

      const elevation = await service.getElevation(coord.latitude, coord.longitude);

      expect(elevation).toBe(545);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should construct correct API URL', async () => {
      const coord = { latitude: -38.2353, longitude: -68.6271 };
      mockFetchSuccess([coord]);

      await service.getElevation(coord.latitude, coord.longitude);

      const fetchCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      expect(fetchCall![0]).toContain('https://api.opentopodata.org/v1/aster30m');
      expect(fetchCall![0]).toContain('-38.2353%2C-68.6271'); // Comma is URL-encoded as %2C
    });
  });

  // ===========================================================================
  // TEST SUITE: getElevations() - Batch operations
  // ===========================================================================

  describe('getElevations()', () => {
    it('should return empty array for empty input', async () => {
      const result = await service.getElevations([]);

      expect(result).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should get elevations for multiple coordinates', async () => {
      const coords: CoordinateInput[] = [
        { latitude: -38.2353, longitude: -68.6271 },
        { latitude: -38.2400, longitude: -68.6300 },
        { latitude: -38.2450, longitude: -68.6350 }
      ];
      mockFetchSuccess(coords, 500);

      const results = await service.getElevations(coords);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({
        latitude: -38.2353,
        longitude: -68.6271,
        elevation: 500
      });
      expect(results[1]?.elevation).toBe(510);
      expect(results[2]?.elevation).toBe(520);
    });

    it('should batch requests (100 coords per request)', async () => {
      // Create 250 coordinates
      const coords: CoordinateInput[] = Array.from({ length: 250 }, (_, i) => ({
        latitude: -38.23 + i * 0.001,
        longitude: -68.62 + i * 0.001
      }));

      // Mock 3 API calls (100, 100, 50)
      mockFetchSuccess(coords.slice(0, 100));
      mockFetchSuccess(coords.slice(100, 200));
      mockFetchSuccess(coords.slice(200, 250));

      // Execute - this will trigger batching
      const promise = service.getElevations(coords);

      // Fast-forward time to handle rate limiting
      await jest.advanceTimersByTimeAsync(3000); // 3 seconds for 3 requests
      const results = await promise;

      expect(results).toHaveLength(250);
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle exactly 100 coordinates (single batch)', async () => {
      const coords: CoordinateInput[] = Array.from({ length: 100 }, (_, i) => ({
        latitude: -38.23 + i * 0.001,
        longitude: -68.62 + i * 0.001
      }));

      mockFetchSuccess(coords);

      const results = await service.getElevations(coords);

      expect(results).toHaveLength(100);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle 101 coordinates (two batches)', async () => {
      const coords: CoordinateInput[] = Array.from({ length: 101 }, (_, i) => ({
        latitude: -38.23 + i * 0.001,
        longitude: -68.62 + i * 0.001
      }));

      mockFetchSuccess(coords.slice(0, 100));
      mockFetchSuccess(coords.slice(100, 101));

      const promise = service.getElevations(coords);
      await jest.advanceTimersByTimeAsync(2000);
      const results = await promise;

      expect(results).toHaveLength(101);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should format locations parameter correctly', async () => {
      const coords: CoordinateInput[] = [
        { latitude: -38.2353, longitude: -68.6271 },
        { latitude: -38.2400, longitude: -68.6300 }
      ];
      mockFetchSuccess(coords);

      await service.getElevations(coords);

      const url = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0]![0] as string;
      // Commas are encoded as %2C, pipes as %7C
      expect(url).toContain('-38.2353%2C-68.6271%7C-38.24%2C-68.63');
    });
  });

  // ===========================================================================
  // TEST SUITE: Rate Limiting
  // ===========================================================================

  describe('Rate Limiting', () => {
    it('should wait 1 second between consecutive requests', async () => {
      const coords1: CoordinateInput[] = [{ latitude: -38.23, longitude: -68.62 }];
      const coords2: CoordinateInput[] = [{ latitude: -38.24, longitude: -68.63 }];

      mockFetchSuccess(coords1);
      mockFetchSuccess(coords2);

      // First request
      const promise1 = service.getElevations(coords1);
      await jest.advanceTimersByTimeAsync(0);
      await promise1;

      // Second request (should wait)
      const promise2 = service.getElevations(coords2);
      
      // Not called yet (waiting for rate limit)
      expect(fetch).toHaveBeenCalledTimes(1);

      // Fast-forward 1 second
      await jest.advanceTimersByTimeAsync(1000);
      await promise2;

      // Now second request should have been made
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should not wait if more than 1 second has passed', async () => {
      const coords: CoordinateInput[] = [{ latitude: -38.23, longitude: -68.62 }];

      mockFetchSuccess(coords);
      mockFetchSuccess(coords);

      // First request
      await service.getElevations(coords);

      // Wait 2 seconds
      await jest.advanceTimersByTimeAsync(2000);

      // Second request (should be immediate, no waiting)
      await service.getElevations(coords);

      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle rate limiting with large batch', async () => {
      const coords: CoordinateInput[] = Array.from({ length: 300 }, (_, i) => ({
        latitude: -38.23 + i * 0.001,
        longitude: -68.62 + i * 0.001
      }));

      // Mock 3 batches
      mockFetchSuccess(coords.slice(0, 100));
      mockFetchSuccess(coords.slice(100, 200));
      mockFetchSuccess(coords.slice(200, 300));

      const promise = service.getElevations(coords);

      // Advance time for all 3 requests (2 seconds of waiting)
      await jest.advanceTimersByTimeAsync(3000);
      await promise;

      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  // ===========================================================================
  // TEST SUITE: Error Handling
  // ===========================================================================

  describe('Error Handling', () => {
    it('should throw error on HTTP error status', async () => {
      mockFetchError(500, 'Internal Server Error');

      await expect(
        service.getElevation(-38.2353, -68.6271)
      ).rejects.toThrow('OpenTopoData API error: 500');
    });

    it('should throw error on 429 (rate limit exceeded)', async () => {
      mockFetchError(429, 'Too Many Requests');

      await expect(
        service.getElevation(-38.2353, -68.6271)
      ).rejects.toThrow('OpenTopoData API error: 429');
    });

    it('should throw error on network failure', async () => {
      mockFetchNetworkError();

      await expect(
        service.getElevation(-38.2353, -68.6271)
      ).rejects.toThrow('Failed to fetch elevations from OpenTopoData');
    });

    it('should throw error on invalid JSON response', async () => {
      mockFetchInvalidJson();

      await expect(
        service.getElevation(-38.2353, -68.6271)
      ).rejects.toThrow('Failed to fetch elevations from OpenTopoData');
    });

    it('should throw error when API status is not OK', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
        type: 'basic',
        url: '',
        clone: jest.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        text: jest.fn(),
        json: async () => ({
          results: [],
          status: 'ERROR'
        })
      } as Response);

      await expect(
        service.getElevation(-38.2353, -68.6271)
      ).rejects.toThrow('OpenTopoData API returned status: ERROR');
    });

    it('should throw error when batch fails', async () => {
      const coords: CoordinateInput[] = [
        { latitude: -38.23, longitude: -68.62 },
        { latitude: -38.24, longitude: -68.63 }
      ];

      // Mock failure on first batch
      mockFetchError(500, 'Server Error');

      await expect(
        service.getElevations(coords)
      ).rejects.toThrow('Failed to fetch elevations from OpenTopoData');
    });
  });

  // ===========================================================================
  // TEST SUITE: getMetadata()
  // ===========================================================================

  describe('getMetadata()', () => {
    it('should return correct service metadata', () => {
      const metadata = service.getMetadata();

      expect(metadata).toEqual({
        name: 'OpenTopoData - Copernicus DEM',
        precision_meters: 10,
        resolution_meters: 30,
        coverage: 'Global',
        cost: 'free',
        rateLimit: {
          requestsPerSecond: 1,
          requestsPerDay: 1000,
          locationsPerRequest: 100
        }
      });
    });

    it('should have correct service name', () => {
      expect(service.serviceName).toBe('OpenTopoData (Copernicus DEM)');
    });
  });

  // ===========================================================================
  // TEST SUITE: Real-world scenarios
  // ===========================================================================

  describe('Real-world Scenarios', () => {
    it('should handle JMAC project with 500 coordinates', async () => {
      // Typical JMAC project: ~500 points
      const coords: CoordinateInput[] = Array.from({ length: 500 }, (_, i) => ({
        latitude: -38.23 + i * 0.001,
        longitude: -68.62 + i * 0.001
      }));

      // Mock 5 batches (100 each)
      for (let i = 0; i < 5; i++) {
        mockFetchSuccess(coords.slice(i * 100, (i + 1) * 100), 500 + i * 50);
      }

      const promise = service.getElevations(coords);
      await jest.advanceTimersByTimeAsync(5000); // 5 seconds for 5 requests
      const results = await promise;

      expect(results).toHaveLength(500);
      expect(fetch).toHaveBeenCalledTimes(5);
      
      // Verify elevations are varying
      expect(results[0]?.elevation).toBe(500);
      expect(results[100]?.elevation).toBe(550);
      expect(results[400]?.elevation).toBe(700);
    });

    it('should handle coordinates from Argentina (JMAC region)', async () => {
      // Real JMAC coordinates
      const coords: CoordinateInput[] = [
        { latitude: -38.23302, longitude: -68.62974 },
        { latitude: -38.23531, longitude: -68.62711 },
        { latitude: -38.23570, longitude: -68.62585 }
      ];

      mockFetchSuccess(coords, 545);

      const results = await service.getElevations(coords);

      expect(results).toHaveLength(3);
      expect(results[0]?.latitude).toBe(-38.23302);
      expect(results[0]?.longitude).toBe(-68.62974);
      expect(results[0]?.elevation).toBeGreaterThan(0);
    });

    it('should handle single coordinate request efficiently', async () => {
      const coord = { latitude: -38.2353, longitude: -68.6271 };
      mockFetchSuccess([coord], 545);

      const elevation = await service.getElevation(coord.latitude, coord.longitude);

      expect(elevation).toBe(545);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // TEST SUITE: Edge Cases
  // ===========================================================================

  describe('Edge Cases', () => {
    it('should handle coordinates at sea level', async () => {
      const coords: CoordinateInput[] = [
        { latitude: 0, longitude: 0 } // Gulf of Guinea
      ];

      mockFetchSuccess(coords, 0);

      const results = await service.getElevations(coords);

      expect(results[0]?.elevation).toBe(0);
    });

    it('should handle negative elevations (below sea level)', async () => {
      const coords: CoordinateInput[] = [
        { latitude: 31.5, longitude: 35.5 } // Dead Sea area
      ];

      mockFetchSuccess(coords, -400);

      const results = await service.getElevations(coords);

      expect(results[0]?.elevation).toBe(-400);
    });

    it('should handle high elevations (mountains)', async () => {
      const coords: CoordinateInput[] = [
        { latitude: -32.6532, longitude: -70.0112 } // Near Aconcagua
      ];

      mockFetchSuccess(coords, 6959);

      const results = await service.getElevations(coords);

      expect(results[0]?.elevation).toBe(6959);
    });

    it('should handle coordinates at extreme latitudes', async () => {
      const coords: CoordinateInput[] = [
        { latitude: 89, longitude: 0 },  // Near North Pole
        { latitude: -89, longitude: 0 }  // Near South Pole
      ];

      mockFetchSuccess(coords, 0);

      const results = await service.getElevations(coords);

      expect(results).toHaveLength(2);
    });

    it('should handle coordinates at date line', async () => {
      const coords: CoordinateInput[] = [
        { latitude: 0, longitude: 180 },
        { latitude: 0, longitude: -180 }
      ];

      mockFetchSuccess(coords, 100);

      const results = await service.getElevations(coords);

      expect(results).toHaveLength(2);
    });
  });

  // ===========================================================================
  // TEST SUITE: API URL Construction
  // ===========================================================================

  describe('API URL Construction', () => {
    it('should construct correct URL with single coordinate', async () => {
      const coord = { latitude: -38.2353, longitude: -68.6271 };
      mockFetchSuccess([coord]);

      await service.getElevation(coord.latitude, coord.longitude);

      const url = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0]![0] as string;
      expect(url).toContain('https://api.opentopodata.org/v1/aster30m');
      expect(url).toContain('locations=');
      expect(url).toContain('-38.2353%2C-68.6271'); // Comma is URL-encoded as %2C
    });

    it('should URL-encode locations parameter', async () => {
      const coords: CoordinateInput[] = [
        { latitude: -38.2353, longitude: -68.6271 },
        { latitude: -38.2400, longitude: -68.6300 }
      ];
      mockFetchSuccess(coords);

      await service.getElevations(coords);

      const url = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0]![0] as string;
      
      // The pipe separator should be encoded as %7C
      expect(url).toContain('%7C');
    });

    it('should handle many coordinates in URL', async () => {
      const coords: CoordinateInput[] = Array.from({ length: 100 }, (_, i) => ({
        latitude: -38.23 + i * 0.001,
        longitude: -68.62 + i * 0.001
      }));

      mockFetchSuccess(coords);

      await service.getElevations(coords);

      const url = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0]![0] as string;
      
      // Should have 99 pipe separators (100 coords = 99 separators)
      const pipeCount = (url.match(/%7C/g) || []).length;
      expect(pipeCount).toBe(99);
    });
  });
});