module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTestDB.js'],
  testMatch: ["<rootDir>/tests/**/*.test.js"], // apunta a la carpeta tests al mismo nivel que server
  moduleNameMapper: {
  '^nodemailer$': '<rootDir>/__mocks__/nodemailer.js',
  '^google-auth-library$': '<rootDir>/__mocks__/google-auth-library.js',
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.vscode-server/",
    "/.venv/",
    "/client/",
    "/login-roles/"
  ],
};
