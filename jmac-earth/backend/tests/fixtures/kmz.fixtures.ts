import JSZip from 'jszip';

const BASE_KML_TEMPLATE = (coordinates: string, name: string) => `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>${name}</name>
  <Placemark>
    <LineString>
      <coordinates>
        ${coordinates.trim()}
      </coordinates>
    </LineString>
  </Placemark>
</Document>
</kml>`;

export async function createSampleKMZ(coordinates: string, name = 'Test Project'): Promise<Buffer> {
  const kml = BASE_KML_TEMPLATE(coordinates, name);
  const zip = new JSZip();
  zip.file('doc.kml', kml);
  return zip.generateAsync({ type: 'nodebuffer' });
}

export async function createDefaultKMZ(): Promise<Buffer> {
  const coords = `-68.629742,-38.233023,545 -68.627113,-38.235310,535 -68.625855,-38.235570,525`;
  return createSampleKMZ(coords, 'Default Trace');
}
