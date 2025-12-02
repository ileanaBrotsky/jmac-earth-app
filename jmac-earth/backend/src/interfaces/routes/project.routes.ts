import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ProjectController } from '@interfaces/controllers/ProjectController';
import { MulterRequest } from '@infrastructure/middleware/multer.types';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith('.kmz')) {
      return cb(new Error('Solo archivos KMZ son permitidos'));
    }

    cb(null, true);
  }
});

export const createProjectRoutes = (
  controller?: ProjectController
) => {
  const projectController = controller ?? new ProjectController();
  const router = Router();

  router.post('/projects', upload.single('file'), async (
    req: MulterRequest,
    res: Response,
    next: NextFunction
  ) => {
    await projectController.createProject(req, res, next);
  });

  router.get('/projects', async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    await projectController.listProjects(req, res, next);
  });

  router.get('/projects/:id', async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    await projectController.getProject(req, res, next);
  });

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

  return router;
};

export default createProjectRoutes();
