/**
 * Setup global para Jest
 */

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Aumentar timeout para tests de integración
jest.setTimeout(30000);