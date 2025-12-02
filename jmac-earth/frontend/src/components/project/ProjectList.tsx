import type { ProjectSummary } from '@app/types';

interface ProjectListProps {
  projects: ProjectSummary[];
  isLoading: boolean;
  error?: string | null;
  onRefresh: () => void;
}

const ProjectList = ({ projects, isLoading, error, onRefresh }: ProjectListProps) => {
  return (
    <div className="panel-card">
      <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span>Proyectos guardados</span>
        <button className="button secondary" type="button" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? 'Actualizando...' : 'Refrescar'}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {isLoading && <p className="helper-text">Cargando proyectos...</p>}

      {!isLoading && projects.length === 0 && (
        <p className="helper-text">A\u00fan no hay proyectos guardados. Crea el primero subiendo un KMZ.</p>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '0.75rem 0.9rem',
              background: '#f8fafc'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{project.name}</div>
                {project.client && <div className="helper-text">Cliente: {project.client}</div>}
              </div>
              <span className="chip">Estado: {project.status ?? 'pendiente'}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {project.traceDistance_km !== undefined && (
                <span className="chip">{project.traceDistance_km.toFixed(2)} km</span>
              )}
              {project.elevationDifference_m !== undefined && (
                <span className="chip">{project.elevationDifference_m.toFixed(1)} m desnivel</span>
              )}
              <span className="chip">Origen elevaci\u00f3n: {project.elevationSource ?? 'N/A'}</span>
            </div>
            <div className="helper-text" style={{ marginTop: '0.35rem' }}>
              Actualizado: {new Date(project.updatedAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
