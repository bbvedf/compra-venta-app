// server/utils/logger.js
const createLogger = require('./createLogger');

const logger = createLogger('app.log', {
  interval: '1d',
  size: '20M',
  compress: true,
});

module.exports = logger;
