module.exports = {
  testEnvironment: 'node',
  detectOpenHandles: true,
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
  collectCoverage: true, // activa coverage
    collectCoverageFrom: [
      "server/**/*.js", // incluye controladores, servicios, etc.
      "!server/index.js", // opcional: si index.js solo lanza el app
      "!server/db.js",    // opcional: excluir configuraciones
    ],
    coverageDirectory: "<rootDir>/coverage", // opcional, carpeta de resultados
};
