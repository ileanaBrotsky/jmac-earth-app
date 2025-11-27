import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import KMZUploader from '@components/project/KMZUploader';
import ParametersForm from '@components/project/ParametersForm';
import TraceSummary from '@components/project/TraceSummary';
import TraceMap from '@components/project/TraceMap';
import { useProjectCreation } from '@hooks/useProject';
import type { ProjectFormValues } from '@app/types/forms';

const calculationSchema = z.object({
  name: z.string().min(3, 'Nombre requerido'),
  client: z.string().optional(),
  description: z.string().optional(),
  flowRate_m3h: z.number().positive().max(1000, 'Máximo 1000 m³/h'),
  flexiDiameter: z.enum(['10', '12']),
  pumpingPressure_kgcm2: z.number().min(1).max(20),
  numberOfLines: z.number().int().min(1).max(10),
  calculationInterval_m: z.number().min(10).max(500)
});

export const NewProjectPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const mutation = useProjectCreation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(calculationSchema),
    defaultValues: {
      name: '',
      client: '',
      description: '',
      flowRate_m3h: 120,
      flexiDiameter: '12',
      pumpingPressure_kgcm2: 8,
      numberOfLines: 1,
      calculationInterval_m: 50
    }
  });

  const watchFlowRate = watch('flowRate_m3h') ?? 0;
  const watchLines = watch('numberOfLines') ?? 1;
  const watchInterval = watch('calculationInterval_m') ?? 0;
  const watchDiameter = watch('flexiDiameter') ?? '12';

  const bpmTotal = useMemo(() => watchFlowRate * 0.1048, [watchFlowRate]);
  const bpmPerLine = useMemo(() => (watchLines > 0 ? bpmTotal / watchLines : bpmTotal), [bpmTotal, watchLines]);

  const onSubmit = (values: ProjectFormValues) => {
    if (!file) {
      setFileError('Debes adjuntar un archivo KMZ válido');
      return;
    }
    setFileError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', values.name);
    if (values.client) formData.append('client', values.client);
    if (values.description) formData.append('description', values.description);
    formData.append('createdBy', 'frontend-demo');
    formData.append('flowRate_m3h', String(values.flowRate_m3h));
    formData.append('flexiDiameter', values.flexiDiameter);
    formData.append('pumpingPressure_kgcm2', String(values.pumpingPressure_kgcm2));
    formData.append('numberOfLines', String(values.numberOfLines));
    formData.append('calculationInterval_m', String(values.calculationInterval_m));

    mutation.mutate(formData);
  };

  const result = mutation.data;
  
  // Handle the response structure properly (could be data.calculation or calculation directly)
  const calculationData = result?.data?.calculation || result?.calculation;

  return (
    <div className="layout-grid">
      <div>
        <KMZUploader file={file} error={fileError ?? undefined} onFileChange={(value) => setFile(value)} />
        <div style={{ height: '1rem' }} />
        <ParametersForm register={register} errors={errors} />
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="helper-text" style={{ margin: 0 }}>
              Caudal total: {bpmTotal.toFixed(2)} BPM · Caudal por línea: {bpmPerLine.toFixed(2)} BPM
            </p>
            <p className="helper-text" style={{ margin: 0 }}>
              Intervalo: {watchInterval} m · Flexi {watchDiameter}"
            </p>
          </div>
          <button
            className="button primary"
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Calculando...' : 'Calcular posiciones'}
          </button>
        </div>
        {mutation.isError && (
          <p className="error-text" style={{ marginTop: '0.75rem' }}>
            {(mutation.error as any)?.response?.data?.error ||
              (mutation.error as Error).message ||
              'Error inesperado'}
          </p>
        )}
        {mutation.isSuccess && calculationData && calculationData.alarms && calculationData.alarms.length > 0 && (
          <div className="panel-card" style={{ marginTop: '1rem' }}>
            <p className="field-label">Alarmas detectadas</p>
            <ul style={{ paddingLeft: '1rem', margin: 0 }}>
              {calculationData.alarms.map((alarm) => (
                <li key={alarm.index}>
                  Punto {alarm.index}: {alarm.message} ({alarm.value.toFixed(1)} PSI)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div>
        {calculationData ? (
          <>
            <TraceSummary calculation={calculationData} />
            <div style={{ height: '1rem' }} />
            <TraceMap calculation={calculationData} />
          </>
        ) : (
          <div className="panel-card">
            <p className="panel-heading">Resultados aparecerán aquí</p>
            <p className="helper-text">Sube un KMZ válido y completa los parámetros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewProjectPage;
