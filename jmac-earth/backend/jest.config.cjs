module.exports = {
  // Preset para TypeScript
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: {
        types: ['jest', 'node']
      }
    }
  },
  
  // Directorios de tests
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  
  // Patrones de archivos de test
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Transform
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // Module paths (alineado con tsconfig.json)
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@interfaces/(.*)$': '<rootDir>/src/interfaces/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1'
  },
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/**/index.ts',
    '!src/shared/constants/httpStatus.ts',
     '!src/infrastructure/database/data-source.ts',
    '!src/infrastructure/database/database.helper.ts',
    '!src/infrastructure/database/entities/**',
    '!src/infrastructure/database/migrations/**',
    '!src/domain/repositories/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Thresholds de coverage (ajustables)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Timeout para tests
  testTimeout: 10000,
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Verbose output
  verbose: true
};
