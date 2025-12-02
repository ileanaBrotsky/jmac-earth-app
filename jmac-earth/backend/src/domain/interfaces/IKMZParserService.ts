/**
 * =============================================================================
 * KMZ PARSER SERVICE INTERFACE
 * =============================================================================
 * 
 * Contract for KMZ parsing services.
 * Defines how to extract trace data from Google Earth KMZ files.
 * 
 * KMZ Format:
 * - KMZ is a zipped KML file
 * - KML is XML format (Keyhole Markup Language)
 * - Contains: coordinates, elevations, placemarks, paths
 * 
 * This interface abstracts the parsing logic, allowing:
 * - Different parsing implementations (jszip, xml2js, etc.)
 * - Easy testing with mock parsers
 * - Validation and error handling standardization
 * 
 * @module domain/interfaces
 * =============================================================================
 */

/**
 * Raw coordinate extracted from KMZ
 * May or may not have elevation data
 */
export interface RawCoordinate {
  latitude: number;     // Decimal degrees
  longitude: number;    // Decimal degrees
  altitude?: number;    // Meters (may be 0, null, or undefined if not in KMZ)
}

/**
 * Result of parsing a KMZ file
 * Contains all extracted trace data
 */
export interface KMZParseResult {
  /**
   * Array of coordinates from the trace
   * Ordered from start to end of the path
   */
  coordinates: RawCoordinate[];

  /**
   * Whether the KMZ file contained elevation data
   * 
   * If false, elevations need to be obtained from external API
   */
  hasElevations: boolean;

  /**
   * Total distance of the trace in meters
   * Calculated using Haversine formula between consecutive points
   */
  totalDistance: number;

  /**
   * Optional metadata from the KMZ file
   */
  metadata?: {
    name?: string;           // Placemark or path name
    description?: string;    // Description from Google Earth
    timestamp?: Date;        // When the KMZ was created
  };
}

/**
 * Validation result for KMZ files
 */
export interface KMZValidationResult {
  isValid: boolean;          // Whether the file is valid
  errors: string[];          // Array of error messages
  warnings: string[];        // Array of warning messages
}

/**
 * Main interface for KMZ parsing services
 * 
 * Implementations should handle:
 * - Unzipping KMZ files
 * - Parsing KML XML
 * - Extracting coordinates and elevations
 * - Calculating distances
 * - Validation and error handling
 */
export interface IKMZParserService {
  /**
   * Parse a KMZ file and extract trace data
   * 
   * This is the main method. It should:
   * 1. Validate the file is a valid KMZ
   * 2. Extract KML from the ZIP
   * 3. Parse XML to get coordinates
   * 4. Check if elevations are present
   * 5. Calculate total distance
   * 6. Return structured result
   * 
   * @param kmzFile - Buffer or File object containing KMZ data
   * @returns Promise with parsed trace data
   * @throws Error if file is invalid or parsing fails
   * 
   * @example
   * ```typescript
   * const result = await parser.parse(kmzBuffer);
   * 
   * console.log(`Points: ${result.coordinates.length}`);
   * console.log(`Has elevations: ${result.hasElevations}`);
   * console.log(`Distance: ${result.totalDistance}m`);
   * 
   * if (!result.hasElevations) {
   *   console.log('⚠️ Need to get elevations from API');
   * }
   * ```
   */
  parse(kmzFile: Buffer | File): Promise<KMZParseResult>;

  /**
   * Validate a KMZ file without parsing it completely
   * 
   * Useful for quick validation before full parsing.
   * Checks:
   * - File is a valid ZIP
   * - Contains .kml file
   * - KML has valid XML structure
   * - Has coordinate data
   * 
   * @param kmzFile - Buffer or File object to validate
   * @returns Promise with validation result
   * 
   * @example
   * ```typescript
   * const validation = await parser.validate(kmzBuffer);
   * 
   * if (!validation.isValid) {
   *   console.error('Invalid KMZ:', validation.errors);
   *   return;
   * }
   * 
   * if (validation.warnings.length > 0) {
   *   console.warn('Warnings:', validation.warnings);
   * }
   * 
   * // Proceed with parsing...
   * ```
   */
  validate(kmzFile: Buffer | File): Promise<KMZValidationResult>;

  /**
   * Extract only coordinates without full parsing
   * 
   * Lighter operation than full parse().
   * Returns just the coordinate array.
   * 
   * @param kmzFile - Buffer or File object
   * @returns Promise with array of coordinates
   * @throws Error if extraction fails
   */
  extractCoordinates(kmzFile: Buffer | File): Promise<RawCoordinate[]>;

  /**
   * Calculate distance between consecutive coordinates
   * 
   * Uses Haversine formula to calculate great-circle distance.
   * 
   * @param coordinates - Array of coordinates
   * @returns Total distance in meters
   * 
   * @example
   * ```typescript
   * const coords = [
   *   { latitude: -38.2353, longitude: -68.6271 },
   *   { latitude: -38.2400, longitude: -68.6300 }
   * ];
   * const distance = parser.calculateDistance(coords);
   * console.log(`Distance: ${distance}m`);
   * ```
   */
  calculateDistance(coordinates: RawCoordinate[]): number;
}

/**
 * =============================================================================
 * COMMON PARSING ERRORS
 * =============================================================================
 * 
 * Implementations should handle and throw meaningful errors for:
 * 
 * 1. INVALID_FILE_FORMAT
 *    - File is not a valid ZIP
 *    - ZIP doesn't contain .kml file
 *    - File is corrupted
 * 
 * 2. INVALID_KML_STRUCTURE
 *    - KML XML is malformed
 *    - Missing required elements (coordinates)
 *    - Invalid coordinate format
 * 
 * 3. NO_COORDINATES_FOUND
 *    - KML doesn't contain any coordinate data
 *    - Coordinates are empty or malformed
 * 
 * 4. MULTIPLE_PATHS
 *    - KMZ contains multiple paths/placemarks
 *    - Warning (not error): Use first path by default
 * 
 * 5. NO_ELEVATIONS
 *    - Warning (not error): All altitudes are 0 or missing
 *    - User should be notified to use elevation API
 * 
 * =============================================================================
 */

/**
 * =============================================================================
 * USAGE EXAMPLE
 * =============================================================================
 * 
 * // In a Use Case (Application Layer):
 * export class ProcessKMZUseCase {
 *   constructor(
 *     private readonly kmzParser: IKMZParserService,  // ← Depends on interface
 *     private readonly elevationService: IElevationService
 *   ) {}
 * 
 *   async execute(kmzFile: Buffer): Promise<TraceData> {
 *     // 1. Validate KMZ
 *     const validation = await this.kmzParser.validate(kmzFile);
 *     if (!validation.isValid) {
 *       throw new Error(`Invalid KMZ: ${validation.errors.join(', ')}`);
 *     }
 * 
 *     // 2. Parse KMZ
 *     const parseResult = await this.kmzParser.parse(kmzFile);
 *     
 *     console.log(`Parsed ${parseResult.coordinates.length} points`);
 *     console.log(`Distance: ${parseResult.totalDistance}m`);
 * 
 *     // 3. Get elevations if needed
 *     let finalCoordinates: CoordinateWithElevation[];
 *     
 *     if (parseResult.hasElevations) {
 *       console.log('✅ Using elevations from KMZ');
 *       finalCoordinates = parseResult.coordinates.map(coord => ({
 *         latitude: coord.latitude,
 *         longitude: coord.longitude,
 *         elevation: coord.altitude!
 *       }));
 *     } else {
 *       console.log('⚠️ Getting elevations from API');
 *       finalCoordinates = await this.elevationService.getElevations(
 *         parseResult.coordinates
 *       );
 *     }
 * 
 *     return {
 *       coordinates: finalCoordinates,
 *       distance: parseResult.totalDistance,
 *       elevationSource: parseResult.hasElevations ? 'kmz' : 'api'
 *     };
 *   }
 * }
 * 
 * =============================================================================
 */

/**
 * =============================================================================
 * IMPLEMENTATION NOTES
 * =============================================================================
 * 
 * When implementing this interface:
 * 
 * 1. Use 'jszip' library to unzip KMZ files
 * 2. Use 'xml2js' or 'fast-xml-parser' to parse KML
 * 3. Handle Google Earth's coordinate format: "lng,lat,alt" (comma-separated)
 * 4. Check altitude values: if all are 0, flag hasElevations = false
 * 5. Use Haversine formula for accurate distance calculation
 * 6. Preserve coordinate order (start to end of path)
 * 7. Handle edge cases:
 *    - Single point (distance = 0)
 *    - Multiple paths (use first, warn user)
 *    - Invalid coordinates (throw error)
 * 
 * =============================================================================
 */