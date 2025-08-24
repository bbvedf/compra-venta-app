// utils/bannedIP.js
const fs = require('fs');
const path = require('path');
const db = require('../db'); // tu pool de postgres

const logDir = path.join(__dirname, '../../logs/backend');
const logFile = path.join(logDir, 'requests.log');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuración de la “política de ban”
const MAX_RETRY = 5; // nº de fallos permitidos
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const BAN_TIME = 60 * 60 * 1000; // 1 hora

// Map en memoria para contar fallos recientes por IP
const failedIPs = new Map();

async function bannedIP(req, res, next) {
  // Usar X-Forwarded-For si existe (útil para tests)
  const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || '-';

  try {
    // 1. Verificar si ya está baneada en DB
    const { rows } = await db.query(
      'SELECT ban_until FROM banned_ips WHERE ip_address = $1 ORDER BY ban_until DESC LIMIT 1',
      [ip],
    );

    if (rows.length > 0 && rows[0].ban_until > new Date()) {
      res.status(403).send('Your IP is temporarily banned.');
      return;
    }

    // 2. Capturar la respuesta para revisar el statusCode
    const originalEnd = res.end;

    res.end = async function (...args) {
      const statusCode = res.statusCode;
      const now = Date.now(); // mover aquí para que cambie en cada request

      // Solo consideramos fallos (401, 403, 500, 503)
      if ([401, 403, 500, 503].includes(statusCode)) {
        const entry = failedIPs.get(ip) || { fails: [] };

        // Limpiar fallos viejos fuera de la ventana de tiempo
        entry.fails = entry.fails.filter((ts) => now - ts < WINDOW_MS);
        entry.fails.push(now);

        // Verificar si supera MAX_RETRY
        if (entry.fails.length >= MAX_RETRY) {
          const bannedUntil = new Date(now + BAN_TIME);

          // Insertar ban en DB
          await db.query(
            'INSERT INTO banned_ips (ip_address, banned_at, ban_until) VALUES ($1, NOW(), $2)',
            [ip, bannedUntil],
          );

          // Log de ban en requests.log
          // Formato tipo Nginx, con “BAN” en el statusCode y método/URL genéricos
          const logLine = `${ip} - - [${new Date().toISOString()}] "BAN / - HTTP/1.1" 403 "-" (fails=${entry.fails.length})\n`;
          fs.appendFile(logFile, logLine, (err) => {
            if (err) console.error('[BannedIP] Error escribiendo log:', err);
          });

          failedIPs.delete(ip);
        } else {
          failedIPs.set(ip, entry);
        }
      }

      return originalEnd.apply(res, args);
    };

    next();
  } catch (err) {
    console.error('[BannedIP] Error en middleware:', err);
    next();
  }
}

module.exports = bannedIP;
