// server/tests/unit/utils/logger.test.js
const logger = require('../../../utils/logger');

describe('logger utils', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('info llama a console.log con prefijo y timestamp', () => {
    const msg = 'Mensaje de info';
    logger.info(msg);
    expect(console.log).toHaveBeenCalledTimes(1);
    const callArgs = console.log.mock.calls[0];
    expect(callArgs[0]).toBe('[INFO]');
    expect(callArgs[1]).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO timestamp
    expect(callArgs).toContain(msg);
  });

  test('warn llama a console.warn con prefijo y timestamp', () => {
    const msg = 'Mensaje de advertencia';
    logger.warn(msg);
    expect(console.warn).toHaveBeenCalledTimes(1);
    const callArgs = console.warn.mock.calls[0];
    expect(callArgs[0]).toBe('[WARN]');
    expect(callArgs[1]).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(callArgs).toContain(msg);
  });

  test('error llama a console.error con prefijo y timestamp', () => {
    const msg = 'Mensaje de error';
    logger.error(msg);
    expect(console.error).toHaveBeenCalledTimes(1);
    const callArgs = console.error.mock.calls[0];
    expect(callArgs[0]).toBe('[ERROR]');
    expect(callArgs[1]).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(callArgs).toContain(msg);
  });
});
