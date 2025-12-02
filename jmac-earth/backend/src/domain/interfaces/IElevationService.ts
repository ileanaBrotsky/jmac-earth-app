/**
 * =============================================================================
 * ELEVATION SERVICE INTERFACE
 * =============================================================================
 * 
 * Contract for elevation data providers.
 * Any elevation service (OpenTopoData, Google Elevation API, etc.) 
 * must implement this interface.
 * 
 * This follows the Dependency Inversion Principle:
 * - High-level modules (Use Cases) depend on this abstraction
 * - Low-level modules (Infrastructure services) implement this abstraction
 * - Both don't depend on each other, they depend on this interface
 * 
 * Benefits:
 * - Easy to switch between elevation providers (just change factory config)
 * - Easy to test (use MockElevationService)
 * - Domain layer doesn't know about external APIs
 * 
 * @module domain/interfaces
 * =============================================================================
 */

/**
 * Coordinate input for elevation queries
 */
export interface CoordinateInput {
  latitude: number;   // Decimal degrees (-90 to 90)
  longitude: number;  // Decimal degrees (-180 to 180)
}

/**
 * Coordinate with elevation result
 */
export interface CoordinateWithElevation {
  latitude: number;   // Decimal degrees
  longitude: number;  // Decimal degrees
  elevation: number;  // Meters above sea level
}

/**
 * Metadata about the elevation service
 * Used for logging, debugging, and UI display
 */
export interface ElevationServiceMetadata {
  name: string;                    // Service name (e.g., "OpenTopoData")
  precision_meters: number;        // Vertical accuracy (e.g., ±10m)
  resolution_meters: number;       // Horizontal resolution (e.g., 30m)
  coverage: string;                // Geographic coverage (e.g., "Global")
  cost: 'free' | 'paid' | 'freemium';  // Cost model
  rateLimit?: {
    requestsPerSecond?: number;    // Max requests per second
    requestsPerDay?: number;       // Max requests per day
    locationsPerRequest?: number;  // Max locations per batch request
  };
}

/**
 * Main interface for elevation services
 * 
 * All elevation providers must implement this interface.
 */
export interface IElevationService {
  /**
   * Get elevations for multiple coordinates (batch operation)
   * 
   * This is the primary method. Most efficient for multiple points.
   * Implementations should handle batching and rate limiting internally.
   * 
   * @param coordinates - Array of lat/lng coordinates
   * @returns Promise with array of coordinates with elevations
   * @throws Error if API fails or coordinates are invalid
   * 
   * @example
   * ```typescript
   * const coords = [
   *   { latitude: -38.2353, longitude: -68.6271 },
   *   { latitude: -38.2400, longitude: -68.6300 }
   * ];
   * const results = await service.getElevations(coords);
   * // results[0].elevation = 508 (meters)
   * ```
   */
  getElevations(
    coordinates: CoordinateInput[]
  ): Promise<CoordinateWithElevation[]>;

  /**
   * Get elevation for a single coordinate
   * 
   * Convenience method for single point queries.
   * Internally calls getElevations() with single coordinate.
   * 
   * @param latitude - Latitude in decimal degrees
   * @param longitude - Longitude in decimal degrees
   * @returns Promise with elevation in meters
   * @throws Error if API fails or coordinates are invalid
   * 
   * @example
   * ```typescript
   * const elevation = await service.getElevation(-38.2353, -68.6271);
   * // elevation = 508 (meters)
   * ```
   */
  getElevation(
    latitude: number,
    longitude: number
  ): Promise<number>;

  /**
   * Service name (for logging and debugging)
   * 
   * This is a readonly property that identifies the service.
   * 
   * @example "OpenTopoData (Copernicus)", "Google Elevation API"
   */
  readonly serviceName: string;

  /**
   * Get service metadata
   * 
   * Returns information about the service's capabilities,
   * limitations, and characteristics.
   * 
   * Used for:
   * - Logging which service is being used
   * - Displaying precision info to users
   * - Understanding rate limits
   * 
   * @returns Service metadata object
   */
  getMetadata(): ElevationServiceMetadata;
}

/**
 * =============================================================================
 * USAGE EXAMPLE
 * =============================================================================
 * 
 * // In a Use Case (Application Layer):
 * export class ProcessKMZUseCase {
 *   constructor(
 *     private readonly elevationService: IElevationService  // ← Depends on interface
 *   ) {}
 * 
 *   async execute(kmzFile: File): Promise<TraceData> {
 *     // ... parse KMZ ...
 *     
 *     // Get elevations (doesn't care which implementation)
 *     const coordsWithElevations = await this.elevationService.getElevations(coords);
 *     
 *     // Log which service was used
 *     console.log(`Used: ${this.elevationService.serviceName}`);
 *     
 *     // ... continue processing ...
 *   }
 * }
 * 
 * // In Infrastructure (Factory creates the implementation):
 * const elevationService = ElevationServiceFactory.create();  // Returns IElevationService
 * const useCase = new ProcessKMZUseCase(elevationService);    // Inject dependency
 * 
 * =============================================================================
 */