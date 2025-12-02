import { Response, NextFunction } from 'express';
import { MulterRequest } from '@infrastructure/middleware/multer.types';
import { CalculateHydraulicsUseCase } from '@application/use-cases/CalculateHydraulicsUseCase';
import { HydraulicParameters, FlexiDiameter } from '@domain/value-objects/HydraulicParameters';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

/**
 * HydraulicsController
 * Maneja solicitudes HTTP para cálculos hidráulicos
 * - Valida entrada (archivo KMZ + parámetros)
 * - Ejecuta use-case
 * - Retorna JSON con resultado o errores HTTP
 */
export class HydraulicsController {
  private useCase: CalculateHydraulicsUseCase;

  constructor() {
    this.useCase = new CalculateHydraulicsUseCase();
  }

  /**
   * POST /api/v1/calculate
   * Calcula parámetros hidráulicos desde archivo KMZ y parámetros
   * 
   * Body (multipart/form-data):
   * - file: archivo KMZ (binary)
   * - flowRate_m3h: caudal en m³/h (number)
   * - flexiDiameter: diámetro de manguera (10 o 12 pulgadas)
   * - pumpingPressure_kgcm2: presión de bombeo en kg/cm² (number)
   * - numberOfLines: número de líneas paralelas (number)
   * - calculationInterval_m: intervalo de cálculo en metros (number)
   * 
   * Response (200):
   * {
   *   success: true,
   *   data: {
   *     pumps: [...],
   *     valves: [...],
   *     alarms: [...]
   *   }
   * }
   * 
   * Response (400):
   * { success: false, error: 'Descripción del error' }
   * 
   * Response (500):
   * { success: false, error: 'Error interno del servidor' }
   */
  async calculate(req: MulterRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Validar que file existe
      if (!req.file) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Archivo KMZ requerido'
        });
        return;
      }

      // 2. Validar y parsear parámetros del body
      const {
        flowRate_m3h,
        flexiDiameter,
        pumpingPressure_kgcm2,
        numberOfLines,
        calculationInterval_m
      } = req.body;

      // Validaciones básicas
      if (
        flowRate_m3h === undefined ||
        flexiDiameter === undefined ||
        pumpingPressure_kgcm2 === undefined ||
        numberOfLines === undefined ||
        calculationInterval_m === undefined
      ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Parámetros requeridos faltantes: flowRate_m3h, flexiDiameter, pumpingPressure_kgcm2, numberOfLines, calculationInterval_m'
        });
        return;
      }

      // Convertir a números y validar
      const flowRate = parseFloat(flowRate_m3h);
      const pressure = parseFloat(pumpingPressure_kgcm2);
      const lines = parseInt(numberOfLines, 10);
      const interval = parseFloat(calculationInterval_m);

      if (isNaN(flowRate) || isNaN(pressure) || isNaN(lines) || isNaN(interval)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Parámetros numéricos inválidos'
        });
        return;
      }

      // 3. Crear parámetros y ejecutar use-case
      try {
        const params = HydraulicParameters.create({
          flowRate_m3h: flowRate,
          flexiDiameter: flexiDiameter as FlexiDiameter,
          pumpingPressure_kgcm2: pressure,
          numberOfLines: lines,
          calculationInterval_m: interval
        });

        const result = await this.useCase.execute(req.file.buffer, params);

        // 4. Retornar resultado exitoso
        res.status(HTTP_STATUS.OK).json({
          success: true,
          data: {
            pumps: result.pumps,
            valves: result.valves,
            alarms: result.alarms
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido en validación de parámetros';
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: message
        });
      }
    } catch (error) {
      // Capturar error y pasar al middleware de error
      next(error);
    }
  }
}

export default HydraulicsController;
