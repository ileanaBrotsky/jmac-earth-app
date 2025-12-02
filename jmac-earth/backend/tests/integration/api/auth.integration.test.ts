import request from 'supertest';
import express, { Express } from 'express';
import { TypeORMUserRepository } from '@infrastructure/repositories/TypeORMUserRepository';
import createAuthRoutes from '@interfaces/routes/auth.routes';
import { HTTP_STATUS } from '@shared/constants/httpStatus';

/**
 * Test fixtures
 */
const testUsers = {
  validUser: {
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!'
  },
  anotherUser: {
    username: 'janedoe',
    email: 'jane.doe@example.com',
    password: 'SecurePass456!',
    confirmPassword: 'SecurePass456!'
  }
};

/**
 * Auth Integration Tests
 * 
 * Tests de integración para el sistema de autenticación:
 * - Registro de usuarios
 * - Validación de credenciales
 * - Generación de JWT tokens
 * - Refresh token
 * - Logout
 * - Middleware de protección
 */

import AppDataSource from '@infrastructure/database/data-source';

describe('Auth Integration Tests', () => {
  let app: Express;
  let userRepository: TypeORMUserRepository;

  beforeAll(async () => {
    // Inicializar TypeORM DataSource para tests
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      // Opcional: limpiar/sincronizar la base de datos de test
      await AppDataSource.synchronize(true); // Borra y recrea tablas
    }

    // Crear aplicación Express
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Inicializar repositorio
    userRepository = new TypeORMUserRepository();

    // Registrar rutas
    app.use('/api/v1/auth', createAuthRoutes(userRepository));

    // Middleware de error global
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, _req: any, res: any, _next: any) => {
      console.error('Error:', err.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message || 'Error interno del servidor'
      });
    });
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/v1/auth/register', () => {
    /**
     * Test 1: Registro exitoso
     */
    it('should successfully register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUsers.validUser);

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBeDefined();
      expect(response.body.data.user.username).toBe(testUsers.validUser.username);
      expect(response.body.data.user.email).toBe(testUsers.validUser.email);
      expect(response.body.data.user.role).toBe('operator');
      
      // Validar tokens
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.tokens.expiresIn).toBeGreaterThan(0);
    });

    /**
     * Test 2: Email duplicado
     */
    it('should return 409 when email is already registered', async () => {
      // Registrar primer usuario
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUsers.validUser);

      // Intentar registrar con el mismo email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'different_username',
          email: testUsers.validUser.email,
          password: testUsers.validUser.password,
          confirmPassword: testUsers.validUser.password
        });

      expect(response.status).toBe(HTTP_STATUS.CONFLICT);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('email ya está registrado');
      expect(response.body.code).toBe('EMAIL_DUPLICATE');
    });

    /**
     * Test 3: Username duplicado
     */
    it('should return 409 when username is already taken', async () => {
      // Registrar primer usuario
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUsers.validUser);

      // Intentar registrar con el mismo username
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: testUsers.validUser.username,
          email: 'different@example.com',
          password: testUsers.validUser.password,
          confirmPassword: testUsers.validUser.password
        });

      expect(response.status).toBe(HTTP_STATUS.CONFLICT);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('username ya está en uso');
      expect(response.body.code).toBe('USERNAME_DUPLICATE');
    });

    /**
     * Test 4: Campos faltantes
     */
    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'johndoe'
          // Falta email, password, confirmPassword
        });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requeridos');
    });

    /**
     * Test 5: Passwords no coinciden
     */
    it('should return 400 when passwords do not match', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'Password123!',
          confirmPassword: 'Different123!'
        });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('no coinciden');
      expect(response.body.code).toBe('PASSWORD_MISMATCH');
    });

    /**
     * Test 6: Email inválido
     */
    it('should return 400 when email format is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'johndoe',
          email: 'invalid-email',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('inválido');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    /**
     * Test 7: Password muy corto
     */
    it('should return 400 when password is too short', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'johndoe',
          email: 'john@example.com',
          password: '123',
          confirmPassword: '123'
        });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('mínimo');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    /**
     * Test 8: Username muy corto
     */
    it('should return 400 when username is too short', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'ab',
          email: 'john@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('3 caracteres');
    });

    /**
     * Test 9: Username con caracteres inválidos
     */
    it('should return 400 when username contains invalid characters', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'user@123',
          email: 'john@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    /**
     * Test 10: Login exitoso
     */
    it('should successfully login with valid credentials', async () => {
      // Primero registrar el usuario
      await request(app)
        .post('/api/v1/auth/register')
        .send(testUsers.anotherUser);

      // Luego hacer login
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUsers.anotherUser.email,
          password: testUsers.anotherUser.password
        });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUsers.anotherUser.email);
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    /**
     * Test 11: Password incorrecto
     */
    it('should return 401 with incorrect password', async () => {
      // Registrar usuario
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Correct123!',
          confirmPassword: 'Correct123!'
        });

      // Intentar login con password incorrecto
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Wrong123!'
        });

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('incorrecto');
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    /**
     * Test 12: Usuario no existe
     */
    it('should return 401 when user does not exist', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('incorrecto');
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    /**
     * Test 13: Campos faltantes
     */
    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com'
          // Falta password
        });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requeridos');
      expect(response.body.code).toBe('MISSING_FIELDS');
    });

    /**
     * Test 14: Email inválido
     */
    it('should return 400 when email format is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123!'
        });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_EMAIL');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    /**
     * Test 15: Obtener usuario autenticado
     */
    it('should return current user when authenticated', async () => {
      // Registrar y obtener token
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'meuser',
          email: 'me@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      const { accessToken } = registerResponse.body.data.tokens;

      // Llamar /me con token
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('me@example.com');
      expect(response.body.data.user.username).toBe('meuser');
    });

    /**
     * Test 16: Sin token
     */
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });

    /**
     * Test 17: Token inválido
     */
    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_TOKEN');
    });

    /**
     * Test 18: Formato Authorization incorrecto
     */
    it('should return 401 with invalid Authorization header format', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_FORMAT');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    /**
     * Test 19: Refresh token exitoso
     */
    it('should generate new access token with valid refresh token', async () => {
      // Registrar usuario
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'refreshuser',
          email: 'refresh@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      const { refreshToken } = registerResponse.body.data.tokens;

      // Refrescar token
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.expiresIn).toBeGreaterThan(0);
    });

    /**
     * Test 20: Refresh token inválido
     */
    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.token' });

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_TOKEN');
    });

    /**
     * Test 21: Refresh token faltante
     */
    it('should return 400 when refresh token is not provided', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('MISSING_TOKEN');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    /**
     * Test 22: Logout exitoso
     */
    it('should successfully logout with valid refresh token', async () => {
      // Registrar usuario
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'logoutuser',
          email: 'logout@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      const { refreshToken, accessToken } = registerResponse.body.data.tokens;

      // Logout
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logout');
    });

    /**
     * Test 23: Logout sin autenticación
     */
    it('should return 401 when logout without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: 'some-token' });

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Response Format Validation', () => {
    /**
     * Test 24: Estructura de respuesta exitosa
     */
    it('should return standardized success response format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUsers.validUser);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
      expect(response.body.data.tokens).toHaveProperty('expiresIn');
    });

    /**
     * Test 25: Estructura de respuesta de error
     */
    it('should return standardized error response format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code');
    });

    /**
     * Test 26: Content-Type application/json
     */
    it('should return application/json content type', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUsers.validUser);

      expect(response.type).toMatch(/json/);
    });
  });
});
