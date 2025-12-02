import { render, screen } from '@testing-library/react';
import TraceSummary from '../TraceSummary';
import type { CalculationResponse } from '@app/types';

const mockCalculation: CalculationResponse = {
  points: [],
  pumps: [{ index: 0, distance_m: 0, latitude: 0, longitude: 0, elevation_m: 0, K: 0, M: 0, N: 0, O: 0, P: 0 }],
  valves: [],
  alarms: [],
  warnings: [],
  summary: {
    totalDistance_km: 2.5,
    elevationDifference_m: 12,
    totalPumps: 1,
    totalValves: 0
  }
};

describe('TraceSummary', () => {
  it('muestra el resumen con los totales correctos', () => {
    render(<TraceSummary calculation={mockCalculation} />);
    expect(screen.getByText(/2.50/)).toBeInTheDocument();
    expect(screen.getByText(/12.0/)).toBeInTheDocument();
    expect(screen.getByText(/Bombas: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Válvulas: 0/)).toBeInTheDocument();
  });
});
