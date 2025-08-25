// server/tests/unit/utils/requestLogger.test.js
const logger = require('../../../utils/logger');

describe('logger utils - requestLogger', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'info');
    jest.spyOn(logger, 'warn');
    jest.spyOn(logger, 'error');
  });

  afterEach(() => {
    logger.info.mockRestore();
    logger.warn.mockRestore();
    logger.error.mockRestore();
  });

  test('logger.info escribe JSON con level info y msg', () => {
    const msg = 'Mensaje info';
    logger.info(msg);
    expect(logger.info).toHaveBeenCalledWith(msg);
  });

  test('logger.warn escribe JSON con level warn y msg', () => {
    const msg = 'Mensaje warn';
    logger.warn(msg);
    expect(logger.warn).toHaveBeenCalledWith(msg);
  });

  test('logger.error escribe JSON con level error y msg', () => {
    const msg = 'Mensaje error';
    logger.error(msg);
    expect(logger.error).toHaveBeenCalledWith(msg);
  });
});
