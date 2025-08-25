// server/middleware/metricsMiddleware.js
const { httpRequestCounter, httpRequestDurationMs, httpErrors } = require('../utils/metrics');

function metricsMiddleware(req, res, next) {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = diff[0] * 1000 + diff[1] / 1e6; // Convertir a ms

    httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
    httpRequestDurationMs.labels(req.method, req.path, res.statusCode).observe(durationMs);

    if (res.statusCode >= 500) {
      httpErrors.labels(req.method, req.path, res.statusCode).inc();
    }
  });

  next();
}

module.exports = metricsMiddleware;
