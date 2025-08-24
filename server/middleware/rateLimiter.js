// server/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // max intentos
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = (env) => (env === 'test' ? (req, res, next) => next() : loginLimiter);
