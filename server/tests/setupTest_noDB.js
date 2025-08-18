// server/tests/setupTest_noDB.js
jest.mock('../db', () => ({
  query: jest.fn(async () => ({ rows: [], rowCount: 0 })),
}));
