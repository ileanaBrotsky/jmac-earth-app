import type { CalculationResponse } from '@app/types';

interface TraceSummaryProps {
  calculation: CalculationResponse;
}

const TraceSummary = ({ calculation }: TraceSummaryProps) => {
  const { summary, pumps, valves } = calculation;

  return (
    <div className="panel-card">
      <div className="panel-heading">Resumen del cálculo</div>
      <div className="summary-grid">
        <div className="summary-item">
          <span>Distancia total (km)</span>
          <span>{summary.totalDistance_km.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>Desnivel (m)</span>
          <span>{summary.elevationDifference_m.toFixed(1)}</span>
        </div>
        <div className="summary-item">
          <span>Total bombas</span>
          <span>{summary.totalPumps}</span>
        </div>
        <div className="summary-item">
          <span>Total válvulas</span>
          <span>{summary.totalValves}</span>
        </div>
      </div>
      <div className="chip-row">
        <span className="chip">Bombas: {pumps.length}</span>
        <span className="chip">Válvulas: {valves.length}</span>
      </div>
    </div>
  );
};

export default TraceSummary;
