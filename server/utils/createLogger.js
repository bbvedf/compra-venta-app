// server/utils/createLogger.js
const pino = require('pino');
const rfs = require('rotating-file-stream');
const path = require('path');

/**
 * Crea un logger Pino con rotación + stdout
 * @param {string} logFile - nombre del archivo en logs/backend
 * @param {object} options - { interval, size, compress }
 * @returns {pino.Logger}
 */
function createLogger(logFile, options = {}) {
  const logDir = path.join(__dirname, '../logs/backend');

  // Rotating file stream
  const rotatingStream = rfs.createStream(logFile, {
    interval: options.interval || '1d', // rotación diaria
    size: options.size || '10M', // tamaño máximo por archivo
    path: logDir,
    compress: options.compress !== false ? 'gzip' : false,
  });

  return pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.multistream([{ stream: rotatingStream }, { stream: process.stdout }]),
  );
}

module.exports = createLogger;
