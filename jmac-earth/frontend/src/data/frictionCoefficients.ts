export type FlexiDiameter = '10' | '12';

interface CoefficientRow {
  bpm: number;
  k: number;
}

// Reference table for BPM per line vs. friction coefficient.
// Valores tomados de ALGORITMO_HIDRAULICO_DOCUMENTADO.md (tabla Excel validada).
export const frictionTable: Record<FlexiDiameter, CoefficientRow[]> = {
  '10': [
    { bpm: 12, k: 0.069 },
    { bpm: 13, k: 0.082 },
    { bpm: 14, k: 0.09 },
    { bpm: 15, k: 0.112 },
    { bpm: 17, k: 0.129 },
    { bpm: 18, k: 0.151 },
    { bpm: 19, k: 0.168 },
    { bpm: 20, k: 0.19 },
    { bpm: 21, k: 0.212 },
    { bpm: 23, k: 0.233 },
    { bpm: 24, k: 0.26 },
    { bpm: 26, k: 0.311 },
    { bpm: 29, k: 0.367 },
    { bpm: 31, k: 0.429 },
    { bpm: 33, k: 0.498 },
    { bpm: 36, k: 0.558 },
    { bpm: 38, k: 0.636 },
    { bpm: 40, k: 0.718 },
    { bpm: 43, k: 0.797 },
    { bpm: 45, k: 0.887 },
    { bpm: 48, k: 0.978 },
    { bpm: 60, k: 1.56 },
    { bpm: 71, k: 2.2 },
    { bpm: 83, k: 2.97 }
  ],
  '12': [
    { bpm: 12, k: 0.026 },
    { bpm: 13, k: 0.03 },
    { bpm: 14, k: 0.039 },
    { bpm: 15, k: 0.048 },
    { bpm: 17, k: 0.056 },
    { bpm: 18, k: 0.065 },
    { bpm: 19, k: 0.074 },
    { bpm: 20, k: 0.082 },
    { bpm: 21, k: 0.091 },
    { bpm: 23, k: 0.1 },
    { bpm: 24, k: 0.113 },
    { bpm: 26, k: 0.13 },
    { bpm: 29, k: 0.152 },
    { bpm: 31, k: 0.173 },
    { bpm: 33, k: 0.199 },
    { bpm: 36, k: 0.229 },
    { bpm: 38, k: 0.26 },
    { bpm: 40, k: 0.377 },
    { bpm: 43, k: 0.325 },
    { bpm: 45, k: 0.359 },
    { bpm: 48, k: 0.398 },
    { bpm: 60, k: 0.628 },
    { bpm: 71, k: 0.887 },
    { bpm: 83, k: 1.19 }
  ]
};

export const interpolateCoefficient = (diameter: FlexiDiameter, bpmPerLine: number) => {
  const rows = frictionTable[diameter];
  if (!rows || rows.length === 0 || Number.isNaN(bpmPerLine)) {
    return { coefficient: null as number | null, message: 'Sin datos de coeficiente.' };
  }

  const sorted = [...rows].sort((a, b) => a.bpm - b.bpm);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  if (bpmPerLine < min.bpm) {
    return {
      coefficient: null,
      message: `El BPM por l\u00ednea (${bpmPerLine.toFixed(1)}) est\u00e1 por debajo del rango (${min.bpm}-${max.bpm}). Ajusta caudal o l\u00edneas.`
    };
  }

  if (bpmPerLine > max.bpm) {
    return {
      coefficient: null,
      message: `El BPM por l\u00ednea (${bpmPerLine.toFixed(1)}) supera el rango (${min.bpm}-${max.bpm}). Considera m\u00e1s l\u00edneas o menor caudal.`
    };
  }

  const exact = sorted.find((row) => row.bpm === bpmPerLine);
  if (exact) {
    return { coefficient: exact.k, message: null as string | null };
  }

  const nextIndex = sorted.findIndex((row) => row.bpm > bpmPerLine);
  const prev = sorted[nextIndex - 1];
  const next = sorted[nextIndex];

  const ratio = (bpmPerLine - prev.bpm) / (next.bpm - prev.bpm);
  const interpolated = prev.k + ratio * (next.k - prev.k);

  return { coefficient: Number(interpolated.toFixed(3)), message: null as string | null };
};
