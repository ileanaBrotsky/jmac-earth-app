import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { CalculationResponse, PointResult } from '@app/types';
import './TraceMap.css';
import 'leaflet/dist/leaflet.css';

interface TraceMapProps {
  calculation: CalculationResponse;
}

interface SelectedPoint {
  type: 'pump' | 'valve' | 'point';
  index: number;
  data: PointResult;
}

const TraceMap: React.FC<TraceMapProps> = ({ calculation }) => {
  console.log('TraceMap received calculation:', calculation);
  
  const {
    trace = { points: [] },
    pumps = [],
    valves = [],
  } = calculation;

  console.log('TraceMap extracted data - trace:', trace, 'pumps:', pumps, 'valves:', valves);

  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);

  // Handle empty data
  if (!trace || !trace.points || trace.points.length === 0) {
    console.warn('TraceMap: No trace points data');
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#666',
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        <div>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>No hay datos de traza</p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Por favor verifica el archivo KMZ y los parámetros</p>
        </div>
      </div>
    );
  }

  // Map center from first trace point
  const mapCenter = useMemo(() => {
    try {
      if (trace.points.length > 0) {
        const firstPoint = trace.points[0];
        console.log('First point data:', firstPoint);
        // Support both lat/longitude and latitude/longitude property names
        const lat = 'lat' in firstPoint ? firstPoint.lat : (firstPoint as any).latitude;
        const lon = 'lon' in firstPoint ? firstPoint.lon : (firstPoint as any).longitude;
        
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
          console.error('Invalid coordinates:', { lat, lon });
          return [40.0, 0.0] as [number, number];
        }
        
        console.log('Map center:', [lat, lon]);
        return [lat, lon] as [number, number];
      }
    } catch (error) {
      console.error('Error calculating map center:', error);
    }
    return [40.0, 0.0] as [number, number];
  }, [trace.points]);

  // Create custom pump icon
  const pumpIcon = L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="14" fill="#1d4ed8"/>
        <line x1="16" y1="6" x2="16" y2="26" stroke="white" stroke-width="2"/>
        <line x1="6" y1="16" x2="26" y2="16" stroke="white" stroke-width="2"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  // Create custom valve icon
  const valveIcon = L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <rect x="4" y="4" width="24" height="24" fill="#dc2626" rx="2"/>
        <line x1="8" y1="12" x2="24" y2="12" stroke="white" stroke-width="2"/>
        <line x1="8" y1="20" x2="24" y2="20" stroke="white" stroke-width="2"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  // Create small gray circle for trace points
  const pointIcon = L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" width="8" height="8">
        <circle cx="4" cy="4" r="3" fill="#9ca3af"/>
      </svg>
    `)}`,
    iconSize: [8, 8],
    iconAnchor: [4, 4],
    popupAnchor: [0, -8],
  });

  // Helper to get lat/lon from point
  const getCoords = (point: PointResult): { lat: number; lon: number } => {
    if (point.lat !== undefined && point.lon !== undefined) {
      return { lat: point.lat as number, lon: point.lon as number };
    }
    if (point.latitude !== undefined && point.longitude !== undefined) {
      return { lat: point.latitude as number, lon: point.longitude as number };
    }
    return { lat: 0, lon: 0 };
  };

  const renderMarkers = () => {
    const markers: React.ReactNode[] = [];

    // Add trace points
    trace.points.forEach((point) => {
      const { lat, lon } = getCoords(point);
      markers.push(
        <Marker
          key={`point-${point.index}`}
          position={[lat, lon]}
          icon={pointIcon}
          eventHandlers={{
            click: () => setSelectedPoint({ type: 'point', index: point.index, data: point }),
          }}
        >
          <Popup>
            <div className="popup-content">
              <h4>Point {point.index}</h4>
              <p><strong>Distance:</strong> {point.distance_m?.toFixed(2)} m</p>
              <p><strong>Elevation:</strong> {point.elevation_m?.toFixed(2)} m</p>
              <p><strong>Lat:</strong> {lat.toFixed(6)}</p>
              <p><strong>Lon:</strong> {lon.toFixed(6)}</p>
              {point.K && <p><strong>K:</strong> {point.K.toFixed(4)}</p>}
              {point.M && <p><strong>M:</strong> {point.M.toFixed(4)}</p>}
              {point.N && <p><strong>N:</strong> {point.N.toFixed(4)}</p>}
              {point.O && <p><strong>O:</strong> {point.O.toFixed(4)}</p>}
              {point.P && <p><strong>P:</strong> {point.P.toFixed(4)}</p>}
            </div>
          </Popup>
        </Marker>
      );
    });

    // Add pump markers
    pumps.forEach((pump, idx) => {
      const { lat, lon } = getCoords(pump);
      markers.push(
        <Marker
          key={`pump-${idx}`}
          position={[lat, lon]}
          icon={pumpIcon}
          eventHandlers={{
            click: () => setSelectedPoint({ type: 'pump', index: idx, data: pump }),
          }}
        >
          <Popup>
            <div className="popup-content">
              <h4>Pump {idx + 1}</h4>
              <p><strong>Distance:</strong> {pump.distance_m?.toFixed(2)} m</p>
              <p><strong>Elevation:</strong> {pump.elevation_m?.toFixed(2)} m</p>
              <p><strong>Location:</strong> [{lat.toFixed(6)}, {lon.toFixed(6)}]</p>
            </div>
          </Popup>
        </Marker>
      );
    });

    // Add valve markers
    valves.forEach((valve, idx) => {
      const { lat, lon } = getCoords(valve);
      markers.push(
        <Marker
          key={`valve-${idx}`}
          position={[lat, lon]}
          icon={valveIcon}
          eventHandlers={{
            click: () => setSelectedPoint({ type: 'valve', index: idx, data: valve }),
          }}
        >
          <Popup>
            <div className="popup-content">
              <h4>Valve {idx + 1}</h4>
              <p><strong>Distance:</strong> {valve.distance_m?.toFixed(2)} m</p>
              <p><strong>Elevation:</strong> {valve.elevation_m?.toFixed(2)} m</p>
              <p><strong>Location:</strong> [{lat.toFixed(6)}, {lon.toFixed(6)}]</p>
            </div>
          </Popup>
        </Marker>
      );
    });

    return markers;
  };

  const polylinePositions = trace.points.map((point) => {
    const { lat, lon } = getCoords(point);
    return [lat, lon] as [number, number];
  });

  const totalDistance = trace.points[trace.points.length - 1]?.distance_m || 0;

  if (trace.points.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#666',
        }}
      >
        No hay datos de traza para mostrar
      </div>
    );
  }

  return (
    <div className="map-container">
      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {polylinePositions.length > 1 && (
            <Polyline
              positions={polylinePositions}
              color="#1e40af"
              weight={2}
              dashArray="5, 5"
              opacity={0.8}
            />
          )}
          {renderMarkers()}

          {/* Legend */}
          <div className="map-legend">
            <div className="map-legend-title">Legend</div>
            <div className="legend-item">
              <span style={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: '16px' }}>+</span>
              <span>{pumps.length} Pump{pumps.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="legend-item">
              <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '16px' }}>■</span>
              <span>{valves.length} Valve{valves.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="legend-item">
              <span style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: '10px' }}>●</span>
              <span>{trace.points.length} Points</span>
            </div>
          </div>
        </MapContainer>
      </div>

      {/* Info Panel */}
      <div className="info-panel">
        <div className="info-section">
          <div className="info-title">Project Summary</div>
          <div className="summary-stats">
            <div className="stat-box">
              <div className="stat-value">{trace.points.length}</div>
              <div className="stat-label">Points</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{pumps.length}</div>
              <div className="stat-label">Pumps</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{valves.length}</div>
              <div className="stat-label">Valves</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{totalDistance.toFixed(0)}</div>
              <div className="stat-label">Total m</div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <div className="info-title">
            <span className="info-title-icon pump-icon">+</span>
            Pumps ({pumps.length})
          </div>
          {pumps.length > 0 ? (
            pumps.map((pump, idx) => {
              const { lat: _lat, lon: _lon } = getCoords(pump);
              return (
                <div
                  key={`pump-info-${idx}`}
                  className="info-item info-item-pump"
                  onClick={() => setSelectedPoint({ type: 'pump', index: idx, data: pump })}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="info-item-row">
                    <span className="info-label">Pump {idx + 1}</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-label">Distance:</span>
                    <span className="info-value">{pump.distance_m?.toFixed(2)} m</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-label">Elevation:</span>
                    <span className="info-value">{pump.elevation_m?.toFixed(2)} m</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>No pumps in this project</p>
          )}
        </div>

        <div className="info-section">
          <div className="info-title">
            <span className="info-title-icon valve-icon">■</span>
            Valves ({valves.length})
          </div>
          {valves.length > 0 ? (
            valves.map((valve, idx) => {
              const { lat: _lat, lon: _lon } = getCoords(valve);
              return (
                <div
                  key={`valve-info-${idx}`}
                  className="info-item info-item-valve"
                  onClick={() => setSelectedPoint({ type: 'valve', index: idx, data: valve })}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="info-item-row">
                    <span className="info-label">Valve {idx + 1}</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-label">Distance:</span>
                    <span className="info-value">{valve.distance_m?.toFixed(2)} m</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-label">Elevation:</span>
                    <span className="info-value">{valve.elevation_m?.toFixed(2)} m</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>No valves in this project</p>
          )}
        </div>

        {selectedPoint && (
          <div className="info-section">
            <div className="info-title">
              {selectedPoint.type === 'pump' && (
                <>
                  <span className="info-title-icon pump-icon">+</span>
                  Pump {selectedPoint.index + 1}
                </>
              )}
              {selectedPoint.type === 'valve' && (
                <>
                  <span className="info-title-icon valve-icon">■</span>
                  Valve {selectedPoint.index + 1}
                </>
              )}
              {selectedPoint.type === 'point' && (
                <>
                  <span className="info-title-icon" style={{ backgroundColor: '#9ca3af' }}>P</span>
                  Point {selectedPoint.index}
                </>
              )}
            </div>
            <div className="info-item">
              {(() => {
                const { lat, lon } = getCoords(selectedPoint.data);
                return (
                  <>
                    <div className="info-item-row">
                      <span className="info-label">Latitude:</span>
                      <span className="info-value">{lat.toFixed(6)}</span>
                    </div>
                    <div className="info-item-row">
                      <span className="info-label">Longitude:</span>
                      <span className="info-value">{lon.toFixed(6)}</span>
                    </div>
                    <div className="info-item-row">
                      <span className="info-label">Distance:</span>
                      <span className="info-value">{selectedPoint.data.distance_m?.toFixed(2)} m</span>
                    </div>
                    <div className="info-item-row">
                      <span className="info-label">Elevation:</span>
                      <span className="info-value">{selectedPoint.data.elevation_m?.toFixed(2)} m</span>
                    </div>
                    {selectedPoint.data.K && (
                      <div className="info-item-row">
                        <span className="info-label">K:</span>
                        <span className="info-value">{selectedPoint.data.K.toFixed(4)}</span>
                      </div>
                    )}
                    {selectedPoint.data.M && (
                      <div className="info-item-row">
                        <span className="info-label">M:</span>
                        <span className="info-value">{selectedPoint.data.M.toFixed(4)}</span>
                      </div>
                    )}
                    {selectedPoint.data.N && (
                      <div className="info-item-row">
                        <span className="info-label">N:</span>
                        <span className="info-value">{selectedPoint.data.N.toFixed(4)}</span>
                      </div>
                    )}
                    {selectedPoint.data.O && (
                      <div className="info-item-row">
                        <span className="info-label">O:</span>
                        <span className="info-value">{selectedPoint.data.O.toFixed(4)}</span>
                      </div>
                    )}
                    {selectedPoint.data.P && (
                      <div className="info-item-row">
                        <span className="info-label">P:</span>
                        <span className="info-value">{selectedPoint.data.P.toFixed(4)}</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraceMap;
