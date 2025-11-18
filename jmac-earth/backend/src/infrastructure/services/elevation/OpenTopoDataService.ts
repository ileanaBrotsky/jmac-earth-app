/**
 * =============================================================================
 * OPENTOPO DATA ELEVATION SERVICE
 * =============================================================================
 * 
 * Implementation of IElevationService using OpenTopoData API.
 * 
 * API Details:
 * - Endpoint: https://api.opentopodata.org/v1/aster30m
 * - Dataset: Copernicus DEM (30m resolution)
 * - Precision: ±10 meters vertical accuracy
 * - Coverage: Global
 * - Cost: FREE (no API key needed)
 * 
 * Rate Limits:
 * - 1 request per second
 * - 1000 requests per day
 * - 100 locations per request
 * 
 * @module infrastructure/services/elevation
 * =============================================================================
 */

import {
  IElevationService,
  CoordinateInput,
  CoordinateWithElevation,
  ElevationServiceMetadata
} from '../../../domain/interfaces/IElevationService';

/**
 * OpenTopoData API response structure
 */
interface OpenTopoDataResponse {
  results: Array<{
    elevation: number;
    location: {
      lat: number;
      lng: number;
    };
  }>;
  status: string;
}

/**
 * OpenTopoData Elevation Service Implementation
 * 
 * Uses Copernicus DEM dataset via OpenTopoData public API.
 */
export class OpenTopoDataService implements IElevationService {
  /**
   * API endpoint
   */
  private readonly apiUrl = 'https://api.opentopodata.org/v1/aster30m';

  /**
   * Maximum locations per request (API limit)
   */
  private readonly batchSize = 100;

  /**
   * Minimum time between requests (rate limiting)
   */
  private readonly minRequestInterval = 1000; // 1 second

  /**
   * Timestamp of last request (for rate limiting)
   */
  private lastRequestTime = 0;

  /**
   * Service name for identification
   */
  readonly serviceName = 'OpenTopoData (Copernicus DEM)';

  // ===========================================================================
  // PUBLIC API (implements IElevationService)
  // ===========================================================================

  /**
   * Get elevation for a single coordinate
   * 
   * @param latitude - Latitude in decimal degrees
   * @param longitude - Longitude in decimal degrees
   * @returns Promise with elevation in meters
   */
  async getElevation(latitude: number, longitude: number): Promise<number> {
    const results = await this.getElevations([{ latitude, longitude }]);
    return results[0]!.elevation;
  }

  /**
   * Get elevations for multiple coordinates (batch operation)
   * 
   * @param coordinates - Array of coordinates
   * @returns Promise with array of coordinates with elevations
   */
  async getElevations(
    coordinates: CoordinateInput[]
  ): Promise<CoordinateWithElevation[]> {
    if (coordinates.length === 0) {
      return [];
    }

    const results: CoordinateWithElevation[] = [];

    // Process in batches of 100 (API limit)
    for (let i = 0; i < coordinates.length; i += this.batchSize) {
      const batch = coordinates.slice(i, i + this.batchSize);

      // Rate limiting: wait if necessary
      await this.respectRateLimit();

      // Fetch elevations for this batch
      const batchResults = await this.fetchBatch(batch);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get service metadata
   * 
   * @returns Service metadata object
   */
  getMetadata(): ElevationServiceMetadata {
    return {
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
    };
  }

  // ===========================================================================
  // PRIVATE METHODS - API Communication
  // ===========================================================================

  /**
   * Fetch elevations for a batch of coordinates
   * 
   * @param coordinates - Batch of coordinates (max 100)
   * @returns Array of coordinates with elevations
   */
  private async fetchBatch(
    coordinates: CoordinateInput[]
  ): Promise<CoordinateWithElevation[]> {
    try {
      // Build locations parameter: "lat1,lng1|lat2,lng2|..."
      const locations = coordinates
        .map(coord => `${coord.latitude},${coord.longitude}`)
        .join('|');

      const url = `${this.apiUrl}?locations=${encodeURIComponent(locations)}`;

      // Make HTTP request
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `OpenTopoData API error: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as OpenTopoDataResponse;

      // Check API status
      if (data.status !== 'OK') {
        throw new Error(`OpenTopoData API returned status: ${data.status}`);
      }

      // Map results
      return data.results.map(result => ({
        latitude: result.location.lat,
        longitude: result.location.lng,
        elevation: result.elevation
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to fetch elevations from OpenTopoData: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Ensure we don't exceed rate limit (1 request per second)
   * 
   * Waits if necessary before allowing next request.
   */
  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await this.sleep(waitTime);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Sleep for specified milliseconds
   * 
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * =============================================================================
 * USAGE EXAMPLES
 * =============================================================================
 * 
 * // Create service instance
 * const elevationService = new OpenTopoDataService();
 * 
 * // Get single elevation
 * const elevation = await elevationService.getElevation(-38.2353, -68.6271);
 * console.log(`Elevation: ${elevation}m`);
 * 
 * // Get multiple elevations (batch)
 * const coords = [
 *   { latitude: -38.2353, longitude: -68.6271 },
 *   { latitude: -38.2400, longitude: -68.6300 },
 *   { latitude: -38.2450, longitude: -68.6350 }
 * ];
 * 
 * const results = await elevationService.getElevations(coords);
 * results.forEach(result => {
 *   console.log(`${result.latitude}, ${result.longitude}: ${result.elevation}m`);
 * });
 * 
 * // Get service metadata
 * const metadata = elevationService.getMetadata();
 * console.log(`Service: ${metadata.name}`);
 * console.log(`Precision: ±${metadata.precision_meters}m`);
 * console.log(`Resolution: ${metadata.resolution_meters}m`);
 * console.log(`Rate limit: ${metadata.rateLimit?.requestsPerDay} requests/day`);
 * 
 * // Large batch (automatic batching + rate limiting)
 * const manyCoords = Array.from({ length: 250 }, (_, i) => ({
 *   latitude: -38.23 + i * 0.001,
 *   longitude: -68.62 + i * 0.001
 * }));
 * 
 * // This will make 3 API calls (100, 100, 50) with 1 second between each
 * const manyResults = await elevationService.getElevations(manyCoords);
 * console.log(`Got ${manyResults.length} elevations`);
 * 
 * =============================================================================
 */

/**
 * =============================================================================
 * ERROR HANDLING
 * =============================================================================
 * 
 * The service handles the following errors:
 * 
 * 1. Network errors:
 *    - Connection timeout
 *    - DNS resolution failure
 *    - Network unavailable
 *    → Throws: "Failed to fetch elevations from OpenTopoData: [details]"
 * 
 * 2. API errors:
 *    - 4xx errors (bad request, rate limit exceeded)
 *    - 5xx errors (server error)
 *    → Throws: "OpenTopoData API error: [status code]"
 * 
 * 3. Invalid response:
 *    - Malformed JSON
 *    - Missing required fields
 *    - Status !== "OK"
 *    → Throws: "OpenTopoData API returned status: [status]"
 * 
 * Usage with error handling:
 * ```typescript
 * try {
 *   const elevations = await service.getElevations(coords);
 * } catch (error) {
 *   console.error('Elevation API failed:', error.message);
 *   // Fallback strategy or user notification
 * }
 * ```
 * 
 * =============================================================================
 */

/**
 * =============================================================================
 * RATE LIMITING STRATEGY
 * =============================================================================
 * 
 * The service implements automatic rate limiting:
 * 
 * 1. Tracks timestamp of last request
 * 2. Before each request, checks if 1 second has passed
 * 3. If not, waits the remaining time
 * 4. Updates timestamp after each request
 * 
 * This ensures:
 * - Never exceed 1 request/second
 * - Automatic throttling for large batches
 * - No need for manual delays in application code
 * 
 * Example timeline for 250 coordinates:
 * - Batch 1 (100 coords): t=0s
 * - Wait 1 second
 * - Batch 2 (100 coords): t=1s
 * - Wait 1 second
 * - Batch 3 (50 coords): t=2s
 * 
 * Total time: ~2 seconds for 250 points
 * 
 * =============================================================================
 */