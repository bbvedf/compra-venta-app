// server/routes/healthz.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const logger = require('../utils/logger');

router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1'); // Comprobación simple DB
    logger.info(`Healthcheck OK - requestId: ${req.id}`);
    res.status(200).json({ status: 'ok', db: 'up' });
  } catch (err) {
    logger.error({ err, requestId: req.id }, 'Healthcheck FAIL');
    res.status(503).json({ status: 'error', db: 'down' });
  }
});

module.exports = router;
