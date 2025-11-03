/**
 * =============================================================================
 * HTTP STATUS CODES CONSTANTS
 * =============================================================================
 * Códigos de estado HTTP estándar para respuestas del API.
 * 
 * Este archivo es parte de la CAPA COMPARTIDA (Shared Layer).
 * 
 * @module shared/constants/httpStatus
 * =============================================================================
 */

/**
 * HTTP Status Codes
 * @readonly
 * @enum {number}
 */
export const HTTP_STATUS = Object.freeze({
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
});

/**
 * Mensajes estándar por código de estado
 * @type {Object.<number, string>}
 */
export const HTTP_STATUS_MESSAGES = Object.freeze({
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
});

/**
 * Verifica si un código de estado es exitoso (2xx)
 * 
 * @param {number} statusCode - Código de estado HTTP
 * @returns {boolean} true si el código indica éxito
 * 
 * @example
 * isSuccessStatus(200) // true
 * isSuccessStatus(404) // false
 */
export const isSuccessStatus = (statusCode) => {
  return statusCode >= 200 && statusCode < 300;
};

/**
 * Verifica si un código de estado es de error del cliente (4xx)
 * 
 * @param {number} statusCode - Código de estado HTTP
 * @returns {boolean} true si es error del cliente
 */
export const isClientError = (statusCode) => {
  return statusCode >= 400 && statusCode < 500;
};

/**
 * Verifica si un código de estado es de error del servidor (5xx)
 * 
 * @param {number} statusCode - Código de estado HTTP
 * @returns {boolean} true si es error del servidor
 */
export const isServerError = (statusCode) => {
  return statusCode >= 500 && statusCode < 600;
};

export default HTTP_STATUS;
