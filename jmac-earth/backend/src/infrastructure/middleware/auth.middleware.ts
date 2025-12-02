import { Response, NextFunction } from 'express';
import { MulterRequest } from './multer.types';
import { JwtService } from '@infrastructure/services/jwt/JwtService';
import { JwtPayload } from '@application/dtos/AuthDto';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

/**
 * Extiende MulterRequest para incluir usuario autenticado
 */
export interface AuthenticatedRequest extends MulterRequest {
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  token?: string;
}

/**
 * Middleware JWT
 * Valida el access token en el header Authorization
 * y adjunta la información del usuario al request
 * 
 * Formato esperado:
 * Authorization: Bearer <token>
 */
export const createAuthMiddleware = (jwtService: JwtService = new JwtService()) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // 1. Extraer token del header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Falta token de autenticación en header Authorization',
          code: 'MISSING_TOKEN'
        });
        return;
      }

      // 2. Validar formato "Bearer <token>"
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Formato de Authorization inválido. Use: Bearer <token>',
          code: 'INVALID_FORMAT'
        });
        return;
      }

      const token = parts[1];
      if (!token) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Token no proporcionado',
          code: 'MISSING_TOKEN'
        });
        return;
      }

      // 3. Validar token
      let payload: JwtPayload;
      try {
        payload = jwtService.validateAccessToken(token);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        
        if (message.includes('expirado')) {
          res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: 'Token expirado',
            code: 'TOKEN_EXPIRED'
          });
          return;
        }

        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: `Token inválido: ${message.replace('JwtService: ', '')}`,
          code: 'INVALID_TOKEN'
        });
        return;
      }

      // 4. Adjuntar usuario al request
      req.user = {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
        role: payload.role
      };
      req.token = token;

      // 5. Continuar al siguiente middleware
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: `Error en autenticación: ${message}`,
        code: 'AUTH_ERROR'
      });
    }
  };
};

/**
 * Middleware para verificar roles específicos
 * 
 * @param allowedRoles - Array de roles permitidos
 * @returns Middleware que valida el rol
 * 
 * @example
 * router.delete('/users/:id', authMiddleware, requireRole(['admin']), deleteUserController)
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: `Acceso denegado. Roles requeridos: ${allowedRoles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar permisos específicos
 * 
 * @param requiredPermissions - Array de permisos requeridos
 * @returns Middleware que valida permisos
 * 
 * @example
 * router.post('/projects', authMiddleware, requirePermission(['createProject']), createProjectController)
 */
export const requirePermission = (requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
      return;
    }

    // En una aplicación más compleja, aquí se consultaría una BD de permisos
    // Por ahora, solo hacemos validación básica de rol
    const rolePermissions: Record<string, string[]> = {
      admin: ['createUser', 'readUser', 'updateUser', 'deleteUser', 'createProject', 'readProject', 'readAllProjects', 'updateProject', 'deleteProject', 'assignProject', 'exportKMZ', 'exportPDF'],
      coordinator: ['createProject', 'readProject', 'readAllProjects', 'updateProject', 'deleteProject', 'assignProject', 'exportKMZ', 'exportPDF'],
      operator: ['readProject', 'exportKMZ', 'exportPDF']
    };

    const userPermissions = rolePermissions[req.user.role] || [];
    const hasAllPermissions = requiredPermissions.every(p => userPermissions.includes(p));

    if (!hasAllPermissions) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: 'Permisos insuficientes para realizar esta acción',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

export default createAuthMiddleware;
