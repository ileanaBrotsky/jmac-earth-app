import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { HydraulicsController } from '@interfaces/controllers/HydraulicsController';
import { MulterRequest } from '@infrastructure/middleware/multer.types';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

/**
 * Hydraulics Routes
 * Rutas para el módulo de cálculos hidráulicos
 * 
 * POST /api/v1/calculate - Calcula parámetros hidráulicos
 */

const router = Router();
const controller = new HydraulicsController();

// Configurar multer para archivos KMZ (sin almacenamiento en disco)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo
  },
  fileFilter: (_req: MulterRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Validar que sea archivo KMZ
    if (!file.originalname.toLowerCase().endsWith('.kmz')) {
      return cb(new Error('Solo archivos KMZ son permitidos'));
    }
    cb(null, true);
  }
});

/**
 * POST /api/v1/calculate
 * Calcula caudal y presión necesarios para un trazo KMZ
 * 
 * Multipart form-data:
 * - file: archivo KMZ (requerido)
 * - flowRate_m3h: caudal en m³/h (requerido)
 * - flexiDiameter: diámetro manguera (10 o 12) (requerido)
 * - pumpingPressure_kgcm2: presión bombeo en kg/cm² (requerido)
 * - numberOfLines: número líneas paralelas (requerido)
 * - calculationInterval_m: intervalo cálculo en metros (requerido)
 * 
 * Response exitoso (200):
 * {
 *   "success": true,
 *   "data": {
 *     "pumps": [...],
 *     "valves": [...],
 *     "alarms": [...]
 *   }
 * }
 * 
 * Error (400):
 * {
 *   "success": false,
 *   "error": "Descripción del error"
 * }
 */
router.post('/calculate', upload.single('file'), 
  async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
      await controller.calculate(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Middleware de manejo de errores de multer
 */
router.use((error: any, _req: MulterRequest, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Archivo muy grande (máximo 50MB)'
      });
      return;
    }
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: `Error al procesar archivo: ${error.message}`
    });
    return;
  }
  
  if (error.message === 'Solo archivos KMZ son permitidos') {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: error.message
    });
    return;
  }
  
  next(error);
});

export default router;
