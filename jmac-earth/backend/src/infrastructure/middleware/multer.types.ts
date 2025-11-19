import { Request } from 'express';

/**
 * MulterRequest
 * Extiende el tipo Request de Express para incluir file de multer
 * 
 * Uso:
 * - En controladores que reciben archivos
 * - El archivo se accede mediante req.file
 * - Para múltiples archivos: req.files (array)
 */
export interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export default MulterRequest;
