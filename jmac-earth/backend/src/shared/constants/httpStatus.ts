/**
 * =============================================================================
 * HTTP STATUS CODES CONSTANTS
 * =============================================================================
 * Códigos de estado HTTP estándar para respuestas del API.
 * 
 * Este archivo es parte de la CAPA COMPARTIDA (Shared Layer).
 * Convertido a TypeScript para mayor type-safety.
 * 
 * @module shared/constants/httpStatus
 * =============================================================================
 */

/**
 * HTTP Status Codes
 * Objeto inmutable con todos los códigos HTTP utilizados en la aplicación
 * 
 * @readonly
 * @const
 */
export const HTTP_STATUS = {
  // 2xx: Success
  OK: 200,                    // GET exitoso
  CREATED: 201,               // POST exitoso (recurso creado)
  NO_CONTENT: 204,            // DELETE exitoso (sin contenido)
  
  // 4xx: Client Errors
  BAD_REQUEST: 400,           // Request inválido
  UNAUTHORIZED: 401,          // No autenticado
  FORBIDDEN: 403,             // No autorizado (sin permisos)
  NOT_FOUND: 404,             // Recurso no encontrado
  CONFLICT: 409,              // Conflicto (ej: email duplicado)
  UNPROCESSABLE_ENTITY: 422,  // Validación fallida
  TOO_MANY_REQUESTS: 429,     // Rate limit excedido
  
  // 5xx: Server Errors
  INTERNAL_SERVER_ERROR: 500, // Error interno del servidor
  SERVICE_UNAVAILABLE: 503    // Servicio no disponible
} as const;

/**
 * Tipo que representa cualquier código de estado HTTP válido en nuestra aplicación
 * Deriva automáticamente del objeto HTTP_STATUS
 */
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

/**
 * Tipo para las claves de HTTP_STATUS
 */
export type HttpStatusKey = keyof typeof HTTP_STATUS;

/**
 * Mensajes estándar por código de estado
 * Mapeo type-safe entre códigos y mensajes
 * 
 * @readonly
 * @const
 */
export const HTTP_STATUS_MESSAGES: Record<HttpStatusCode, string> = {
  [HTTP_STATUS.OK]: 'Success',
  [HTTP_STATUS.CREATED]: 'Resource created successfully',
  [HTTP_STATUS.NO_CONTENT]: 'Resource deleted successfully',
  [HTTP_STATUS.BAD_REQUEST]: 'Bad request',
  [HTTP_STATUS.UNAUTHORIZED]: 'Unauthorized - Authentication required',
  [HTTP_STATUS.FORBIDDEN]: 'Forbidden - Insufficient permissions',
  [HTTP_STATUS.NOT_FOUND]: 'Resource not found',
  [HTTP_STATUS.CONFLICT]: 'Resource conflict',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Validation failed',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too many requests',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service unavailable'
} as const;

/**
 * Verifica si un código de estado es exitoso (2xx)
 * 
 * @param {number} statusCode - Código de estado HTTP
 * @returns {boolean} true si el código indica éxito
 * 
 * @example
 * ```typescript
 * isSuccessStatus(200) // true
 * isSuccessStatus(404) // false
 * isSuccessStatus(HTTP_STATUS.OK) // true
 * ```
 */
export const isSuccessStatus = (statusCode: number): boolean => {
  return statusCode >= 200 && statusCode < 300;
};

/**
 * Verifica si un código de estado es de error del cliente (4xx)
 * 
 * @param {number} statusCode - Código de estado HTTP
 * @returns {boolean} true si es error del cliente
 * 
 * @example
 * ```typescript
 * isClientError(404) // true
 * isClientError(500) // false
 * isClientError(HTTP_STATUS.NOT_FOUND) // true
 * ```
 */
export const isClientError = (statusCode: number): boolean => {
  return statusCode >= 400 && statusCode < 500;
};

/**
 * Verifica si un código de estado es de error del servidor (5xx)
 * 
 * @param {number} statusCode - Código de estado HTTP
 * @returns {boolean} true si es error del servidor
 * 
 * @example
 * ```typescript
 * isServerError(500) // true
 * isServerError(404) // false
 * isServerError(HTTP_STATUS.INTERNAL_SERVER_ERROR) // true
 * ```
 */
export const isServerError = (statusCode: number): boolean => {
  return statusCode >= 500 && statusCode < 600;
};

/**
 * Obtiene el mensaje asociado a un código de estado
 * Si el código no está en nuestro mapeo, retorna un mensaje genérico
 * 
 * @param {number} statusCode - Código de estado HTTP
 * @returns {string} Mensaje descriptivo del código de estado
 * 
 * @example
 * ```typescript
 * getStatusMessage(200) // 'Success'
 * getStatusMessage(404) // 'Resource not found'
 * getStatusMessage(999) // 'Unknown status'
 * ```
 */
export const getStatusMessage = (statusCode: number): string => {
  return HTTP_STATUS_MESSAGES[statusCode as HttpStatusCode] || 'Unknown status';
};

/**
 * Verifica si un número es un código de estado HTTP válido de nuestra aplicación
 * 
 * @param {number} statusCode - Código a verificar
 * @returns {boolean} true si es un código válido
 * 
 * @example
 * ```typescript
 * isValidStatusCode(200) // true
 * isValidStatusCode(999) // false
 * ```
 */
export const isValidStatusCode = (statusCode: number): statusCode is HttpStatusCode => {
  return (Object.values(HTTP_STATUS) as number[]).includes(statusCode);
};

/**
 * Export por defecto del objeto HTTP_STATUS
 * Permite importar como: import HTTP_STATUS from './httpStatus'
 */
export default HTTP_STATUS;