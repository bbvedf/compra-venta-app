const bannedIP = require('../../../utils/bannedIP');
const db = require('../../../db');
const fs = require('fs');

jest.mock('fs');
jest.mock('../../../db', () => ({
  query: jest.fn(),
}));

describe('bannedIP middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      ip: '1.2.3.4',
    };
    res = {
      statusCode: 401,
      end: jest.fn(),
    };
    next = jest.fn();

    fs.appendFile.mockImplementation((file, data, cb) => cb(null));
    db.query.mockReset();
  });

  it('permite pasar si IP no está baneada', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    await bannedIP(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('bloquea si IP está baneada en DB', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ ban_until: new Date(Date.now() + 60 * 1000) }],
    });

    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();

    await bannedIP(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Your IP is temporarily banned.');
    expect(next).not.toHaveBeenCalled();
  });

  it('inserta ban en DB y escribe log tras superar fallos', async () => {
    db.query.mockResolvedValue({ rows: [] });

    // Llamamos varias veces para superar MAX_RETRY
    for (let i = 0; i < 6; i++) {
      await bannedIP(req, res, next);
      await res.end(); // simula terminar la respuesta
    }

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO banned_ips'),
      expect.any(Array),
    );
    expect(fs.appendFile).toHaveBeenCalledWith(
      expect.stringContaining('requests.log'),
      expect.stringContaining('BAN'),
      expect.any(Function),
    );
  });
});
