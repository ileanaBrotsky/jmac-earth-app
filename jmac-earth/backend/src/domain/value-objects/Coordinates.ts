/**
 * =============================================================================
 * COORDINATES VALUE OBJECT
 * =============================================================================
 * 
 * Represents geographic coordinates (latitude and longitude).
 * 
 * Value Object characteristics:
 * - Immutable: Once created, cannot be changed
 * - Self-validating: Validates on creation
 * - No identity: Compared by value, not by reference
 * - Domain logic: Encapsulates coordinate-related rules
 * 
 * Why a Value Object?
 * - Coordinates are a concept in our domain (not just two numbers)
 * - They have validation rules (lat: -90 to 90, lng: -180 to 180)
 * - They have behavior (distance calculation, equality checks)
 * - They should be immutable (changing lat/lng creates a NEW coordinate)
 * 
 * @module domain/value-objects
 * =============================================================================
 */

/**
 * Properties for creating Coordinates
 */
export interface CoordinatesProps {
  latitude: number;   // Decimal degrees (-90 to 90)
  longitude: number;  // Decimal degrees (-180 to 180)
}

/**
 * Coordinates Value Object
 * 
 * Represents a point on Earth's surface using WGS84 coordinate system.
 */
export class Coordinates {
  private readonly _latitude: number;
  private readonly _longitude: number;

  /**
   * Private constructor to enforce validation
   * Use static factory methods to create instances
   */
  private constructor(props: CoordinatesProps) {
    // Validate on construction
    this.validateLatitude(props.latitude);
    this.validateLongitude(props.longitude);

    this._latitude = props.latitude;
    this._longitude = props.longitude;
  }

  // ===========================================================================
  // FACTORY METHODS
  // ===========================================================================

  /**
   * Create Coordinates from latitude and longitude
   * 
   * @param latitude - Latitude in decimal degrees (-90 to 90)
   * @param longitude - Longitude in decimal degrees (-180 to 180)
   * @returns New Coordinates instance
   * @throws Error if coordinates are invalid
   * 
   * @example
   * ```typescript
   * const coords = Coordinates.create(-38.2353, -68.6271);
   * console.log(coords.latitude);   // -38.2353
   * console.log(coords.longitude);  // -68.6271
   * ```
   */
  static create(latitude: number, longitude: number): Coordinates {
    return new Coordinates({ latitude, longitude });
  }

  /**
   * Create Coordinates from an object
   * 
   * @param props - Object with latitude and longitude
   * @returns New Coordinates instance
   * @throws Error if coordinates are invalid
   * 
   * @example
   * ```typescript
   * const coords = Coordinates.fromObject({
   *   latitude: -38.2353,
   *   longitude: -68.6271
   * });
   * ```
   */
  static fromObject(props: CoordinatesProps): Coordinates {
    return new Coordinates(props);
  }

  /**
   * Create Coordinates from Google Earth format string
   * 
   * Google Earth exports coordinates as: "longitude,latitude,altitude"
   * Example: "-68.6271,-38.2353,508"
   * 
   * @param coordinateString - Comma-separated string "lng,lat,alt"
   * @returns New Coordinates instance
   * @throws Error if string format is invalid
   * 
   * @example
   * ```typescript
   * const coords = Coordinates.fromGoogleEarthString("-68.6271,-38.2353,508");
   * console.log(coords.latitude);   // -38.2353
   * console.log(coords.longitude);  // -68.6271
   * ```
   */
  static fromGoogleEarthString(coordinateString: string): Coordinates {
    const parts = coordinateString.trim().split(',');
    
    if (parts.length < 2) {
      throw new Error(
        `Invalid Google Earth coordinate format: "${coordinateString}". Expected "lng,lat" or "lng,lat,alt"`
      );
    }

    const longitude = parseFloat(parts[0]!);
    const latitude = parseFloat(parts[1]!);

    if (isNaN(longitude) || isNaN(latitude)) {
      throw new Error(
        `Invalid coordinate values in: "${coordinateString}"`
      );
    }

    return new Coordinates({ latitude, longitude });
  }

  // ===========================================================================
  // GETTERS (Read-only access)
  // ===========================================================================

  /**
   * Get latitude in decimal degrees
   */
  get latitude(): number {
    return this._latitude;
  }

  /**
   * Get longitude in decimal degrees
   */
  get longitude(): number {
    return this._longitude;
  }

  /**
   * Get latitude in radians (useful for distance calculations)
   */
  get latitudeRadians(): number {
    return this.degreesToRadians(this._latitude);
  }

  /**
   * Get longitude in radians (useful for distance calculations)
   */
  get longitudeRadians(): number {
    return this.degreesToRadians(this._longitude);
  }

  // ===========================================================================
  // DOMAIN BEHAVIOR
  // ===========================================================================

  /**
   * Calculate distance to another coordinate using Haversine formula
   * 
   * Returns great-circle distance in meters.
   * Assumes Earth is a perfect sphere (good approximation for our use case).
   * 
   * @param other - Target coordinates
   * @returns Distance in meters
   * 
   * @example
   * ```typescript
   * const point1 = Coordinates.create(-38.2353, -68.6271);
   * const point2 = Coordinates.create(-38.2400, -68.6300);
   * const distance = point1.distanceTo(point2);
   * console.log(`Distance: ${distance}m`);  // ~588m
   * ```
   */
  distanceTo(other: Coordinates): number {
    const R = 6371000; // Earth's radius in meters

    const lat1 = this.latitudeRadians;
    const lat2 = other.latitudeRadians;
    const deltaLat = other.latitudeRadians - this.latitudeRadians;
    const deltaLng = other.longitudeRadians - this.longitudeRadians;

    // Haversine formula
    const a = 
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    const distance = R * c;

    return distance;
  }

  /**
   * Check if this coordinate equals another
   * 
   * Uses small epsilon for floating point comparison.
   * 
   * @param other - Other coordinates to compare
   * @returns True if coordinates are equal (within epsilon)
   * 
   * @example
   * ```typescript
   * const coords1 = Coordinates.create(-38.2353, -68.6271);
   * const coords2 = Coordinates.create(-38.2353, -68.6271);
   * console.log(coords1.equals(coords2));  // true
   * ```
   */
 equals(other: Coordinates, precision: number = 6): boolean {
  const epsilon = Math.pow(10, -precision);
  return (
    Math.abs(this._latitude - other._latitude) < epsilon &&
    Math.abs(this._longitude - other._longitude) < epsilon
  );
}

  /**
   * Check if coordinate is in the same hemisphere as another
   * 
   * @param other - Other coordinates
   * @returns Object indicating if same latitude/longitude hemisphere
   */
  isSameHemisphere(other: Coordinates): {
    latitude: boolean;   // true if both N or both S
    longitude: boolean;  // true if both E or both W
  } {
    return {
      latitude: Math.sign(this._latitude) === Math.sign(other._latitude),
      longitude: Math.sign(this._longitude) === Math.sign(other._longitude)
    };
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Convert to plain object (for JSON serialization)
   * 
   * @returns Plain object with latitude and longitude
   * 
   * @example
   * ```typescript
   * const coords = Coordinates.create(-38.2353, -68.6271);
   * const obj = coords.toObject();
   * // { latitude: -38.2353, longitude: -68.6271 }
   * 
   * const json = JSON.stringify(coords);
   * // '{"latitude":-38.2353,"longitude":-68.6271}'
   * ```
   */
  toObject(): CoordinatesProps {
    return {
      latitude: this._latitude,
      longitude: this._longitude
    };
  }

  /**
   * JSON serialization (automatically called by JSON.stringify)
   */
  toJSON(): CoordinatesProps {
    return this.toObject();
  }

  /**
   * String representation for debugging
   * 
   * @returns Human-readable string
   * 
   * @example
   * ```typescript
   * const coords = Coordinates.create(-38.2353, -68.6271);
   * console.log(coords.toString());
   * // "Coordinates(lat: -38.2353, lng: -68.6271)"
   * ```
   */
  toString(): string {
    return `Coordinates(lat: ${this._latitude}, lng: ${this._longitude})`;
  }

  /**
   * Format as Google Earth string "lng,lat"
   * 
   * @returns Comma-separated string in Google Earth format
   * 
   * @example
   * ```typescript
   * const coords = Coordinates.create(-38.2353, -68.6271);
   * console.log(coords.toGoogleEarthString());
   * // "-68.6271,-38.2353"
   * ```
   */
  toGoogleEarthString(): string {
    return `${this._longitude},${this._latitude}`;
  }

  // ===========================================================================
  // VALIDATION (Private)
  // ===========================================================================

  /**
   * Validate latitude is in valid range
   * 
   * @throws Error if latitude is invalid
   */
  private validateLatitude(latitude: number): void {
    if (typeof latitude !== 'number' || isNaN(latitude)) {
      throw new Error(`Latitude must be a number, got: ${latitude}`);
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error(
        `Latitude must be between -90 and 90 degrees, got: ${latitude}`
      );
    }
  }

  /**
   * Validate longitude is in valid range
   * 
   * @throws Error if longitude is invalid
   */
  private validateLongitude(longitude: number): void {
    if (typeof longitude !== 'number' || isNaN(longitude)) {
      throw new Error(`Longitude must be a number, got: ${longitude}`);
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error(
        `Longitude must be between -180 and 180 degrees, got: ${longitude}`
      );
    }
  }

  /**
   * Convert degrees to radians
   */
  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

/**
 * =============================================================================
 * USAGE EXAMPLES
 * =============================================================================
 * 
 * // Creating coordinates
 * const coords1 = Coordinates.create(-38.2353, -68.6271);
 * const coords2 = Coordinates.fromObject({ latitude: -38.24, longitude: -68.63 });
 * const coords3 = Coordinates.fromGoogleEarthString("-68.6271,-38.2353,508");
 * 
 * // Accessing values
 * console.log(coords1.latitude);   // -38.2353
 * console.log(coords1.longitude);  // -68.6271
 * 
 * // Calculating distance
 * const distance = coords1.distanceTo(coords2);
 * console.log(`Distance: ${distance.toFixed(2)}m`);
 * 
 * // Comparing coordinates
 * if (coords1.equals(coords2)) {
 *   console.log('Same location');
 * }
 * 
 * // Serialization
 * const json = JSON.stringify(coords1);
 * console.log(json);  // '{"latitude":-38.2353,"longitude":-68.6271}'
 * 
 * // Validation (throws error)
 * try {
 *   const invalid = Coordinates.create(100, -68);  // ❌ Latitude > 90
 * } catch (error) {
 *   console.error(error.message);
 * }
 * 
 * =============================================================================
 */