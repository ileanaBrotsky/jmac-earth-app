/**
 * Auth DTOs (Data Transfer Objects)
 * Para request/response de autenticación
 */

/**
 * DTO para registro de usuario
 * Request: POST /api/v1/auth/register
 */
export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string; // Para validar coincidencia
}

/**
 * DTO para login
 * Request: POST /api/v1/auth/login
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * DTO para response de autenticación exitosa
 * Response: 200
 */
export interface AuthResponseDto {
  success: true;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number; // En segundos
    };
  };
}

/**
 * DTO para response de error de autenticación
 * Response: 400, 401, 409
 */
export interface AuthErrorResponseDto {
  success: false;
  error: string;
  code?: string; // Código de error específico (EMAIL_DUPLICATE, INVALID_CREDENTIALS, etc)
}

/**
 * DTO para refresh token
 * Request: POST /api/v1/auth/refresh
 */
export interface RefreshTokenDto {
  refreshToken: string;
}

/**
 * DTO para logout
 * Request: POST /api/v1/auth/logout
 */
export interface LogoutDto {
  refreshToken: string; // Para invalidar el token en la DB
}

/**
 * JWT Claims para el token
 * Se decodifica en el middleware
 */
export interface JwtPayload {
  sub: string;           // User ID (subject)
  email: string;
  username: string;
  role: string;
  iat: number;           // Issued at
  exp: number;           // Expiration
  type: 'access' | 'refresh';
}
