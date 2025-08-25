// server/tests/unit/utils/userLogger.test.js
const { logUserEvent } = require('../../../utils/userLogger');
const db = require('../../../db');

jest.mock('../../../db', () => ({
  query: jest.fn(),
}));

describe('userLogger utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('logUserEvent inserta un evento con req completo', async () => {
    const userId = 1;
    const eventType = 'LOGIN';
    const details = { foo: 'bar' };
    const req = { ip: '127.0.0.1', headers: { 'user-agent': 'jest-agent' } };

    await logUserEvent(userId, eventType, details, req);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO users_logs'), [
      userId,
      eventType,
      req.ip,
      req.headers['user-agent'],
      details,
    ]);
  });

  test('logUserEvent inserta un evento sin req', async () => {
    const userId = 2;
    const eventType = 'LOGOUT';
    const details = {};

    await logUserEvent(userId, eventType, details);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO users_logs'), [
      userId,
      eventType,
      null,
      null,
      details,
    ]);
  });
});
