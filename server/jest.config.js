module.exports = {
  testEnvironment: 'node',
  rootDir: '.', // rootDir es server/
  detectOpenHandles: true,
  testMatch: ['<rootDir>/tests/**/*.test.js'],
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
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js', // Cubre todos los .js en server/ y subdirectorios
    '!index.js', // Excluye server/index.js
    '!db.js', // Excluye server/db.js
    '!tests/**', // Excluye server/tests/
    '!__mocks__/**', // Excluye server/__mocks__/
    '!coverage/**', // Excluye server/coverage/
    '!jest.config.js', // Excluye server/jest.config.js
  ],
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
  verbose: true,
};
