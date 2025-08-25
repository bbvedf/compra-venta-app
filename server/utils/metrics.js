// server/utils/metrics.js
const client = require('prom-client');

// Registro por defecto
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Contador de requests por endpoint y status
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Número total de requests HTTP',
  labelNames: ['method', 'endpoint', 'status'],
});

// Histograma de latencias en ms
const httpRequestDurationMs = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duración de requests HTTP en milisegundos',
  labelNames: ['method', 'endpoint', 'status'],
  buckets: [50, 100, 200, 500, 1000, 2000, 5000],
});

// Contador de errores 5xx
const httpErrors = new client.Counter({
  name: 'http_errors_total',
  help: 'Número de errores HTTP 5xx',
  labelNames: ['method', 'endpoint', 'status'],
});

register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDurationMs);
register.registerMetric(httpErrors);

module.exports = {
  register,
  httpRequestCounter,
  httpRequestDurationMs,
  httpErrors,
};
