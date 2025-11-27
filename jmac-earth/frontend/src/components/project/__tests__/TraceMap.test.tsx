import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-leaflet', () => {
  return {
    MapContainer: ({ children }: any) => (
      <div data-testid="map">{children}</div>
    ),
    TileLayer: () => <div data-testid="tile-layer" />,
    Polyline: () => <div data-testid="polyline" />,
    CircleMarker: ({ center }: any) => {
      const key = `${center[0]},${center[1]}`;
      return <div data-testid={`marker-${key}`} />;
    }
  };
});

import TraceMap from '../TraceMap';
import type { CalculationResponse } from '@app/types';

const sampleCalculation: CalculationResponse = {
  points: [
    { index: 0, distance_m: 0, latitude: -38.0, longitude: -68.0, elevation_m: 100, K: 0, M: 0, N: 0, O: 0, P: 0 },
    { index: 1, distance_m: 100, latitude: -38.1, longitude: -68.1, elevation_m: 110, K: 0, M: 0, N: 0, O: 0, P: 0 }
  ],
  pumps: [
    { index: 0, distance_m: 0, latitude: -38.0, longitude: -68.0, elevation_m: 100, K: 0, M: 0, N: 0, O: 0, P: 0 }
  ],
  valves: [
    { index: 1, distance_m: 100, latitude: -38.1, longitude: -68.1, elevation_m: 110, K: 0, M: 0, N: 0, O: 0, P: 0 }
  ],
  alarms: [],
  warnings: [],
  summary: {
    totalDistance_km: 0.1,
    elevationDifference_m: 10,
    totalPumps: 1,
    totalValves: 1
  }
};

describe('TraceMap', () => {
  it('renderiza el mapa y los marcadores calculados', () => {
    render(<TraceMap calculation={sampleCalculation} />);
    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.getByTestId('polyline')).toBeInTheDocument();
    expect(screen.getByTestId('marker--38,-68')).toBeInTheDocument();
    expect(screen.getByTestId('marker--38.1,-68.1')).toBeInTheDocument();
  });
});
