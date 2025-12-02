import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useForm } from 'react-hook-form';
import ParametersForm from '../ParametersForm';
import type { ProjectFormValues } from '@app/types/forms';

const Wrapper = () => {
  const form = useForm<ProjectFormValues>({
    defaultValues: {
      name: 'Proyecto demo',
      client: '',
      description: '',
      flowRate_m3h: 100,
      flexiDiameter: '10',
      pumpingPressure_kgcm2: 8,
      numberOfLines: 1,
      calculationInterval_m: 50
    }
  });

  return <ParametersForm register={form.register} errors={{}} />;
};

const ErrorWrapper = () => {
  const form = useForm<ProjectFormValues>({
    defaultValues: {
      name: '',
      client: '',
      description: '',
      flowRate_m3h: 0,
      flexiDiameter: '10',
      pumpingPressure_kgcm2: 0,
      numberOfLines: 0,
      calculationInterval_m: 0
    }
  });

  const errors = {
    name: { message: 'Nombre inválido' }
  };

  return <ParametersForm register={form.register} errors={errors as any} />;
};

describe('ParametersForm', () => {
  it('renders all fields', () => {
    render(<Wrapper />);

    expect(screen.getByLabelText(/Nombre del proyecto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Caudal total/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Diámetro flexi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Presión de bombeo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Líneas paralelas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Intervalo de cálculo/i)).toBeInTheDocument();
  });

  it('shows error messages when provided', () => {
    render(<ErrorWrapper />);
    expect(screen.getByText(/Nombre inválido/i)).toBeInTheDocument();
  });
});
