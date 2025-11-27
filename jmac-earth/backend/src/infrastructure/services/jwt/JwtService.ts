import jwt from 'jsonwebtoken';
import { JwtPayload } from '@application/dtos/AuthDto';

/**
 * JwtService
 * Servicio para generar y validar JWT tokens
 * 
 * Responsabilidades:
 * - Generar access tokens (corta duración)
 * - Generar refresh tokens (larga duración)
 * - Validar tokens y extraer payload
 * - Manejar expiración de tokens
 */
export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: number; // En segundos
  private readonly refreshTokenExpiry: number; // En segundos

  constructor(
    accessTokenSecret: string = process.env.JWT_ACCESS_SECRET || 'access-secret-key',
    refreshTokenSecret: string = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
    accessTokenExpiry: number = 15 * 60, // 15 minutos por defecto
    refreshTokenExpiry: number = 7 * 24 * 60 * 60 // 7 días por defecto
  ) {
    this.accessTokenSecret = accessTokenSecret;
    this.refreshTokenSecret = refreshTokenSecret;
    this.accessTokenExpiry = accessTokenExpiry;
    this.refreshTokenExpiry = refreshTokenExpiry;
  }

  /**
   * Genera un access token
   * 
   * @param userId - ID del usuario
   * @param email - Email del usuario
   * @param username - Username del usuario
   * @param role - Rol del usuario
   * @returns Token JWT firmado
   * @throws Error si hay problema generando el token
   */
  generateAccessToken(
    userId: string,
    email: string,
    username: string,
    role: string
  ): string {
    try {
      const payload: JwtPayload = {
        sub: userId,
        email,
        username,
        role,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + this.accessTokenExpiry
      };

      return jwt.sign(payload, this.accessTokenSecret);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`JwtService: Error generando access token: ${message}`);
    }
  }

  /**
   * Genera un refresh token
   * 
   * @param userId - ID del usuario
   * @param email - Email del usuario
   * @param username - Username del usuario
   * @param role - Rol del usuario
   * @returns Token JWT firmado
   * @throws Error si hay problema generando el token
   */
  generateRefreshToken(
    userId: string,
    email: string,
    username: string,
    role: string
  ): string {
    try {
      const payload: JwtPayload = {
        sub: userId,
        email,
        username,
        role,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + this.refreshTokenExpiry
      };

      return jwt.sign(payload, this.refreshTokenSecret);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`JwtService: Error generando refresh token: ${message}`);
    }
  }

  /**
   * Valida un access token y extrae el payload
   * 
   * @param token - Token JWT a validar
   * @returns Payload decodificado
   * @throws Error si el token es inválido o está expirado
   */
  validateAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as JwtPayload;
      
      if (decoded.type !== 'access') {
        throw new Error('Token no es un access token');
      }
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('JwtService: Access token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(`JwtService: Access token inválido: ${error.message}`);
      }
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`JwtService: Error validando access token: ${message}`);
    }
  }

  /**
   * Valida un refresh token y extrae el payload
   * 
   * @param token - Token JWT a validar
   * @returns Payload decodificado
   * @throws Error si el token es inválido o está expirado
   */
  validateRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as JwtPayload;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Token no es un refresh token');
      }
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('JwtService: Refresh token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(`JwtService: Refresh token inválido: ${error.message}`);
      }
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`JwtService: Error validando refresh token: ${message}`);
    }
  }

  /**
   * Decodifica un token sin validar firma (solo para inspección)
   * ADVERTENCIA: Solo usar para debugging, no para validación
   * 
   * @param token - Token JWT
   * @returns Payload decodificado
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload | null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtiene el tiempo de expiración del access token en segundos
   */
  getAccessTokenExpiry(): number {
    return this.accessTokenExpiry;
  }

  /**
   * Obtiene el tiempo de expiración del refresh token en segundos
   */
  getRefreshTokenExpiry(): number {
    return this.refreshTokenExpiry;
  }
}

export default JwtService;
