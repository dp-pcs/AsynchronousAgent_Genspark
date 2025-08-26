module.exports = {
  feature/spaced-repetition-flashcards
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/libs', '<rootDir>/apps'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/__tests__/**'
  ],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
=======
  projects: [
    '<rootDir>/apps/web',
    '<rootDir>/libs/shared'
  ],
  testEnvironment: 'node',
  
  // Deterministic test execution settings
  maxWorkers: 1, // Run tests sequentially for CI stability
  bail: false,   // Continue running tests even if some fail
  verbose: true,
  
  // Random seed for deterministic test ordering
  randomize: false,
  
  // Test timeout settings
  testTimeout: 10000,
  
  // Coverage settings (optional)
  collectCoverage: false,
  
  // Global setup/teardown for seeding
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
 main
};