module.exports = {
  verbose: true,
  testEnvironment: 'node',
  rootDir: '.', // rootDir es server/
  setupFiles: ['<rootDir>/tests/setupEnv.js'], // para .env.test

  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setupTestsUnit.js'],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setupTestsIntegration.js'],
    },
  ],

  moduleNameMapper: {
    '^nodemailer$': '<rootDir>/__mocks__/nodemailer.js',
    '^google-auth-library$': '<rootDir>/__mocks__/google-auth-library.js',
  },

  testPathIgnorePatterns: [
    '/node_modules/',
    '/.vscode-server/',
    '/.venv/',
    '/client/',
    '/login-roles/',
  ],

  detectOpenHandles: true,

  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js', // Cubre todos los .js en server/ y subdirectorios
    '!index.js', // Excluye server/index.js
    '!db.js', // Excluye server/db.js
    '!tests/**', // Excluye server/tests/
    '!__mocks__/**', // Excluye server/__mocks__/
    '!coverage/**', // Excluye server/coverage/
  ],
  coveragePathIgnorePatterns: ['/node_modules/', 'jest.config.js', 'eslint.config.js', 'debug.js'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['lcov', 'text', 'clover'],
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
};
