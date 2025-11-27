import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';

import AppDataSource from '@infrastructure/database/data-source';
import createAuthRoutes from '@interfaces/routes/auth.routes';
import hydraulicsRoutes from '@interfaces/routes/hydraulics.routes';
import projectRoutes from '@interfaces/routes/project.routes';
import { TypeORMUserRepository } from '@infrastructure/repositories/TypeORMUserRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

dotenv.config();

const DEFAULT_PORT = 3000;
const DEFAULT_API_PREFIX = '/api/v1';
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000; // 60 seconds
const DEFAULT_RATE_LIMIT_MAX = 60;

export interface ServerDependencies {
  userRepository: IUserRepository;
}

export const createApp = (deps: ServerDependencies): Express => {
  const apiPrefix = process.env.API_PREFIX?.trim() || DEFAULT_API_PREFIX;
  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  const limiter = rateLimit({
    windowMs: DEFAULT_RATE_LIMIT_WINDOW_MS,
    max: DEFAULT_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  });

  const corsOptions = allowedOrigins.length > 0
    ? { origin: allowedOrigins, credentials: true }
    : { origin: true }; // allow all if not configured

  const app = express();
  app.set('trust proxy', 1);
  app.use(limiter);
  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(`${apiPrefix}/auth`, createAuthRoutes(deps.userRepository));
  app.use(`${apiPrefix}`, hydraulicsRoutes);
  app.use(`${apiPrefix}`, projectRoutes);

  app.get('/health', (_req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'JMAC Earth backend is running.'
    });
  });

  app.use((_req: Request, res: Response) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Endpoint no encontrado'
    });
  });

  app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = typeof error?.status === 'number'
      ? error.status
      : HTTP_STATUS.INTERNAL_SERVER_ERROR;

    const message = (error?.message as string)
      ?? 'Error interno del servidor';

    console.error('[UNHANDLED ERROR]', error);

    res.status(status).json({
      success: false,
      error: message
    });
  });

  return app;
};

const initializeDatabase = async (): Promise<void> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
};

export const startServer = async (): Promise<Express> => {
  await initializeDatabase();

  const userRepository = new TypeORMUserRepository();
  const app = createApp({ userRepository });

  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const server = app.listen(port, () => {
    console.log(`🚀 JMAC Earth backend listening on port ${port}`);
  });

  const gracefulShutdown = async (): Promise<void> => {
    console.log('🛑 Shutting down gracefully...');
    await AppDataSource.destroy();
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  return app;
};

if (require.main === module) {
  startServer().catch(error => {
    console.error('[STARTUP ERROR]', error);
    process.exit(1);
  });
}
