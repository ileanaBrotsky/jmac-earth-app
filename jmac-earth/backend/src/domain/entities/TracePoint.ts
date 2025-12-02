/**
 * =============================================================================
 * TRACEPOINT ENTITY
 * =============================================================================
 * 
 * Represents a single point along the water distribution trace.
 * 
 * Entity characteristics:
 * - Has identity: Each point has a unique position in the trace
 * - Has lifecycle: Created when trace is parsed
 * - Uses Value Objects: Coordinates and Elevation
 * - Domain logic: Distance calculations, point ordering
 * 
 * Why an Entity?
 * - Each point has identity (position in sequence)
 * - Points have relationships (previous/next point in trace)
 * - Points are part of a larger aggregate (Trace)
 * 
 * @module domain/entities
 * =============================================================================
 */

import { Coordinates } from '../value-objects/Coordinates';
import { Elevation } from '../value-objects/Elevation';

/**
 * Properties for creating a TracePoint
 */
export interface TracePointProps {
  index: number;                        // Position in trace (0-based)
  coordinates: Coordinates;             // Geographic location
  elevation: Elevation;                 // Altitude at this point
  distanceFromStart_m: number;          // Accumulated distance from start (meters)
  segmentDistance_m?: number;           // Distance to previous point (optional)
}

/**
 * Properties for creating a new TracePoint (without calculated fields)
 */
export interface CreateTracePointProps {
  index: number;
  coordinates: Coordinates;
  elevation: Elevation;
  distanceFromStart_m: number;
}

/**
 * TracePoint Entity
 * 
 * Represents a point along the trace with geographic and elevation data.
 * Used for hydraulic calculations at regular intervals.
 */
export class TracePoint {
  private readonly _index: number;
  private readonly _coordinates: Coordinates;
  private readonly _elevation: Elevation;
  private readonly _distanceFromStart_m: number;
  private _segmentDistance_m?: number;

  /**
   * Private constructor to enforce factory pattern
   */
  private constructor(props: TracePointProps) {
    this.validateIndex(props.index);
    this.validateDistanceFromStart(props.distanceFromStart_m);
    
    if (props.segmentDistance_m !== undefined) {
      this.validateSegmentDistance(props.segmentDistance_m);
    }

    this._index = props.index;
    this._coordinates = props.coordinates;
    this._elevation = props.elevation;
    this._distanceFromStart_m = props.distanceFromStart_m;
    this._segmentDistance_m = props.segmentDistance_m;
  }

  // ===========================================================================
  // FACTORY METHODS
  // ===========================================================================

  /**
   * Create a TracePoint
   * 
   * @param props - TracePoint properties
   * @returns New TracePoint instance
   * 
   * @example
   * ```typescript
   * const point = TracePoint.create({
   *   index: 0,
   *   coordinates: Coordinates.create(-38.2353, -68.6271),
   *   elevation: Elevation.fromMeters(545),
   *   distanceFromStart_m: 0
   * });
   * ```
   */
  static create(props: CreateTracePointProps): TracePoint {
    return new TracePoint({
      ...props,
      segmentDistance_m: undefined
    });
  }

  /**
   * Create TracePoint with segment distance
   * 
   * Used when we know the distance from the previous point.
   * 
   * @param props - Complete TracePoint properties
   * @returns New TracePoint instance
   */
  static createWithSegment(props: TracePointProps): TracePoint {
    return new TracePoint(props);
  }

  /**
   * Create the starting point of a trace
   * 
   * Convenience method for the first point (index=0, distance=0).
   * 
   * @param coordinates - Starting coordinates
   * @param elevation - Starting elevation
   * @returns New TracePoint at start position
   * 
   * @example
   * ```typescript
   * const start = TracePoint.createStart(
   *   Coordinates.create(-38.2353, -68.6271),
   *   Elevation.fromMeters(545)
   * );
   * 
   * console.log(start.isStart);  // true
   * console.log(start.distanceFromStart_m);  // 0
   * ```
   */
  static createStart(coordinates: Coordinates, elevation: Elevation): TracePoint {
    return TracePoint.create({
      index: 0,
      coordinates,
      elevation,
      distanceFromStart_m: 0
    });
  }

  // ===========================================================================
  // GETTERS (Read-only access)
  // ===========================================================================

  /**
   * Get point index (position in trace)
   * 
   * 0 = first point, 1 = second point, etc.
   */
  get index(): number {
    return this._index;
  }

  /**
   * Get geographic coordinates
   */
  get coordinates(): Coordinates {
    return this._coordinates;
  }

  /**
   * Get latitude (convenience accessor)
   */
  get latitude(): number {
    return this._coordinates.latitude;
  }

  /**
   * Get longitude (convenience accessor)
   */
  get longitude(): number {
    return this._coordinates.longitude;
  }

  /**
   * Get elevation
   */
  get elevation(): Elevation {
    return this._elevation;
  }

  /**
   * Get elevation in meters (convenience accessor)
   */
  get elevationMeters(): number {
    return this._elevation.meters;
  }

  /**
   * Get accumulated distance from start of trace
   */
  get distanceFromStart_m(): number {
    return this._distanceFromStart_m;
  }

  /**
   * Get distance from previous point (segment length)
   * 
   * Returns undefined if not calculated or if this is the first point.
   */
  get segmentDistance_m(): number | undefined {
    return this._segmentDistance_m;
  }

  /**
   * Check if this is the starting point of the trace
   */
  get isStart(): boolean {
    return this._index === 0;
  }

  // ===========================================================================
  // DOMAIN BEHAVIOR
  // ===========================================================================

  /**
   * Calculate distance to another TracePoint
   * 
   * Uses Haversine formula via Coordinates value object.
   * 
   * @param other - Target TracePoint
   * @returns Distance in meters
   * 
   * @example
   * ```typescript
   * const point1 = TracePoint.create({...});
   * const point2 = TracePoint.create({...});
   * const distance = point1.distanceTo(point2);
   * console.log(`Distance: ${distance}m`);
   * ```
   */
  distanceTo(other: TracePoint): number {
    return this._coordinates.distanceTo(other._coordinates);
  }

  /**
   * Calculate elevation difference to another TracePoint
   * 
   * Positive = this point is higher
   * Negative = this point is lower
   * 
   * @param other - Target TracePoint
   * @returns Elevation difference in meters
   * 
   * @example
   * ```typescript
   * const elevDiff = point1.elevationDifferenceTo(point2);
   * console.log(elevDiff > 0 ? 'Going uphill' : 'Going downhill');
   * ```
   */
  elevationDifferenceTo(other: TracePoint): number {
    return this._elevation.differenceTo(other._elevation);
  }

  /**
   * Check if this point comes before another in the trace
   * 
   * @param other - TracePoint to compare
   * @returns True if this point comes first
   */
  isBefore(other: TracePoint): boolean {
    return this._index < other._index;
  }

  /**
   * Check if this point comes after another in the trace
   * 
   * @param other - TracePoint to compare
   * @returns True if this point comes later
   */
  isAfter(other: TracePoint): boolean {
    return this._index > other._index;
  }

  /**
   * Check if this point is at the same position as another
   * 
   * Compares index, coordinates, and elevation.
   * 
   * @param other - TracePoint to compare
   * @returns True if points are equivalent
   */
  equals(other: TracePoint): boolean {
    return (
      this._index === other._index &&
      this._coordinates.equals(other._coordinates) &&
      this._elevation.equals(other._elevation)
    );
  }

  /**
   * Set segment distance (mutable operation)
   * 
   * This is one of the few mutable operations allowed.
   * Used after point creation to set distance from previous point.
   * 
   * @param distance_m - Distance in meters
   */
  setSegmentDistance(distance_m: number): void {
    this.validateSegmentDistance(distance_m);
    this._segmentDistance_m = distance_m;
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Convert to plain object (for JSON serialization)
   * 
   * @returns Plain object with all properties
   * 
   * @example
   * ```typescript
   * const point = TracePoint.create({...});
   * const obj = point.toObject();
   * // {
   * //   index: 0,
   * //   latitude: -38.2353,
   * //   longitude: -68.6271,
   * //   elevation_m: 545,
   * //   distanceFromStart_m: 0
   * // }
   * ```
   */
  toObject(): {
    index: number;
    latitude: number;
    longitude: number;
    elevation_m: number;
    distanceFromStart_m: number;
    segmentDistance_m?: number;
  } {
    return {
      index: this._index,
      latitude: this.latitude,
      longitude: this.longitude,
      elevation_m: this.elevationMeters,
      distanceFromStart_m: this._distanceFromStart_m,
      segmentDistance_m: this._segmentDistance_m
    };
  }

  /**
   * JSON serialization (automatically called by JSON.stringify)
   */
  toJSON() {
    return this.toObject();
  }

  /**
   * String representation for debugging
   * 
   * @returns Human-readable string
   */
  toString(): string {
    return `TracePoint #${this._index} ` +
      `(${this.latitude.toFixed(6)}, ${this.longitude.toFixed(6)}) ` +
      `elevation: ${this.elevationMeters.toFixed(2)}m, ` +
      `distance: ${this._distanceFromStart_m.toFixed(2)}m`;
  }

  // ===========================================================================
  // VALIDATION (Private)
  // ===========================================================================

  /**
   * Validate index is non-negative
   */
  private validateIndex(index: number): void {
    if (typeof index !== 'number' || isNaN(index)) {
      throw new Error(`TracePoint index must be a number, got: ${index}`);
    }

    if (!Number.isInteger(index)) {
      throw new Error(`TracePoint index must be an integer, got: ${index}`);
    }

    if (index < 0) {
      throw new Error(`TracePoint index must be non-negative, got: ${index}`);
    }
  }

  /**
   * Validate distance from start is non-negative
   */
  private validateDistanceFromStart(distance: number): void {
    if (typeof distance !== 'number' || isNaN(distance)) {
      throw new Error(`Distance from start must be a number, got: ${distance}`);
    }

    if (distance < 0) {
      throw new Error(`Distance from start must be non-negative, got: ${distance}`);
    }
  }

  /**
   * Validate segment distance is non-negative
   */
  private validateSegmentDistance(distance: number): void {
    if (typeof distance !== 'number' || isNaN(distance)) {
      throw new Error(`Segment distance must be a number, got: ${distance}`);
    }

    if (distance < 0) {
      throw new Error(`Segment distance must be non-negative, got: ${distance}`);
    }
  }
}

/**
 * =============================================================================
 * USAGE EXAMPLES
 * =============================================================================
 * 
 * // Creating the starting point
 * const start = TracePoint.createStart(
 *   Coordinates.create(-38.2353, -68.6271),
 *   Elevation.fromMeters(545)
 * );
 * 
 * // Creating subsequent points
 * const point1 = TracePoint.create({
 *   index: 1,
 *   coordinates: Coordinates.create(-38.2400, -68.6300),
 *   elevation: Elevation.fromMeters(535),
 *   distanceFromStart_m: 588.5
 * });
 * 
 * // Setting segment distance
 * point1.setSegmentDistance(588.5);
 * 
 * // Accessing properties
 * console.log(start.isStart);                  // true
 * console.log(point1.latitude);                // -38.2400
 * console.log(point1.elevationMeters);         // 535
 * console.log(point1.distanceFromStart_m);     // 588.5
 * 
 * // Calculations
 * const distance = start.distanceTo(point1);
 * console.log(`Distance: ${distance.toFixed(2)}m`);
 * 
 * const elevDiff = start.elevationDifferenceTo(point1);
 * console.log(`Elevation change: ${elevDiff}m`);  // 10m (downhill)
 * 
 * // Comparisons
 * console.log(start.isBefore(point1));         // true
 * console.log(point1.isAfter(start));          // true
 * 
 * // Serialization
 * const json = JSON.stringify(start);
 * console.log(json);
 * 
 * =============================================================================
 */