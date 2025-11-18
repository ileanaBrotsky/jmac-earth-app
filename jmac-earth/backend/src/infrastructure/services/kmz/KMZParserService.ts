/**
 * =============================================================================
 * KMZ PARSER SERVICE IMPLEMENTATION
 * =============================================================================
 * 
 * Implementation of IKMZParserService using jszip and xml2js.
 * 
 * Responsibilities:
 * - Unzip KMZ files (KMZ = zipped KML)
 * - Parse KML XML structure
 * - Extract coordinates and elevations
 * - Calculate distances using Haversine formula
 * - Validate KMZ structure
 * 
 * Dependencies:
 * - jszip: For unzipping KMZ files
 * - xml2js: For parsing KML XML
 * 
 * @module infrastructure/services/kmz
 * =============================================================================
 */

import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';
import {
  IKMZParserService,
  KMZParseResult,
  KMZValidationResult,
  RawCoordinate
} from '../../../domain/interfaces/IKMZParserService';

/**
 * KMZ Parser Service Implementation
 * 
 * Parses Google Earth KMZ files to extract trace data.
 */
export class KMZParserService implements IKMZParserService {
  /**
   * Earth's radius in meters (for Haversine formula)
   */
  private readonly EARTH_RADIUS_M = 6371000;

  /**
   * Minimum valid elevation threshold
   * 
   * Google Earth sometimes sets altitude to 0 when no data.
   * We consider elevations valid if they vary or are non-zero.
   */
  private readonly ELEVATION_ZERO_THRESHOLD = 0.1;

  // ===========================================================================
  // PUBLIC API (implements IKMZParserService)
  // ===========================================================================

  /**
   * Parse a KMZ file and extract trace data
   * 
   * @param kmzFile - Buffer or File containing KMZ data
   * @returns Promise with parsed trace data
   * @throws Error if file is invalid or parsing fails
   */
  async parse(kmzFile: Buffer | File): Promise<KMZParseResult> {
    try {
      // 1. Validate first
      const validation = await this.validate(kmzFile);
      if (!validation.isValid) {
        throw new Error(`Invalid KMZ file: ${validation.errors.join(', ')}`);
      }

      // 2. Extract KML content
      const kmlContent = await this.extractKMLFromKMZ(kmzFile);

      // 3. Parse KML XML
      const kmlData = await this.parseKML(kmlContent);

      // 4. Extract coordinates
      const coordinates = this.extractCoordinatesFromKML(kmlData);

      if (coordinates.length === 0) {
        throw new Error('No coordinates found in KMZ file');
      }

      // 5. Check if has valid elevations
      const hasElevations = this.checkHasElevations(coordinates);

      // 6. Calculate total distance
      const totalDistance = this.calculateDistance(coordinates);

      // 7. Extract metadata (if available)
      const metadata = this.extractMetadata(kmlData);

      return {
        coordinates,
        hasElevations,
        totalDistance,
        metadata
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse KMZ: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate a KMZ file without parsing it completely
   * 
   * @param kmzFile - Buffer or File to validate
   * @returns Promise with validation result
   */
  async validate(kmzFile: Buffer | File): Promise<KMZValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Check if it's a valid ZIP
      const buffer = await this.toBuffer(kmzFile);
      const zip = await JSZip.loadAsync(buffer);

      // 2. Check if contains .kml file
      const kmlFiles = Object.keys(zip.files).filter(name =>
        name.toLowerCase().endsWith('.kml')
      );

      if (kmlFiles.length === 0) {
        errors.push('KMZ file does not contain a .kml file');
        return { isValid: false, errors, warnings };
      }

      if (kmlFiles.length > 1) {
        warnings.push(`Multiple KML files found (${kmlFiles.length}). Using first one: ${kmlFiles[0]}`);
      }

      // 3. Check if KML has valid XML structure
      const kmlFile = zip.file(kmlFiles[0]!);
      if (!kmlFile) {
        errors.push('Could not read KML file from KMZ');
        return { isValid: false, errors, warnings };
      }

      const kmlContent = await kmlFile.async('string');

      // Try to parse XML
      try {
        await parseStringPromise(kmlContent);
      } catch (xmlError) {
        errors.push('KML file contains invalid XML');
        return { isValid: false, errors, warnings };
      }

      // 4. All validations passed
      return {
        isValid: true,
        errors: [],
        warnings
      };
    } catch (error) {
      if (error instanceof Error) {
        errors.push(`File validation failed: ${error.message}`);
      } else {
        errors.push('Unknown validation error');
      }
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Extract only coordinates without full parsing
   * 
   * @param kmzFile - Buffer or File object
   * @returns Promise with array of coordinates
   */
  async extractCoordinates(kmzFile: Buffer | File): Promise<RawCoordinate[]> {
    const result = await this.parse(kmzFile);
    return result.coordinates;
  }

  /**
   * Calculate total distance along coordinate path
   * 
   * @param coordinates - Array of coordinates
   * @returns Total distance in meters
   */
  calculateDistance(coordinates: RawCoordinate[]): number {
    if (coordinates.length < 2) {
      return 0;
    }

    let totalDistance = 0;

    for (let i = 1; i < coordinates.length; i++) {
      const prev = coordinates[i - 1]!;
      const curr = coordinates[i]!;
      
      const segmentDistance = this.haversineDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
      
      totalDistance += segmentDistance;
    }

    return totalDistance;
  }

  // ===========================================================================
  // PRIVATE METHODS - KMZ/KML Processing
  // ===========================================================================

  /**
   * Extract KML content from KMZ file
   */
  private async extractKMLFromKMZ(kmzFile: Buffer | File): Promise<string> {
    const buffer = await this.toBuffer(kmzFile);
    const zip = await JSZip.loadAsync(buffer);

    // Find .kml file (case-insensitive)
    const kmlFiles = Object.keys(zip.files).filter(name =>
      name.toLowerCase().endsWith('.kml')
    );

    if (kmlFiles.length === 0) {
      throw new Error('No KML file found in KMZ');
    }

    // Use first KML file found
    const kmlFileName = kmlFiles[0]!;
    const kmlFile = zip.file(kmlFileName);

    if (!kmlFile) {
      throw new Error(`Could not read KML file: ${kmlFileName}`);
    }

    return await kmlFile.async('string');
  }

  /**
   * Parse KML XML content
   */
  private async parseKML(kmlContent: string): Promise<any> {
    try {
      return await parseStringPromise(kmlContent, {
        explicitArray: false,
        mergeAttrs: true
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse KML XML: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Extract coordinates from parsed KML data
   * 
   * Google Earth format: "longitude,latitude,altitude"
   */
  private extractCoordinatesFromKML(kmlData: any): RawCoordinate[] {
    const coordinates: RawCoordinate[] = [];

    try {
      // Navigate KML structure to find coordinates
      // Structure: kml -> Document -> Placemark -> LineString -> coordinates
      
      const kml = kmlData.kml || kmlData;
      const document = kml.Document || kml;
      
      // Handle both single Placemark and array of Placemarks
      let placemarks = document.Placemark;
      if (!placemarks) {
        throw new Error('No Placemark found in KML');
      }

      // Ensure placemarks is an array
      if (!Array.isArray(placemarks)) {
        placemarks = [placemarks];
      }

      // Find first placemark with LineString
      let coordinatesString: string | undefined;
      
      for (const placemark of placemarks) {
        const lineString = placemark.LineString;
        if (lineString && lineString.coordinates) {
          coordinatesString = lineString.coordinates;
          break;
        }
      }

      if (!coordinatesString) {
        throw new Error('No LineString coordinates found in KML');
      }

      // Parse coordinate string
      // Format: "lng,lat,alt lng,lat,alt lng,lat,alt"
      const coordLines = coordinatesString
        .trim()
        .split(/\s+/)
        .filter(line => line.length > 0);

      for (const line of coordLines) {
        const parts = line.split(',');
        
        if (parts.length < 2) {
          continue; // Skip invalid coordinate
        }

        const longitude = parseFloat(parts[0]!);
        const latitude = parseFloat(parts[1]!);
        const altitude = parts[2] ? parseFloat(parts[2]) : 0;

        if (isNaN(longitude) || isNaN(latitude)) {
          continue; // Skip invalid numbers
        }

        coordinates.push({
          latitude,
          longitude,
          altitude: isNaN(altitude) ? 0 : altitude
        });
      }

      return coordinates;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to extract coordinates: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Extract metadata from KML
   */
  private extractMetadata(kmlData: any): {
    name?: string;
    description?: string;
  } {
    try {
      const kml = kmlData.kml || kmlData;
      const document = kml.Document || kml;
      const placemark = Array.isArray(document.Placemark)
        ? document.Placemark[0]
        : document.Placemark;

      return {
        name: placemark?.name || document.name,
        description: placemark?.description || document.description
      };
    } catch {
      return {};
    }
  }

  /**
   * Check if coordinates have valid elevation data
   * 
   * Returns true if:
   * - At least one non-zero altitude
   * - Altitudes vary (not all the same)
   */
  private checkHasElevations(coordinates: RawCoordinate[]): boolean {
    if (coordinates.length === 0) {
      return false;
    }

    // Check if all altitudes are zero or undefined
    const hasNonZero = coordinates.some(
      coord => coord.altitude && Math.abs(coord.altitude) > this.ELEVATION_ZERO_THRESHOLD
    );

    if (!hasNonZero) {
      return false;
    }

    // Check if altitudes vary (not all the same)
    const firstAltitude = coordinates[0]!.altitude || 0;
    const hasVariation = coordinates.some(
      coord => Math.abs((coord.altitude || 0) - firstAltitude) > this.ELEVATION_ZERO_THRESHOLD
    );

    return hasVariation;
  }

  // ===========================================================================
  // PRIVATE METHODS - Distance Calculation
  // ===========================================================================

  /**
   * Calculate distance between two coordinates using Haversine formula
   * 
   * @param lat1 - Latitude of first point (degrees)
   * @param lon1 - Longitude of first point (degrees)
   * @param lat2 - Latitude of second point (degrees)
   * @param lon2 - Longitude of second point (degrees)
   * @returns Distance in meters
   */
  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS_M * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // ===========================================================================
  // PRIVATE METHODS - Utilities
  // ===========================================================================

  /**
   * Convert File or Buffer to Buffer
   */
  private async toBuffer(file: Buffer | File): Promise<Buffer> {
    if (Buffer.isBuffer(file)) {
      return file;
    }

    // If it's a File object (browser), convert to Buffer
    if (typeof (file as any).arrayBuffer === 'function') {
      const arrayBuffer = await (file as any).arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    throw new Error('Invalid file type: expected Buffer or File');
  }
}

/**
 * =============================================================================
 * USAGE EXAMPLES
 * =============================================================================
 * 
 * // Create parser instance
 * const parser = new KMZParserService();
 * 
 * // Parse a KMZ file
 * const kmzBuffer = fs.readFileSync('trace.kmz');
 * const result = await parser.parse(kmzBuffer);
 * 
 * console.log(`Points: ${result.coordinates.length}`);
 * console.log(`Has elevations: ${result.hasElevations}`);
 * console.log(`Distance: ${result.totalDistance}m`);
 * 
 * // Check first coordinate
 * const first = result.coordinates[0];
 * console.log(`Start: ${first.latitude}, ${first.longitude}, ${first.altitude}m`);
 * 
 * // Validate before parsing
 * const validation = await parser.validate(kmzBuffer);
 * if (!validation.isValid) {
 *   console.error('Invalid KMZ:', validation.errors);
 *   return;
 * }
 * 
 * if (validation.warnings.length > 0) {
 *   console.warn('Warnings:', validation.warnings);
 * }
 * 
 * // Extract just coordinates (lighter operation)
 * const coords = await parser.extractCoordinates(kmzBuffer);
 * 
 * // Calculate distance manually
 * const distance = parser.calculateDistance(coords);
 * console.log(`Total distance: ${distance}m`);
 * 
 * =============================================================================
 */