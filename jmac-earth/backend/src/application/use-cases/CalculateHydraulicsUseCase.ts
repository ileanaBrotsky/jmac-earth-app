import { HydraulicCalculator, CalculationResult } from '@domain/services/HydraulicCalculator';
import { KMZParserService } from '@infrastructure/services/kmz/KMZParserService';
import { ElevationServiceFactory } from '@infrastructure/services/elevation/ElevationServiceFactory';
import { HydraulicParameters } from '@domain/value-objects/HydraulicParameters';
import { TracePoint } from '@domain/entities/TracePoint';
import { Coordinates } from '@domain/value-objects/Coordinates';
import { Elevation } from '@domain/value-objects/Elevation';

/**
 * CalculateHydraulicsUseCase
 * Orquestra el flujo stateless de cálculo hidráulico:
 * 1. Parsea archivo KMZ para extraer traza
 * 2. Obtiene elevaciones si es necesario (OpenTopoData)
 * 3. Aplica parámetros hidráulicos
 * 4. Ejecuta cálculo usando HydraulicCalculator
 * 5. Retorna resultado con bombas, válvulas y alarmas
 */
export class CalculateHydraulicsUseCase {
  private kmzParser: KMZParserService;
  private elevationService: ReturnType<typeof ElevationServiceFactory.create>;

  constructor() {
    this.kmzParser = new KMZParserService();
    this.elevationService = ElevationServiceFactory.create();
  }

  /**
   * Ejecuta cálculo hidráulico desde contenido KMZ y parámetros
   * @param kmzBuffer - Contenido del archivo KMZ (Buffer)
   * @param params - Parámetros hidráulicos
   * @returns Resultado de cálculo hidráulico
   * @throws Error si el KMZ es inválido, no hay elevaciones o cálculo falla
   */
  async execute(kmzBuffer: Buffer, params: HydraulicParameters): Promise<CalculationResult> {
    // 1. Validar que tenemos datos
    if (!kmzBuffer || kmzBuffer.length === 0) {
      throw new Error('CalculateHydraulicsUseCase: KMZ buffer vacío o indefinido');
    }
    if (!params) {
      throw new Error('CalculateHydraulicsUseCase: parámetros hidráulicos requeridos');
    }

    // 2. Parsear KMZ para extraer coordenadas y distancias
    let parseResult;
    try {
      parseResult = await this.kmzParser.parse(kmzBuffer);
      if (!parseResult.coordinates || parseResult.coordinates.length === 0) {
        throw new Error('No se encontraron coordenadas en el KMZ');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`CalculateHydraulicsUseCase: Error parseando KMZ: ${message}`);
    }

    // 3. Obtener elevaciones si no están en el KMZ
    const { coordinates } = parseResult;
    let elevations = coordinates.map(c => c.altitude || 0);
    
    if (!parseResult.hasElevations) {
      try {
        const coords = coordinates.map(c => Coordinates.create(c.latitude, c.longitude));
        const elevationsWithCoords = await this.elevationService.getElevations(coords);
        elevations = elevationsWithCoords.map(e => e.elevation);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        throw new Error(`CalculateHydraulicsUseCase: Error obteniendo elevaciones: ${message}`);
      }
    }

    // 4. Construir entidades TracePoint con distancias acumuladas
    const tracePoints: TracePoint[] = [];
    let accumulatedDistance = 0;

    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i]!;
      const elevation = elevations[i] || 0;

      try {
        const coordinates_vo = Coordinates.create(coord.latitude, coord.longitude);
        const elevation_vo = Elevation.fromMeters(elevation);

        if (i === 0) {
          tracePoints.push(TracePoint.createStart(coordinates_vo, elevation_vo));
        } else {
          // Calcular distancia desde punto anterior
          const prevCoord = coordinates[i - 1]!;
          const prevCoordinates = Coordinates.create(prevCoord.latitude, prevCoord.longitude);
          const distance = prevCoordinates.distanceTo(coordinates_vo);
          accumulatedDistance += distance;

          tracePoints.push(
            TracePoint.create({
              index: i,
              coordinates: coordinates_vo,
              elevation: elevation_vo,
              distanceFromStart_m: accumulatedDistance
            })
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        throw new Error(`CalculateHydraulicsUseCase: Error construyendo TracePoint en índice ${i}: ${message}`);
      }
    }

    // 5. Ejecutar cálculo hidráulico
    try {
      const result = HydraulicCalculator.calculate(tracePoints, params);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`CalculateHydraulicsUseCase: Error en cálculo hidráulico: ${message}`);
    }
  }
}

export default CalculateHydraulicsUseCase;
