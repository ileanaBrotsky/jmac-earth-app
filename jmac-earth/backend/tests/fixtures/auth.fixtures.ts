/**
 * Test fixtures para autenticación
 */

export const testUsers = {
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
  },
  invalidEmails: [
    'invalid',
    'invalid@',
    '@invalid.com',
    'invalid@.com',
    ''
  ],
  invalidPasswords: [
    '',
    '123',          // Muy corta
    '1234567',      // 7 caracteres (menos de 8)
  ],
  invalidUsernames: [
    '',
    'ab',           // Muy corto (menos de 3)
    'a@b',          // Caracteres no permitidos
    'user@123',     // Caracteres especiales no permitidos
  ]
};

export const testTokens = {
  // Token expirado (creado con fecha pasada)
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  // Token inválido
  invalidToken: 'invalid.token.here',
  // Token sin Bearer
  noBearerToken: 'not-a-bearer-token'
};
