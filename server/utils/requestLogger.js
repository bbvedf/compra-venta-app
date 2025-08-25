// server/utils/requestLogger.js
const pinoHttp = require('pino-http');
const createLogger = require('./createLogger');

const requestLoggerInstance = createLogger('request.log', {
  interval: '1d',
  size: '20M',
  compress: true,
});

const requestLogger = pinoHttp({
  logger: requestLoggerInstance,
  customLogLevel: (res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || '-',
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
  customSuccessMessage: (res) => {
    if (!res.req) return `Request inválida - ${res.statusCode}`;
    const duration = res.responseTime != null ? `${res.responseTime}ms` : '-';
    return `${res.req.method} ${res.req.url} - ${res.statusCode} [${duration}]`;
  },
  customErrorMessage: (error, res) => {
    const duration = res.responseTime != null ? `${res.responseTime}ms` : '-';
    return `${res.req.method} ${res.req.url} - ${res.statusCode} [${duration}] - ${error.message}`;
  },
  genReqId: (req) => req.headers['x-request-id'] || `${Date.now()}-${Math.random()}`,
});

module.exports = requestLogger;
