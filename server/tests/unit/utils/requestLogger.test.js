const requestLogger = require('../../../utils/requestLogger');
const fs = require('fs');

jest.mock('fs');

describe('requestLogger middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      ip: '9.8.7.6',
      method: 'GET',
      url: '/test',
      httpVersion: '1.1',
      headers: { 'user-agent': 'jest-test' },
    };
    res = {
      statusCode: 200,
      end: jest.fn(),
    };
    next = jest.fn();

    fs.appendFile.mockImplementation((file, data, cb) => cb(null));
  });

  it('logea request con statusCode 200', () => {
    requestLogger(req, res, next);

    res.end(); // simula cerrar la respuesta

    expect(fs.appendFile).toHaveBeenCalledWith(
      expect.stringContaining('requests.log'),
      expect.stringContaining('"GET /test HTTP/1.1" 200'),
      expect.any(Function),
    );
    expect(next).toHaveBeenCalled();
  });

  it('logea request con statusCode 404', () => {
    res.statusCode = 404;

    requestLogger(req, res, next);
    res.end();

    expect(fs.appendFile).toHaveBeenCalledWith(
      expect.stringContaining('requests.log'),
      expect.stringContaining('"GET /test HTTP/1.1" 404'),
      expect.any(Function),
    );
  });
});
