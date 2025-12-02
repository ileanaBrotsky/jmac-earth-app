/**
 * =============================================================================
 * ELEVATION VALUE OBJECT
 * =============================================================================
 * 
 * Represents elevation (altitude) above or below sea level.
 * 
 * Value Object characteristics:
 * - Immutable: Once created, cannot be changed
 * - Self-validating: Validates on creation
 * - No identity: Compared by value, not by reference
 * - Domain logic: Encapsulates elevation-related rules
 * 
 * Why a Value Object?
 * - Elevation is a domain concept (not just a number)
 * - Has validation rules (reasonable ranges)
 * - Has behavior (conversions, comparisons)
 * - Should be immutable
 * 
 * @module domain/value-objects
 * =============================================================================
 */

/**
 * Unit of measurement for elevation
 */
export enum ElevationUnit {
  METERS = 'meters',
  FEET = 'feet',
  KILOMETERS = 'kilometers',
  MILES = 'miles'
}

/**
 * Elevation Value Object
 * 
 * Represents altitude above or below mean sea level.
 * 
 * Valid range:
 * - Minimum: -500m (below sea level, e.g., Dead Sea is -430m)
 * - Maximum: 9000m (above sea level, e.g., Everest is 8849m)
 * 
 * For JMAC's use case (water pumping in Argentina):
 * - Typical range: 0m to 3000m
 */
export class Elevation {
  private readonly _meters: number;

  /**
   * Reasonable min/max for validation
   * We allow some margin beyond typical values
   */
  private static readonly MIN_ELEVATION = -500;   // Dead Sea level
  private static readonly MAX_ELEVATION = 9000;   // Above Everest

  /**
   * Private constructor to enforce validation
   * Use static factory methods to create instances
   */
  private constructor(meters: number) {
    this.validate(meters);
    this._meters = meters;
  }

  // ===========================================================================
  // FACTORY METHODS
  // ===========================================================================

  /**
   * Create Elevation from meters
   * 
   * @param meters - Elevation in meters above sea level
   * @returns New Elevation instance
   * @throws Error if elevation is out of valid range
   * 
   * @example
   * ```typescript
   * const elevation = Elevation.fromMeters(508);
   * console.log(elevation.meters);  // 508
   * console.log(elevation.feet);    // 1666.67
   * ```
   */
  static fromMeters(meters: number): Elevation {
    return new Elevation(meters);
  }

  /**
   * Create Elevation from feet
   * 
   * @param feet - Elevation in feet above sea level
   * @returns New Elevation instance
   * 
   * @example
   * ```typescript
   * const elevation = Elevation.fromFeet(1666.67);
   * console.log(elevation.meters);  // 508
   * ```
   */
  static fromFeet(feet: number): Elevation {
    const meters = feet * 0.3048;
    return new Elevation(meters);
  }

  /**
   * Create Elevation from kilometers
   * 
   * @param kilometers - Elevation in kilometers
   * @returns New Elevation instance
   */
  static fromKilometers(kilometers: number): Elevation {
    const meters = kilometers * 1000;
    return new Elevation(meters);
  }

  /**
   * Create sea level elevation (0 meters)
   * 
   * @returns Elevation at sea level
   * 
   * @example
   * ```typescript
   * const seaLevel = Elevation.seaLevel();
   * console.log(seaLevel.meters);  // 0
   * ```
   */
  static seaLevel(): Elevation {
    return new Elevation(0);
  }

  // ===========================================================================
  // GETTERS (Read-only access)
  // ===========================================================================

  /**
   * Get elevation in meters (base unit)
   */
  get meters(): number {
    return this._meters;
  }

  /**
   * Get elevation in feet
   */
  get feet(): number {
    return this._meters * 3.28084;
  }

  /**
   * Get elevation in kilometers
   */
  get kilometers(): number {
    return this._meters / 1000;
  }

  /**
   * Get elevation in miles
   */
  get miles(): number {
    return this._meters * 0.000621371;
  }

  /**
   * Check if elevation is at sea level
   */
  get isSeaLevel(): boolean {
    return Math.abs(this._meters) < 0.1; // Within 10cm
  }

  /**
   * Check if elevation is below sea level
   */
  get isBelowSeaLevel(): boolean {
    return this._meters < -0.1;
  }

  /**
   * Check if elevation is above sea level
   */
  get isAboveSeaLevel(): boolean {
    return this._meters > 0.1;
  }

  // ===========================================================================
  // DOMAIN BEHAVIOR
  // ===========================================================================

  /**
   * Calculate elevation difference to another point
   * 
   * Positive result = this point is higher
   * Negative result = this point is lower
   * 
   * @param other - Other elevation to compare
   * @returns Difference in meters (this - other)
   * 
   * @example
   * ```typescript
   * const elevation1 = Elevation.fromMeters(545);
   * const elevation2 = Elevation.fromMeters(505);
   * const diff = elevation1.differenceTo(elevation2);
   * console.log(diff);  // 40 (elevation1 is 40m higher)
   * ```
   */
  differenceTo(other: Elevation): number {
    return this._meters - other._meters;
  }

  /**
   * Check if this elevation is higher than another
   * 
   * @param other - Other elevation to compare
   * @returns True if this elevation is higher
   */
  isHigherThan(other: Elevation): boolean {
    return this._meters > other._meters;
  }

  /**
   * Check if this elevation is lower than another
   * 
   * @param other - Other elevation to compare
   * @returns True if this elevation is lower
   */
  isLowerThan(other: Elevation): boolean {
    return this._meters < other._meters;
  }

  /**
   * Check if this elevation equals another
   * 
   * Uses small epsilon for floating point comparison.
   * 
   * @param other - Other elevation to compare
   * @returns True if elevations are equal (within epsilon)
   * 
   * @example
   * ```typescript
   * const elev1 = Elevation.fromMeters(508);
   * const elev2 = Elevation.fromMeters(508);
   * console.log(elev1.equals(elev2));  // true
   * ```
   */
  equals(other: Elevation): boolean {
    const epsilon = 0.01; // 1cm precision
    return Math.abs(this._meters - other._meters) < epsilon;
  }

  /**
   * Get the higher of two elevations
   * 
   * @param other - Other elevation to compare
   * @returns The higher elevation
   */
  max(other: Elevation): Elevation {
    return this._meters > other._meters ? this : other;
  }

  /**
   * Get the lower of two elevations
   * 
   * @param other - Other elevation to compare
   * @returns The lower elevation
   */
  min(other: Elevation): Elevation {
    return this._meters < other._meters ? this : other;
  }

  /**
   * Add meters to elevation (returns new Elevation)
   * 
   * @param meters - Meters to add (can be negative)
   * @returns New Elevation instance
   * 
   * @example
   * ```typescript
   * const base = Elevation.fromMeters(500);
   * const higher = base.add(50);
   * console.log(higher.meters);  // 550
   * console.log(base.meters);    // 500 (immutable)
   * ```
   */
  add(meters: number): Elevation {
    return new Elevation(this._meters + meters);
  }

  /**
   * Subtract meters from elevation (returns new Elevation)
   * 
   * @param meters - Meters to subtract (can be negative)
   * @returns New Elevation instance
   */
  subtract(meters: number): Elevation {
    return new Elevation(this._meters - meters);
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Convert to plain number (meters)
   * 
   * @returns Elevation in meters
   * 
   * @example
   * ```typescript
   * const elevation = Elevation.fromMeters(508);
   * const meters = elevation.toNumber();
   * console.log(meters);  // 508
   * ```
   */
  toNumber(): number {
    return this._meters;
  }

  /**
   * Convert to plain object (for JSON serialization)
   * 
   * @returns Object with value and unit
   */
  toObject(): { value: number; unit: ElevationUnit } {
    return {
      value: this._meters,
      unit: ElevationUnit.METERS
    };
  }

  /**
   * JSON serialization (automatically called by JSON.stringify)
   * 
   * Returns just the number in meters for simplicity
   */
  toJSON(): number {
    return this._meters;
  }

  /**
   * String representation for debugging
   * 
   * @returns Human-readable string
   * 
   * @example
   * ```typescript
   * const elevation = Elevation.fromMeters(508);
   * console.log(elevation.toString());
   * // "Elevation(508m / 1666.67ft)"
   * ```
   */
  toString(): string {
    return `Elevation(${this._meters.toFixed(2)}m / ${this.feet.toFixed(2)}ft)`;
  }

  /**
   * Format with specific unit
   * 
   * @param unit - Unit to display
   * @param decimals - Number of decimal places
   * @returns Formatted string
   * 
   * @example
   * ```typescript
   * const elevation = Elevation.fromMeters(508);
   * console.log(elevation.format(ElevationUnit.METERS, 2));
   * // "508.00 m"
   * ```
   */
  format(unit: ElevationUnit = ElevationUnit.METERS, decimals: number = 2): string {
    let value: number;
    let unitSymbol: string;

    switch (unit) {
      case ElevationUnit.METERS:
        value = this.meters;
        unitSymbol = 'm';
        break;
      case ElevationUnit.FEET:
        value = this.feet;
        unitSymbol = 'ft';
        break;
      case ElevationUnit.KILOMETERS:
        value = this.kilometers;
        unitSymbol = 'km';
        break;
      case ElevationUnit.MILES:
        value = this.miles;
        unitSymbol = 'mi';
        break;
    }

    return `${value.toFixed(decimals)} ${unitSymbol}`;
  }

  // ===========================================================================
  // VALIDATION (Private)
  // ===========================================================================

  /**
   * Validate elevation is in reasonable range
   * 
   * @throws Error if elevation is invalid
   */
  private validate(meters: number): void {
    if (typeof meters !== 'number' || isNaN(meters)) {
      throw new Error(`Elevation must be a number, got: ${meters}`);
    }

    if (!isFinite(meters)) {
      throw new Error(`Elevation must be finite, got: ${meters}`);
    }

    if (meters < Elevation.MIN_ELEVATION) {
      throw new Error(
        `Elevation too low: ${meters}m. Minimum: ${Elevation.MIN_ELEVATION}m (below sea level)`
      );
    }

    if (meters > Elevation.MAX_ELEVATION) {
      throw new Error(
        `Elevation too high: ${meters}m. Maximum: ${Elevation.MAX_ELEVATION}m (above Mt. Everest)`
      );
    }
  }
}

/**
 * =============================================================================
 * USAGE EXAMPLES
 * =============================================================================
 * 
 * // Creating elevations
 * const elevation1 = Elevation.fromMeters(508);
 * const elevation2 = Elevation.fromFeet(1666.67);
 * const seaLevel = Elevation.seaLevel();
 * 
 * // Accessing values
 * console.log(elevation1.meters);  // 508
 * console.log(elevation1.feet);    // 1666.67
 * 
 * // Comparisons
 * console.log(elevation1.isHigherThan(seaLevel));  // true
 * console.log(elevation1.equals(elevation2));      // true
 * 
 * // Calculations
 * const diff = elevation1.differenceTo(seaLevel);
 * console.log(`Difference: ${diff}m`);  // 508m
 * 
 * const higher = elevation1.add(100);
 * console.log(higher.meters);  // 608
 * 
 * // Formatting
 * console.log(elevation1.format(ElevationUnit.METERS, 2));
 * // "508.00 m"
 * 
 * // Serialization
 * const json = JSON.stringify(elevation1);
 * console.log(json);  // 508
 * 
 * // Validation (throws error)
 * try {
 *   const invalid = Elevation.fromMeters(10000);  // ❌ Too high
 * } catch (error) {
 *   console.error(error.message);
 * }
 * 
 * =============================================================================
 */