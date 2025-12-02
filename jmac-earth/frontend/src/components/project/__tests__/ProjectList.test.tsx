import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProjectList from '../ProjectList';
import type { ProjectSummary } from '@app/types';

const projects: ProjectSummary[] = [
  {
    id: '1',
    name: 'Proyecto Norte',
    client: 'Cliente A',
    description: '',
    status: 'calculado',
    traceDistance_km: 2.5,
    elevationDifference_m: 15,
    hasParameters: true,
    elevationSource: 'SRTM',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

describe('ProjectList', () => {
  it('renders project items and metadata', () => {
    const refresh = vi.fn();
    render(<ProjectList projects={projects} isLoading={false} error={null} onRefresh={refresh} />);

    expect(screen.getByText(/Proyecto Norte/i)).toBeInTheDocument();
    expect(screen.getByText(/Cliente: Cliente A/i)).toBeInTheDocument();
    expect(screen.getByText(/calculado/i)).toBeInTheDocument();
    expect(screen.getByText(/2.50 km/i)).toBeInTheDocument();
  });

  it('triggers refresh on button click', () => {
    const refresh = vi.fn();
    render(<ProjectList projects={projects} isLoading={false} error={null} onRefresh={refresh} />);

    fireEvent.click(screen.getByRole('button', { name: /Refrescar/i }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<ProjectList projects={[]} isLoading error={null} onRefresh={() => {}} />);
    expect(screen.getByText(/Cargando proyectos/i)).toBeInTheDocument();
  });
});
