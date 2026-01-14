// server/index.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const logger = require('./utils/logger');
const requestLogger = require('./utils/requestLogger');
const bannedIP = require('./utils/bannedIP');

if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();
}

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

// Confía en el primer proxy (para rate limiting y IP real)
app.set('trust proxy', 1);

/**
 * requestId + duración
 */
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-Id', req.id);
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    req.responseTime = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);
  });
  next();
});

app.use(requestLogger);

/**
 * Prometheus metrics
 */
const metricsMiddleware = require('./middleware/metricsMiddleware');
app.use(metricsMiddleware);

const { register } = require('./utils/metrics');
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});

/**
 * Seguridad y parsing
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'trusted.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use(bannedIP);

/**
 * Rate limiting
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Has superado el límite de peticiones, intenta más tarde.',
  skip: (req) =>
    req.path === '/metrics' ||
    req.path.startsWith('/api/auth/verify'),
});
app.use(globalLimiter);

const loginLimiter = require('./middleware/rateLimiter')(process.env.NODE_ENV);
app.use('/api/auth/login', loginLimiter);

/**
 * Rutas
 */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const healthzRoutes = require('./routes/healthz');
app.use('/healthz', healthzRoutes);

app.get('/api/error', (req, res) =>
  res.status(500).json({ error: 'Forzando error para Fail2Ban' }),
);

/**
 * Error handler
 */
app.use((err, req, res, _next) => {
  logger.error({ err, requestId: req.id }, 'Error no capturado');
  res.status(500).json({ error: 'Error interno' });
});

module.exports = app;

/**
 * Levantar servidor solo si no es test
 * Espera a DB usando db.js
 */
if (process.env.NODE_ENV !== 'test') {
  const pool = require('./db');

  const waitForPostgres = async (retries = 60, delayMs = 500) => {
    for (let i = 0; i < retries; i++) {
      try {
        await pool.query('SELECT 1');
        logger.info('✅ Postgres está listo');
        return;
      } catch {
        logger.info(`⏳ Esperando a Postgres... intento ${i + 1}`);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw new Error('❌ Postgres no respondió en el tiempo esperado');
  };

  waitForPostgres()
    .then(() => {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => logger.info(`Servidor corriendo en https://ryzenpc.mooo.com:${PORT}`));
    })
    .catch((err) => {
      logger.error(err, 'Error al conectar con la base de datos');
      process.exit(1);
    });
}
