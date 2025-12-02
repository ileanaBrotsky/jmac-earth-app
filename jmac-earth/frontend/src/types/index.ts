export interface PointResult {
  index: number;
  distance_m: number;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lon?: number;
  elevation_m: number;
  K?: number;
  M?: number;
  N?: number;
  O?: number;
  P?: number;
}

export interface TraceData {
  id?: string;
  totalDistance_m: number;
  pointCount: number;
  elevationProfile?: {
    min_m: number;
    max_m: number;
    start_m: number;
    end_m: number;
    difference_m: number;
  };
  points: PointResult[];
}

export interface CalculationSummary {
  totalDistance_km: number;
  elevationDifference_m: number;
  totalPumps: number;
  totalValves: number;
}

export interface CalculationResponse {
  points?: PointResult[];
  trace?: TraceData;
  pumps: PointResult[];
  valves: PointResult[];
  alarms: Array<{
    type: string;
    index: number;
    distance_m: number;
    value: number;
    message: string;
  }>;
  warnings: Array<{ type: string; message: string }>;
  summary: CalculationSummary;
}

export interface ProjectSummary {
  id: string;
  name: string;
  client?: string;
  description?: string;
  status: string;
  traceDistance_km?: number;
  elevationDifference_m?: number;
  hasParameters?: boolean;
  elevationSource: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessProjectResponse {
  success: boolean;
  data?: {
    project: ProjectSummary;
    calculation: CalculationResponse;
  };
  project?: ProjectSummary;
  calculation?: CalculationResponse;
}

export interface ProjectsListResponse {
  data?: ProjectSummary[];
  projects?: ProjectSummary[];
}
