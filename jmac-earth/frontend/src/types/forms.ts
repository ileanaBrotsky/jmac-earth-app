export interface ProjectFormValues {
  name: string;
  client?: string;
  description?: string;
  flowRate_m3h: number;
  flexiDiameter: '10' | '12';
  pumpingPressure_kgcm2: number;
  numberOfLines: number;
  calculationInterval_m: number;
}
