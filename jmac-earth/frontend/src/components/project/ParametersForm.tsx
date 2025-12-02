import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { ProjectFormValues } from '@app/types/forms';

interface ParametersFormProps {
  register: UseFormRegister<ProjectFormValues>;
  errors: FieldErrors<ProjectFormValues>;
}

const ParametersForm = ({ register, errors }: ParametersFormProps) => {
  return (
    <div className="panel-card">
      <div className="panel-heading">Parámetros hidráulicos</div>
      <div className="field-grid">
        <div>
          <label className="field-label" htmlFor="name">
            Nombre del proyecto
          </label>
          <input id="name" className="text-input" {...register('name')} />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="client">
            Cliente (opcional)
          </label>
          <input id="client" className="text-input" {...register('client')} />
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <label className="field-label" htmlFor="description">
          Descripción
        </label>
        <textarea id="description" className="textarea" {...register('description')} />
      </div>
      <div className="field-grid two-columns">
        <div>
          <label className="field-label" htmlFor="flowRate_m3h">
            Caudal total (m³/h)
          </label>
          <input
            id="flowRate_m3h"
            className="text-input"
            placeholder="120"
            {...register('flowRate_m3h', { valueAsNumber: true })}
          />
          {errors.flowRate_m3h && <p className="error-text">{errors.flowRate_m3h.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="flexiDiameter">
            Diámetro flexi
          </label>
          <select id="flexiDiameter" className="select-input" {...register('flexiDiameter')}>
            <option value="">Seleccione</option>
            <option value="10">10"</option>
            <option value="12">12"</option>
          </select>
          {errors.flexiDiameter && <p className="error-text">{errors.flexiDiameter.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="pumpingPressure_kgcm2">
            Presión de bombeo (kg/cm²)
          </label>
          <input
            id="pumpingPressure_kgcm2"
            className="text-input"
            placeholder="8"
            {...register('pumpingPressure_kgcm2', { valueAsNumber: true })}
          />
          {errors.pumpingPressure_kgcm2 && (
            <p className="error-text">{errors.pumpingPressure_kgcm2.message}</p>
          )}
        </div>
        <div>
          <label className="field-label" htmlFor="numberOfLines">
            Líneas paralelas
          </label>
          <input
            id="numberOfLines"
            type="number"
            className="text-input"
            placeholder="1"
            {...register('numberOfLines', { valueAsNumber: true })}
          />
          {errors.numberOfLines && <p className="error-text">{errors.numberOfLines.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="calculationInterval_m">
            Intervalo de cálculo (m)
          </label>
          <select
            id="calculationInterval_m"
            className="select-input"
            {...register('calculationInterval_m', { valueAsNumber: true })}
          >
            <option value="">Seleccione</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          {errors.calculationInterval_m && (
            <p className="error-text">{errors.calculationInterval_m.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParametersForm;
