/**
 * =============================================================================
 * ESLint Configuration (Flat Config - ESLint 9+)
 * =============================================================================
 * Configuración de linting para mantener código limpio y consistente.
 * 
 * @see https://eslint.org/docs/latest/use/configure/
 * =============================================================================
 */

import js from '@eslint/js';

export default [
  // Configuración base recomendada de ESLint
  js.configs.recommended,
  
  {
    // Archivos a incluir
    files: ['src/**/*.js', 'tests/**/*.js'],
    
    // Configuración del lenguaje
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Globals de Node.js
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        
        // Globals de Jest (para tests)
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    
    // Reglas personalizadas
    rules: {
      // Mejores prácticas
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      
      // Estilo
      'indent': ['error', 2],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      
      // ES6+
      'prefer-const': 'error',
      'no-var': 'error',
      'arrow-spacing': 'error',
      'template-curly-spacing': ['error', 'never']
    }
  },
  
  {
    // Ignorar estos archivos
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'build/**',
      '*.config.js'
    ]
  }
];
