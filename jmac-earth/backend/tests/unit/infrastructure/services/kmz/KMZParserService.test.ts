/**
 * =============================================================================
 * KMZ PARSER SERVICE - UNIT TESTS
 * =============================================================================
 * 
 * Tests for KMZParserService implementation.
 * Based on real KMZ files from JMAC.
 * 
 * Test data includes:
 * - Real KMZ structure from Google Earth Pro 7.3.6
 * - Coordinates from actual projects
 * - Edge cases and error scenarios
 * 
 * @module tests/unit/infrastructure/services/kmz
 * =============================================================================
 */

import JSZip from 'jszip';
import { KMZParserService } from '../../../../../src/infrastructure/services/kmz/KMZParserService';
import { RawCoordinate } from '../../../../../src/domain/interfaces/IKMZParserService';

describe('KMZParserService', () => {
  let parser: KMZParserService;

  beforeEach(() => {
    parser = new KMZParserService();
  });

  // ===========================================================================
  // HELPER FUNCTIONS - Create test KMZ files
  // ===========================================================================

  /**
   * Create a valid KMZ buffer for testing
   * Based on real Google Earth KMZ structure
   */
  async function createValidKMZ(coordinatesString: string, name = 'Test Trace'): Promise<Buffer> {
    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
<Document>
  <name>${name}</name>
  <Placemark>
    <name>Test Path</name>
    <description>Test description</description>
    <LineString>
      <tessellate>1</tessellate>
      <coordinates>
        ${coordinatesString}
      </coordinates>
    </LineString>
  </Placemark>
</Document>
</kml>`;

    const zip = new JSZip();
    zip.file('doc.kml', kmlContent);
    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * Create KMZ with multiple placemarks
   */
  async function createMultiPathKMZ(): Promise<Buffer> {
    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <Placemark>
    <name>Path 1</name>
    <LineString>
      <coordinates>
        -68.5000,-38.1500,500 -68.4900,-38.1480,490
      </coordinates>
    </LineString>
  </Placemark>
  <Placemark>
    <name>Path 2</name>
    <LineString>
      <coordinates>
        -68.4800,-38.1460,480 -68.4700,-38.1440,470
      </coordinates>
    </LineString>
  </Placemark>
</Document>
</kml>`;

    const zip = new JSZip();
    zip.file('doc.kml', kmlContent);
    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * Create invalid KMZ (not a ZIP)
   */
  function createInvalidZipKMZ(): Buffer {
    return Buffer.from('This is not a valid ZIP file');
  }

  /**
   * Create KMZ without KML file
   */
  async function createKMZWithoutKML(): Promise<Buffer> {
    const zip = new JSZip();
    zip.file('readme.txt', 'This KMZ has no KML file');
    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * Create KMZ with invalid XML
   */
  async function createKMZWithInvalidXML(): Promise<Buffer> {
    const zip = new JSZip();
    zip.file('doc.kml', '<kml><unclosed>This is invalid XML');
    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * Create KMZ without coordinates
   */
  async function createKMZWithoutCoordinates(): Promise<Buffer> {
    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <Placemark>
    <name>Empty Path</name>
  </Placemark>
</Document>
</kml>`;

    const zip = new JSZip();
    zip.file('doc.kml', kmlContent);
    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  // ===========================================================================
  // TEST SUITE: parse() - Main parsing method
  // ===========================================================================

  describe('parse()', () => {
    it('should parse valid KMZ with elevations', async () => {
      // Based on real JMAC project structure
      const coords = '-68.62974253714646,-38.23302316451687,545 ' +
                     '-68.62711371299604,-38.23531002778302,535 ' +
                     '-68.62585450270865,-38.23557011668871,525';

      const kmz = await createValidKMZ(coords, 'Test Project');
      const result = await parser.parse(kmz);

      expect(result).toHaveProperty('coordinates');
      expect(result).toHaveProperty('hasElevations');
      expect(result).toHaveProperty('totalDistance');
      expect(result).toHaveProperty('metadata');

      expect(result.coordinates).toHaveLength(3);
      expect(result.hasElevations).toBe(true);
      expect(result.totalDistance).toBeGreaterThan(0);
      expect(result.metadata?.name).toBe('Test Path'); // Parser returns Placemark name
    });

    it('should parse valid KMZ without elevations (all zeros)', async () => {
      // Simulating real KMZ from Google Earth without elevation data
      const coords = '-68.50065788542238,-38.15925512162455,0 ' +
                     '-68.49967138702377,-38.15848023737394,0 ' +
                     '-68.49831236283428,-38.15768481423619,0';

      const kmz = await createValidKMZ(coords);
      const result = await parser.parse(kmz);

      expect(result.coordinates).toHaveLength(3);
      expect(result.hasElevations).toBe(false); // All zeros = no elevations
      expect(result.coordinates.every(c => c.altitude === 0)).toBe(true);
    });

    it('should extract correct coordinates', async () => {
      const coords = '-68.6297,-38.2330,545 -68.6271,-38.2353,535';
      const kmz = await createValidKMZ(coords);
      const result = await parser.parse(kmz);

      expect(result.coordinates[0]).toEqual({
        latitude: -38.2330,
        longitude: -68.6297,
        altitude: 545
      });

      expect(result.coordinates[1]).toEqual({
        latitude: -38.2353,
        longitude: -68.6271,
        altitude: 535
      });
    });

    it('should calculate total distance correctly', async () => {
      // Two points ~343m apart
      const coords = '-68.62974,-38.23302,545 -68.62711,-38.23531,535';
      const kmz = await createValidKMZ(coords);
      const result = await parser.parse(kmz);

      // Distance should be around 343 meters
      expect(result.totalDistance).toBeGreaterThan(300);
      expect(result.totalDistance).toBeLessThan(400);
    });

    it('should handle KMZ with multiple placemarks (use first)', async () => {
      const kmz = await createMultiPathKMZ();
      const result = await parser.parse(kmz);

      // Should use first placemark
      expect(result.coordinates).toHaveLength(2);
      expect(result.coordinates[0]?.latitude).toBe(-38.1500);
    });

    it('should extract metadata correctly', async () => {
      const coords = '-68.5000,-38.1500,500 -68.4900,-38.1480,490';
      const kmz = await createValidKMZ(coords, 'Proyecto Sierra Chata');
      const result = await parser.parse(kmz);

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.name).toBe('Test Path'); // Parser returns Placemark name, not Document name
      expect(result.metadata?.description).toBe('Test description');
    });

    it('should throw error for invalid ZIP', async () => {
      const invalidKMZ = createInvalidZipKMZ();

      await expect(parser.parse(invalidKMZ)).rejects.toThrow('Invalid KMZ file');
    });

    it('should throw error for KMZ without KML file', async () => {
      const kmz = await createKMZWithoutKML();

      await expect(parser.parse(kmz)).rejects.toThrow('does not contain a .kml file');
    });

    it('should throw error for KMZ with invalid XML', async () => {
      const kmz = await createKMZWithInvalidXML();

      await expect(parser.parse(kmz)).rejects.toThrow('Invalid KMZ file');
    });

    it('should throw error for KMZ without coordinates', async () => {
      const kmz = await createKMZWithoutCoordinates();

      await expect(parser.parse(kmz)).rejects.toThrow('No LineString coordinates found in KML');
    });

    it('should handle single point (distance = 0)', async () => {
      const coords = '-68.5000,-38.1500,500';
      const kmz = await createValidKMZ(coords);
      const result = await parser.parse(kmz);

      expect(result.coordinates).toHaveLength(1);
      expect(result.totalDistance).toBe(0);
    });

    it('should skip invalid coordinate lines', async () => {
      // Include some malformed coordinates
      const coords = '-68.5000,-38.1500,500 ' +
                     'invalid,data ' +  // Should be skipped
                     '-68.4900,-38.1480,490 ' +
                     'NaN,NaN,NaN';  // Should be skipped

      const kmz = await createValidKMZ(coords);
      const result = await parser.parse(kmz);

      // Should only have 2 valid coordinates
      expect(result.coordinates).toHaveLength(2);
    });

    it('should handle coordinates with varying elevations', async () => {
      const coords = '-68.5000,-38.1500,545 ' +
                     '-68.4900,-38.1480,540 ' +
                     '-68.4800,-38.1460,535 ' +
                     '-68.4700,-38.1440,530';

      const kmz = await createValidKMZ(coords);
      const result = await parser.parse(kmz);

      expect(result.hasElevations).toBe(true);
      expect(result.coordinates[0]?.altitude).toBe(545);
      expect(result.coordinates[3]?.altitude).toBe(530);
    });

    it('should detect no elevation variation (all same altitude)', async () => {
      // All points at same elevation
      const coords = '-68.5000,-38.1500,500 ' +
                     '-68.4900,-38.1480,500 ' +
                     '-68.4800,-38.1460,500';

      const kmz = await createValidKMZ(coords);
      const result = await parser.parse(kmz);

      // No variation = no elevations
      expect(result.hasElevations).toBe(false);
    });
  });

  // ===========================================================================
  // TEST SUITE: validate() - Validation method
  // ===========================================================================

  describe('validate()', () => {
    it('should validate correct KMZ', async () => {
      const coords = '-68.5000,-38.1500,500 -68.4900,-38.1480,490';
      const kmz = await createValidKMZ(coords);
      const result = await parser.validate(kmz);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid ZIP', async () => {
      const invalidKMZ = createInvalidZipKMZ();
      const result = await parser.validate(invalidKMZ);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject KMZ without KML file', async () => {
      const kmz = await createKMZWithoutKML();
      const result = await parser.validate(kmz);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('KMZ file does not contain a .kml file');
    });

    it('should reject KMZ with invalid XML', async () => {
      const kmz = await createKMZWithInvalidXML();
      const result = await parser.validate(kmz);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('KML file contains invalid XML');
    });

    it('should warn about multiple KML files', async () => {
      const zip = new JSZip();
      zip.file('doc1.kml', '<kml><Document></Document></kml>');
      zip.file('doc2.kml', '<kml><Document></Document></kml>');
      const kmz = await zip.generateAsync({ type: 'nodebuffer' });

      const result = await parser.validate(kmz);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Multiple KML files');
    });
  });

  // ===========================================================================
  // TEST SUITE: extractCoordinates() - Extract only coordinates
  // ===========================================================================

  describe('extractCoordinates()', () => {
    it('should extract coordinates array', async () => {
      const coords = '-68.5000,-38.1500,500 ' +
                     '-68.4900,-38.1480,490 ' +
                     '-68.4800,-38.1460,480';

      const kmz = await createValidKMZ(coords);
      const coordinates = await parser.extractCoordinates(kmz);

      expect(Array.isArray(coordinates)).toBe(true);
      expect(coordinates).toHaveLength(3);
      expect(coordinates[0]).toHaveProperty('latitude');
      expect(coordinates[0]).toHaveProperty('longitude');
      expect(coordinates[0]).toHaveProperty('altitude');
    });

    it('should match coordinates from full parse', async () => {
      const coords = '-68.5000,-38.1500,500 -68.4900,-38.1480,490';
      const kmz = await createValidKMZ(coords);

      const extracted = await parser.extractCoordinates(kmz);
      const parsed = await parser.parse(kmz);

      expect(extracted).toEqual(parsed.coordinates);
    });
  });

  // ===========================================================================
  // TEST SUITE: calculateDistance() - Distance calculation
  // ===========================================================================

  describe('calculateDistance()', () => {
    it('should return 0 for empty array', () => {
      const distance = parser.calculateDistance([]);
      expect(distance).toBe(0);
    });

    it('should return 0 for single point', () => {
      const coords: RawCoordinate[] = [
        { latitude: -38.2353, longitude: -68.6271, altitude: 545 }
      ];
      const distance = parser.calculateDistance(coords);
      expect(distance).toBe(0);
    });

    it('should calculate distance for two points', () => {
      // ~343m apart
      const coords: RawCoordinate[] = [
        { latitude: -38.23302, longitude: -68.62974, altitude: 545 },
        { latitude: -38.23531, longitude: -68.62711, altitude: 535 }
      ];
      const distance = parser.calculateDistance(coords);

      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(400);
    });

    it('should accumulate distance for multiple points', () => {
      const coords: RawCoordinate[] = [
        { latitude: -38.2330, longitude: -68.6297, altitude: 545 },
        { latitude: -38.2353, longitude: -68.6271, altitude: 535 },
        { latitude: -38.2356, longitude: -68.6259, altitude: 525 }
      ];
      const distance = parser.calculateDistance(coords);

      // Should be sum of all segments (~452m based on real calculation)
      expect(distance).toBeGreaterThan(400);
      expect(distance).toBeLessThan(500);
    });

    it('should handle identical points (distance = 0)', () => {
      const coords: RawCoordinate[] = [
        { latitude: -38.2353, longitude: -68.6271, altitude: 545 },
        { latitude: -38.2353, longitude: -68.6271, altitude: 545 }
      ];
      const distance = parser.calculateDistance(coords);

      expect(distance).toBeLessThan(1); // Should be essentially 0
    });

    it('should ignore altitude in distance calculation', () => {
      // Same lat/lon, different altitude
      const coords1: RawCoordinate[] = [
        { latitude: -38.2353, longitude: -68.6271, altitude: 0 },
        { latitude: -38.2353, longitude: -68.6271, altitude: 1000 }
      ];

      const coords2: RawCoordinate[] = [
        { latitude: -38.2353, longitude: -68.6271, altitude: 500 },
        { latitude: -38.2353, longitude: -68.6271, altitude: 500 }
      ];

      const distance1 = parser.calculateDistance(coords1);
      const distance2 = parser.calculateDistance(coords2);

      expect(distance1).toBe(distance2); // Should be same (both ~0)
    });
  });

  // ===========================================================================
  // TEST SUITE: Edge Cases and Real-World Scenarios
  // ===========================================================================

  describe('Edge Cases', () => {
    it('should handle very long traces (100+ points)', async () => {
      // Generate 100 points along a path
      let coordsString = '';
      for (let i = 0; i < 100; i++) {
        const lng = -68.5 - (i * 0.001);
        const lat = -38.15 - (i * 0.001);
        const alt = 500 + (i * 0.5);
        coordsString += `${lng},${lat},${alt} `;
      }

      const kmz = await createValidKMZ(coordsString);
      const result = await parser.parse(kmz);

      expect(result.coordinates).toHaveLength(100);
      expect(result.totalDistance).toBeGreaterThan(10000); // Should be ~15km
      expect(result.hasElevations).toBe(true);
    });

    it('should handle coordinates at extreme locations', async () => {
      // Near poles and date line
      const coords = '179.99,89.99,1000 ' +
                     '-179.99,-89.99,0';

      const kmz = await createValidKMZ(coords);
      const result = await parser.parse(kmz);

      expect(result.coordinates).toHaveLength(2);
      expect(result.totalDistance).toBeGreaterThan(0);
    });

    it('should handle very small elevation variations', async () => {
      // Elevations differ by < 0.1m (threshold)
      const coords = '-68.5000,-38.1500,500.00 ' +
                     '-68.4900,-38.1480,500.05 ' +
                     '-68.4800,-38.1460,500.08';

      const kmz = await createValidKMZ(coords);
      const result = await parser.parse(kmz);

      // Variation is tiny, might be considered "no elevations"
      // This tests the ELEVATION_ZERO_THRESHOLD logic
      expect(result.hasElevations).toBe(false);
    });

    it('should handle negative elevations (below sea level)', async () => {
      const coords = '-68.5000,-38.1500,-10 ' +
                     '-68.4900,-38.1480,-15 ' +
                     '-68.4800,-38.1460,-20';

      const kmz = await createValidKMZ(coords);
      const result = await parser.parse(kmz);

      expect(result.hasElevations).toBe(true);
      expect(result.coordinates[0]?.altitude).toBe(-10);
      expect(result.coordinates[2]?.altitude).toBe(-20);
    });
  });

  // ===========================================================================
  // TEST SUITE: Real JMAC KMZ Simulation
  // ===========================================================================

  describe('Real JMAC KMZ Structure', () => {
    it('should parse KMZ matching actual JMAC file structure', async () => {
      // Simulating "1_x_10___1_x_12.kmz" structure
      const coords = '-68.50065788542238,-38.15925512162455,0 ' +
                     '-68.49967138702377,-38.15848023737394,0 ' +
                     '-68.49831236283428,-38.15768481423619,0 ' +
                     '-68.49819455599616,-38.15689282175963,0 ' +
                     '-68.4974417483317,-38.15685031023506,0 ' +
                     '-68.49676919550852,-38.15687404300534,0 ' +
                     '-68.49598906475499,-38.15695155422067,0 ' +
                     '-68.49367335463766,-38.15892797218424,0';

      const kmz = await createValidKMZ(coords, '1 x 10" + 1 x 12"');
      const result = await parser.parse(kmz);

      expect(result.coordinates).toHaveLength(8);
      expect(result.hasElevations).toBe(false); // All zeros
      expect(result.totalDistance).toBeGreaterThan(500);
      expect(result.metadata?.name).toBe('Test Path'); // Parser returns Placemark name
    });

    it('should parse KMZ with tessellate and style elements', async () => {
      // Real Google Earth includes styling
      const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
<Document>
  <name>Styled Trace</name>
  <Style id="lineStyle">
    <LineStyle>
      <color>ff0000ff</color>
      <width>2</width>
    </LineStyle>
  </Style>
  <Placemark>
    <name>Path with Style</name>
    <styleUrl>#lineStyle</styleUrl>
    <LineString>
      <tessellate>1</tessellate>
      <coordinates>
        -68.5000,-38.1500,500 -68.4900,-38.1480,490
      </coordinates>
    </LineString>
  </Placemark>
</Document>
</kml>`;

      const zip = new JSZip();
      zip.file('doc.kml', kmlContent);
      const kmz = await zip.generateAsync({ type: 'nodebuffer' });

      const result = await parser.parse(kmz);

      expect(result.coordinates).toHaveLength(2);
      expect(result.metadata?.name).toBe('Path with Style'); // Parser returns Placemark name
    });
  });
});