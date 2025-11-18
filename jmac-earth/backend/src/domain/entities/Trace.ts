/**
 * =============================================================================
 * TRACE ENTITY
 * =============================================================================
 * 
 * Represents a complete trace (path) composed of ordered TracePoints.
 * 
 * Entity characteristics:
 * - Has identity: Each trace is unique
 * - Aggregate root: Manages collection of TracePoints
 * - Domain logic: Distance calculations, elevation profiles, point generation
 * - Invariants: Points must be ordered, distances must be non-decreasing
 * 
 * Why an Entity?
 * - Has identity (represents a specific path)
 * - Manages lifecycle of TracePoints (aggregate)
 * - Has complex domain behavior (interpolation, analysis)
 * 
 * @module domain/entities
 * =============================================================================
 */

import { TracePoint } from './TracePoint';
import { Coordinates } from '../value-objects/Coordinates';
import { Elevation } from '../value-objects/Elevation';

/**
 * Properties for creating a Trace
 */
export interface TraceProps {
  points: TracePoint[];
}

/**
 * Elevation profile data
 */
export interface ElevationProfile {
  min: Elevation;
  max: Elevation;
  start: Elevation;
  end: Elevation;
  difference: number;  // end - start (negative = downhill)
}

/**
 * Trace Entity
 * 
 * Represents a complete trace with ordered points.
 * Acts as Aggregate Root for TracePoints.
 */
export class Trace {
  private readonly _points: TracePoint[];

  /**
   * Private constructor to enforce factory pattern
   */
  private constructor(props: TraceProps) {
    this.validatePoints(props.points);
    this._points = [...props.points]; // Defensive copy
  }

  // ===========================================================================
  // FACTORY METHODS
  // ===========================================================================

  /**
   * Create a Trace from an array of TracePoints
   * 
   * @param points - Ordered array of TracePoints
   * @returns New Trace instance
   * @throws Error if points array is invalid
   * 
   * @example
   * ```typescript
   * const points = [
   *   TracePoint.createStart(coords1, elev1),
   *   TracePoint.create({ index: 1, coords2, elev2, distanceFromStart_m: 100 }),
   *   TracePoint.create({ index: 2, coords3, elev3, distanceFromStart_m: 200 })
   * ];
   * 
   * const trace = Trace.create(points);
   * console.log(trace.totalDistance);  // 200
   * console.log(trace.pointCount);     // 3
   * ```
   */
  static create(points: TracePoint[]): Trace {
    return new Trace({ points });
  }

  /**
   * Create a Trace from raw coordinate and elevation data
   * 
   * Automatically calculates distances and creates TracePoints.
   * 
   * @param data - Array of coordinates and elevations
   * @returns New Trace instance
   * 
   * @example
   * ```typescript
   * const trace = Trace.fromCoordinatesAndElevations([
   *   { coordinates: Coordinates.create(-38.23, -68.62), elevation: Elevation.fromMeters(545) },
   *   { coordinates: Coordinates.create(-38.24, -68.63), elevation: Elevation.fromMeters(535) }
   * ]);
   * ```
   */
  static fromCoordinatesAndElevations(
    data: Array<{ coordinates: Coordinates; elevation: Elevation }>
  ): Trace {
    if (data.length === 0) {
      throw new Error('Cannot create trace from empty data');
    }

    const points: TracePoint[] = [];
    let accumulatedDistance = 0;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item) {
        throw new Error(`Invalid data at index ${i}`);
      }
      const { coordinates, elevation } = item;
      
      // Calculate segment distance (distance from previous point)
      let segmentDistance: number | undefined;
      if (i > 0) {
        const prevItem = data[i - 1];
        if (!prevItem) {
          throw new Error(`Invalid data at index ${i - 1}`);
        }
        const prevCoords = prevItem.coordinates;
        segmentDistance = prevCoords.distanceTo(coordinates);
        accumulatedDistance += segmentDistance;
      }

      // Create TracePoint
      const point = TracePoint.create({
        index: i,
        coordinates,
        elevation,
        distanceFromStart_m: accumulatedDistance
      });

      // Set segment distance if not the first point
      if (segmentDistance !== undefined) {
        point.setSegmentDistance(segmentDistance);
      }

      points.push(point);
    }

    return new Trace({ points });
  }

  // ===========================================================================
  // GETTERS (Read-only access)
  // ===========================================================================

  /**
   * Get all points in the trace
   * 
   * Returns a defensive copy to prevent external modification.
   */
  get points(): ReadonlyArray<TracePoint> {
    return this._points;
  }

  /**
   * Get number of points in the trace
   */
  get pointCount(): number {
    return this._points.length;
  }

  /**
   * Get the first point (start of trace)
   */
  get startPoint(): TracePoint {
    return this._points[0]!;
  }

  /**
   * Get the last point (end of trace)
   */
  get endPoint(): TracePoint {
    return this._points[this._points.length - 1]!;
  }

  /**
   * Get total distance of the trace in meters
   */
  get totalDistance(): number {
    if (this._points.length === 0) return 0;
    return this.endPoint.distanceFromStart_m;
  }

  /**
   * Get total distance in kilometers
   */
  get totalDistanceKm(): number {
    return this.totalDistance / 1000;
  }

  /**
   * Check if trace is empty
   */
  get isEmpty(): boolean {
    return this._points.length === 0;
  }

  // ===========================================================================
  // ELEVATION PROFILE
  // ===========================================================================

  /**
   * Get elevation profile data
   * 
   * Returns min, max, start, end elevations and total difference.
   * 
   * @returns Elevation profile object
   * 
   * @example
   * ```typescript
   * const profile = trace.elevationProfile;
   * console.log(`Min: ${profile.min.meters}m`);
   * console.log(`Max: ${profile.max.meters}m`);
   * console.log(`Start: ${profile.start.meters}m`);
   * console.log(`End: ${profile.end.meters}m`);
   * console.log(`Difference: ${profile.difference}m`);
   * ```
   */
  get elevationProfile(): ElevationProfile {
    if (this.isEmpty) {
      throw new Error('Cannot get elevation profile of empty trace');
    }

    const start = this.startPoint.elevation;
    const end = this.endPoint.elevation;

    // Find min and max
    let min = start;
    let max = start;

    for (const point of this._points) {
      const elevation = point.elevation;
      if (elevation.isLowerThan(min)) {
        min = elevation;
      }
      if (elevation.isHigherThan(max)) {
        max = elevation;
      }
    }

    return {
      min,
      max,
      start,
      end,
      difference: end.differenceTo(start)
    };
  }

  /**
   * Get minimum elevation in the trace
   */
  get minElevation(): Elevation {
    return this.elevationProfile.min;
  }

  /**
   * Get maximum elevation in the trace
   */
  get maxElevation(): Elevation {
    return this.elevationProfile.max;
  }

  /**
   * Get elevation difference from start to end
   * 
   * Positive = uphill, Negative = downhill
   */
  get elevationDifference(): number {
    return this.elevationProfile.difference;
  }

  // ===========================================================================
  // DOMAIN BEHAVIOR - Point Access
  // ===========================================================================

  /**
   * Get point at specific index
   * 
   * @param index - Point index
   * @returns TracePoint at that index
   * @throws Error if index is out of bounds
   */
  getPointAt(index: number): TracePoint {
    if (index < 0 || index >= this._points.length) {
      throw new Error(
        `Point index out of bounds: ${index}. Valid range: 0-${this._points.length - 1}`
      );
    }
    return this._points[index]!;
  }

  /**
   * Find point closest to a specific distance from start
   * 
   * @param distanceFromStart_m - Target distance in meters
   * @returns Closest TracePoint
   * 
   * @example
   * ```typescript
   * const pointAt500m = trace.getPointClosestToDistance(500);
   * console.log(pointAt500m.distanceFromStart_m);  // ~500m
   * ```
   */
  getPointClosestToDistance(distanceFromStart_m: number): TracePoint {
    if (this.isEmpty) {
      throw new Error('Cannot find point in empty trace');
    }

    let closestPoint = this._points[0]!;
    let minDiff = Math.abs(closestPoint.distanceFromStart_m - distanceFromStart_m);

    for (const point of this._points) {
      const diff = Math.abs(point.distanceFromStart_m - distanceFromStart_m);
      if (diff < minDiff) {
        minDiff = diff;
        closestPoint = point;
      }
    }

    return closestPoint;
  }

  /**
   * Get all points within a distance range
   * 
   * @param startDistance_m - Start of range (meters)
   * @param endDistance_m - End of range (meters)
   * @returns Array of TracePoints in range
   */
  getPointsInRange(startDistance_m: number, endDistance_m: number): TracePoint[] {
    return this._points.filter(
      point =>
        point.distanceFromStart_m >= startDistance_m &&
        point.distanceFromStart_m <= endDistance_m
    );
  }

  // ===========================================================================
  // DOMAIN BEHAVIOR - Point Generation
  // ===========================================================================

  /**
   * Generate evenly spaced points along the trace
   * 
   * Creates new TracePoints at regular intervals by interpolating
   * between existing points.
   * 
   * This is used for hydraulic calculations (e.g., every 50m).
   * 
   * @param interval_m - Spacing between points in meters
   * @returns Array of evenly spaced TracePoints
   * 
   * @example
   * ```typescript
   * // Generate points every 50 meters
   * const calcPoints = trace.generatePointsAtInterval(50);
   * 
   * // If trace is 5000m long, returns ~100 points
   * console.log(calcPoints.length);  // ~100
   * 
   * // Each point is ~50m apart
   * console.log(calcPoints[1].distanceFromStart_m);  // ~50
   * console.log(calcPoints[2].distanceFromStart_m);  // ~100
   * ```
   */
  generatePointsAtInterval(interval_m: number): TracePoint[] {
    if (interval_m <= 0) {
      throw new Error(`Interval must be positive, got: ${interval_m}`);
    }

    if (this.isEmpty) {
      return [];
    }

    const result: TracePoint[] = [];
    const totalDist = this.totalDistance;

    // Always include start point
    result.push(this.startPoint);

    // Generate intermediate points
    let currentDistance = interval_m;
    let currentIndex = 1;

    while (currentDistance < totalDist) {
      const interpolatedPoint = this.interpolatePointAtDistance(currentDistance);
      
      // Create new TracePoint with generated index
      const point = TracePoint.create({
        index: currentIndex,
        coordinates: interpolatedPoint.coordinates,
        elevation: interpolatedPoint.elevation,
        distanceFromStart_m: currentDistance
      });
      
      result.push(point);
      currentDistance += interval_m;
      currentIndex++;
    }

    // Always include end point if not already included
    const lastPoint = result[result.length - 1]!;
    if (!lastPoint.equals(this.endPoint)) {
      const endWithIndex = TracePoint.create({
        index: currentIndex,
        coordinates: this.endPoint.coordinates,
        elevation: this.endPoint.elevation,
        distanceFromStart_m: this.endPoint.distanceFromStart_m
      });
      result.push(endWithIndex);
    }

    return result;
  }

  /**
   * Interpolate a point at a specific distance along the trace
   * 
   * Finds the two points that bracket the target distance and
   * linearly interpolates coordinates and elevation.
   * 
   * @param distance_m - Target distance from start
   * @returns Interpolated point data
   * 
   * @private (used internally by generatePointsAtInterval)
   */
  private interpolatePointAtDistance(distance_m: number): {
    coordinates: Coordinates;
    elevation: Elevation;
  } {
    // Find bracketing points
    let before: TracePoint | null = null;
    let after: TracePoint | null = null;

    for (const point of this._points) {
      if (point.distanceFromStart_m <= distance_m) {
        before = point;
      } else {
        after = point;
        break;
      }
    }

    // Edge cases
    if (!before) {
      return {
        coordinates: this.startPoint.coordinates,
        elevation: this.startPoint.elevation
      };
    }

    if (!after) {
      return {
        coordinates: this.endPoint.coordinates,
        elevation: this.endPoint.elevation
      };
    }

    // Linear interpolation
    const segmentDistance = after.distanceFromStart_m - before.distanceFromStart_m;
    const ratio = (distance_m - before.distanceFromStart_m) / segmentDistance;

    // Interpolate coordinates
    const lat = before.latitude + (after.latitude - before.latitude) * ratio;
    const lng = before.longitude + (after.longitude - before.longitude) * ratio;
    const coordinates = Coordinates.create(lat, lng);

    // Interpolate elevation
    const elevMeters =
      before.elevationMeters +
      (after.elevationMeters - before.elevationMeters) * ratio;
    const elevation = Elevation.fromMeters(elevMeters);

    return { coordinates, elevation };
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Convert to plain object (for JSON serialization)
   * 
   * @returns Plain object with all trace data
   */
  toObject(): {
    points: Array<{
      index: number;
      latitude: number;
      longitude: number;
      elevation_m: number;
      distanceFromStart_m: number;
    }>;
    totalDistance_m: number;
    pointCount: number;
    elevationProfile: {
      min_m: number;
      max_m: number;
      start_m: number;
      end_m: number;
      difference_m: number;
    };
  } {
    const profile = this.elevationProfile;

    return {
      points: this._points.map(p => p.toObject()),
      totalDistance_m: this.totalDistance,
      pointCount: this.pointCount,
      elevationProfile: {
        min_m: profile.min.meters,
        max_m: profile.max.meters,
        start_m: profile.start.meters,
        end_m: profile.end.meters,
        difference_m: profile.difference
      }
    };
  }

  /**
   * JSON serialization
   */
  toJSON() {
    return this.toObject();
  }

  /**
   * String representation for debugging
   */
  toString(): string {
    return (
      `Trace(${this.pointCount} points, ` +
      `${this.totalDistanceKm.toFixed(2)}km, ` +
      `elevation: ${this.startPoint.elevationMeters.toFixed(0)}m → ` +
      `${this.endPoint.elevationMeters.toFixed(0)}m)`
    );
  }

  // ===========================================================================
  // VALIDATION (Private)
  // ===========================================================================

  /**
   * Validate points array
   */
  private validatePoints(points: TracePoint[]): void {
    if (!Array.isArray(points)) {
      throw new Error('Points must be an array');
    }

    if (points.length === 0) {
      throw new Error('Trace must have at least one point');
    }

    // Validate points are ordered by index
    for (let i = 0; i < points.length; i++) {
      if (points[i]!.index !== i) {
        throw new Error(
          `Point index mismatch at position ${i}: expected ${i}, got ${points[i]!.index}`
        );
      }
    }

    // Validate distances are non-decreasing
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]!;
      const curr = points[i]!;
      
      if (curr.distanceFromStart_m < prev.distanceFromStart_m) {
        throw new Error(
          `Distance must be non-decreasing: point ${i} has distance ` +
          `${curr.distanceFromStart_m}m < ${prev.distanceFromStart_m}m`
        );
      }
    }
  }
}

/**
 * =============================================================================
 * USAGE EXAMPLES
 * =============================================================================
 * 
 * // Creating from TracePoints
 * const points = [
 *   TracePoint.createStart(coords1, elev1),
 *   TracePoint.create({ index: 1, coords2, elev2, distanceFromStart_m: 100 }),
 *   TracePoint.create({ index: 2, coords3, elev3, distanceFromStart_m: 200 })
 * ];
 * const trace = Trace.create(points);
 * 
 * // Creating from raw data
 * const trace = Trace.fromCoordinatesAndElevations([
 *   { coordinates: Coordinates.create(-38.23, -68.62), elevation: Elevation.fromMeters(545) },
 *   { coordinates: Coordinates.create(-38.24, -68.63), elevation: Elevation.fromMeters(535) }
 * ]);
 * 
 * // Accessing properties
 * console.log(trace.pointCount);           // 2
 * console.log(trace.totalDistance);        // ~588m
 * console.log(trace.totalDistanceKm);      // ~0.588km
 * 
 * // Elevation profile
 * const profile = trace.elevationProfile;
 * console.log(`Start: ${profile.start.meters}m`);
 * console.log(`End: ${profile.end.meters}m`);
 * console.log(`Difference: ${profile.difference}m`);  // -10m (downhill)
 * 
 * // Generate calculation points
 * const calcPoints = trace.generatePointsAtInterval(50);
 * console.log(`Generated ${calcPoints.length} points`);
 * 
 * // Find specific points
 * const pointAt500m = trace.getPointClosestToDistance(500);
 * const firstKm = trace.getPointsInRange(0, 1000);
 * 
 * =============================================================================
 */