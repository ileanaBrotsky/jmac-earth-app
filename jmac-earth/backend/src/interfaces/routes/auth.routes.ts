import { Router, Response, NextFunction } from 'express';
import { AuthController } from '@interfaces/controllers/AuthController';
import { AuthenticatedRequest, createAuthMiddleware } from '@infrastructure/middleware/auth.middleware';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { JwtService } from '@infrastructure/services/jwt/JwtService';

/**
 * Auth Routes
 * Rutas para autenticación de usuarios
 * 
 * POST /api/v1/auth/register - Registrar nuevo usuario
 * POST /api/v1/auth/login - Iniciar sesión
 * POST /api/v1/auth/logout - Cerrar sesión
 * POST /api/v1/auth/refresh - Refrescar access token
 * GET /api/v1/auth/me - Obtener usuario actual (requiere autenticación)
 */

export const createAuthRoutes = (
  userRepository: IUserRepository,
  jwtService: JwtService = new JwtService()
) => {
  const router = Router();
  const controller = new AuthController(userRepository, jwtService);
  const authMiddleware = createAuthMiddleware(jwtService);

  /**
   * POST /api/v1/auth/register
   * Registra un nuevo usuario
   * 
   * Request:
   * {
   *   "username": "johndoe",
   *   "email": "john@example.com",
   *   "password": "SecurePass123!",
   *   "confirmPassword": "SecurePass123!"
   * }
   * 
   * Response (201):
   * {
   *   "success": true,
   *   "data": {
   *     "user": { id, username, email, role },
   *     "tokens": { accessToken, refreshToken, expiresIn }
   *   }
   * }
   */
  router.post('/register', async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    await controller.register(req, res, next);
  });

  /**
   * POST /api/v1/auth/login
   * Inicia sesión de un usuario
   * 
   * Request:
   * {
   *   "email": "john@example.com",
   *   "password": "SecurePass123!"
   * }
   * 
   * Response (200):
   * {
   *   "success": true,
   *   "data": {
   *     "user": { id, username, email, role },
   *     "tokens": { accessToken, refreshToken, expiresIn }
   *   }
   * }
   */
  router.post('/login', async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    await controller.login(req, res, next);
  });

  /**
   * POST /api/v1/auth/logout
   * Cierra sesión del usuario
   * Requiere autenticación
   * 
   * Request:
   * {
   *   "refreshToken": "token..."
   * }
   * 
   * Response (200):
   * {
   *   "success": true,
   *   "message": "Logout exitoso"
   * }
   */
  router.post('/logout', authMiddleware, async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    await controller.logout(req, res, next);
  });

  /**
   * POST /api/v1/auth/refresh
   * Refresca el access token
   * 
   * Request:
   * {
   *   "refreshToken": "token..."
   * }
   * 
   * Response (200):
   * {
   *   "success": true,
   *   "data": {
   *     "accessToken": "new_token",
   *     "expiresIn": 900
   *   }
   * }
   */
  router.post('/refresh', async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    await controller.refresh(req, res, next);
  });

  /**
   * GET /api/v1/auth/me
   * Obtiene información del usuario autenticado
   * Requiere autenticación
   * 
   * Response (200):
   * {
   *   "success": true,
   *   "data": {
   *     "user": { id, username, email, role }
   *   }
   * }
   */
  router.get('/me', authMiddleware, (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  });

  return router;
};

export default createAuthRoutes;
