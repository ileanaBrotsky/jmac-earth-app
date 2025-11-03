/**
 * Setup global para Jest
 * 
 * Este archivo se ejecuta antes de todos los tests.
 * Aquí configuramos:
 * - Variables de entorno para testing
 * - Mocks globales
 * - Timeouts
 * - Configuración de base de datos de prueba
 */

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_DATABASE = 'jmac_earth_test';

// Aumentar timeout para tests de integración
jest.setTimeout(30000);

// Mock de console para tests más limpios (opcional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
