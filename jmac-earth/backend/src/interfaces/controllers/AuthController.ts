import { Response, NextFunction } from 'express';
import { MulterRequest } from '@infrastructure/middleware/multer.types';
import { RegisterUserUseCase } from '@application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '@application/use-cases/auth/LoginUserUseCase';
import { JwtService } from '@infrastructure/services/jwt/JwtService';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { AuthResponseDto, AuthErrorResponseDto, RegisterUserDto, LoginUserDto } from '@application/dtos/AuthDto';

/**
 * AuthController
 * Maneja solicitudes HTTP para autenticación
 * - Registro de usuarios
 * - Login
 * - Logout
 * - Refresh token
 * - Validación de credenciales
 */
export class AuthController {
  private registerUseCase: RegisterUserUseCase;
  private loginUseCase: LoginUserUseCase;
  private jwtService: JwtService;

  constructor(
    userRepository: IUserRepository,
    jwtService: JwtService = new JwtService()
  ) {
    this.registerUseCase = new RegisterUserUseCase(userRepository);
    this.loginUseCase = new LoginUserUseCase(userRepository);
    this.jwtService = jwtService;
  }

  /**
   * POST /api/v1/auth/register
   * Registra un nuevo usuario
   * 
   * Body:
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
  async register(
    req: MulterRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { username, email, password, confirmPassword } = req.body as RegisterUserDto;

      // 1. Validaciones básicas
      if (!username || !email || !password || !confirmPassword) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Todos los campos son requeridos: username, email, password, confirmPassword',
          code: 'MISSING_FIELDS'
        } as AuthErrorResponseDto);
        return;
      }

      if (password !== confirmPassword) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Las contraseñas no coinciden',
          code: 'PASSWORD_MISMATCH'
        } as AuthErrorResponseDto);
        return;
      }

      // 2. Ejecutar caso de uso
      const user = await this.registerUseCase.execute(username, email, password);

      // 3. Generar tokens
      const accessToken = this.jwtService.generateAccessToken(
        user.id,
        user.email,
        user.username,
        user.role
      );

      const refreshToken = this.jwtService.generateRefreshToken(
        user.id,
        user.email,
        user.username,
        user.role
      );

      const expiresIn = this.jwtService.getAccessTokenExpiry();

      // 4. Retornar respuesta
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn
          }
        }
      } as AuthResponseDto);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';

      // Password too short (specific message)
      if (message.includes('Password debe tener mínimo 8 caracteres')) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: message.replace('RegisterUserUseCase: ', ''),
          code: 'VALIDATION_ERROR',
          data: null
        } as AuthErrorResponseDto);
        return;
      }

      // Email/Password general validation errors
      if (message.includes('Email inválido') || message.includes('Password debe tener')) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: message.replace('RegisterUserUseCase: ', ''),
          code: 'VALIDATION_ERROR',
          data: null
        } as AuthErrorResponseDto);
        return;
      }

      // Username validation errors (length, characters)
      if (message.includes('Username debe tener al menos 3 caracteres') || message.includes('Username solo puede contener letras, números y guiones bajos')) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: message.replace('RegisterUserUseCase: ', ''),
          code: 'VALIDATION_ERROR',
          data: null
        } as AuthErrorResponseDto);
        return;
      }

      // Detectar errores específicos
      if (message.includes('Email ya está registrado')) {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: 'El email ya está registrado',
          code: 'EMAIL_DUPLICATE',
          data: null
        } as AuthErrorResponseDto);
        return;
      }

      if (message.includes('Username ya está en uso')) {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: 'El username ya está en uso',
          code: 'USERNAME_DUPLICATE',
          data: null
        } as AuthErrorResponseDto);
        return;
      }

      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Autentica un usuario
   * 
   * Body:
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
  async login(
    req: MulterRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body as LoginUserDto;

      // 1. Validaciones básicas
      if (!email || !password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Email y password son requeridos',
          code: 'MISSING_FIELDS'
        } as AuthErrorResponseDto);
        return;
      }

      // 2. Ejecutar caso de uso
      const user = await this.loginUseCase.execute(email, password);

      // 3. Generar tokens
      const accessToken = this.jwtService.generateAccessToken(
        user.id,
        user.email,
        user.username,
        user.role
      );

      const refreshToken = this.jwtService.generateRefreshToken(
        user.id,
        user.email,
        user.username,
        user.role
      );

      const expiresIn = this.jwtService.getAccessTokenExpiry();

      // 4. Retornar respuesta
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn
          }
        }
      } as AuthResponseDto);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';

      if (message.includes('Email o password incorrecto')) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Email o password incorrecto',
          code: 'INVALID_CREDENTIALS'
        } as AuthErrorResponseDto);
        return;
      }

      if (message.includes('Email inválido')) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: message.replace('LoginUserUseCase: ', ''),
          code: 'INVALID_EMAIL'
        } as AuthErrorResponseDto);
        return;
      }

      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Cierra sesión del usuario (invalida refresh token)
   * 
   * Body:
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
  async logout(
    req: MulterRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Refresh token es requerido',
          code: 'MISSING_TOKEN'
        } as AuthErrorResponseDto);
        return;
      }

      // En una aplicación con BD, aquí agregaríamos el token a una blacklist
      // Por ahora, solo validamos que sea un token válido
      try {
        this.jwtService.validateRefreshToken(refreshToken);
      } catch (error) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Refresh token inválido',
          code: 'INVALID_TOKEN'
        } as AuthErrorResponseDto);
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresca el access token usando un refresh token válido
   * 
   * Body:
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
  async refresh(
    req: MulterRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Refresh token es requerido',
          code: 'MISSING_TOKEN'
        } as AuthErrorResponseDto);
        return;
      }

      // Validar refresh token
      let payload;
      try {
        payload = this.jwtService.validateRefreshToken(refreshToken);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: message,
          code: 'INVALID_TOKEN'
        } as AuthErrorResponseDto);
        return;
      }

      // Generar nuevo access token
      const newAccessToken = this.jwtService.generateAccessToken(
        payload.sub,
        payload.email,
        payload.username,
        payload.role
      );

      const expiresIn = this.jwtService.getAccessTokenExpiry();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          accessToken: newAccessToken,
          expiresIn
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
