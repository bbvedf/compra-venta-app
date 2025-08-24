// server/tests/setupTestsUnit.js

// Aseguramos JWT secreto de test
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// Mock global de la base de datos
jest.mock('../db', () => ({
  query: jest.fn(async () => ({ rows: [], rowCount: 0 })),
}));

if (!/logger\.test\.js$/.test(expect.getState().testPath)) {
  // Espiar console solo para tests que no sean logger
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
}

afterEach(() => {
  jest.clearAllMocks();
});
