// server/index.js
const logger = require('./utils/logger');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

/**
 * Middleware de seguridad
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Solo recursos propios
        scriptSrc: ["'self'", 'trusted.com'], // Ajusta según scripts externos
        styleSrc: ["'self'", "'unsafe-inline'"], // Ajusta según CSS externo
      },
    },
    crossOriginEmbedderPolicy: false, // Si hay problemas con CORS/iframes
  }),
);

app.use(cors()); // Configura según tus necesidades
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

/**
 * Rate Limiting
 */
// Limite global: 100 requests / 15 min por IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Has superado el límite de peticiones, intenta más tarde.',
});
app.use(globalLimiter);

// Limite específico para login: 5 intentos / 15 min por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login. Intenta de nuevo más tarde.',
});
app.use('/api/auth/login', loginLimiter);

/**
 * Rutas
 */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

/**
 * Exportar app para tests
 */
module.exports = app;

/**
 * Levantar servidor solo si NO estamos en modo test
 */
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => logger.info(`Servidor corriendo en https://ryzenpc.mooo.com:${PORT}`));
}
