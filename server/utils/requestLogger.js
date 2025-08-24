//utils/requestLogger.js
//middleware para loguear requests HTTP en formato similar a Nginx
const fs = require('fs');
const path = require('path');

// Ruta absoluta dentro del contenedor
const logDir = path.join(__dirname, '../../logs/backend');
const logFile = path.join(logDir, 'requests.log');

// Crear carpeta si no existe
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function logRequest(req, res, next) {
  const now = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress || '-';
  const method = req.method;
  const url = req.originalUrl || req.url;
  const userAgent = req.headers['user-agent'] || '-';

  // Guardar el método original de res.end
  const originalEnd = res.end;

  // Sobreescribir res.end para capturar el código de estado
  res.end = function (...args) {
    const statusCode = res.statusCode;

    // Formato tipo Nginx con el código de estado
    const logLine = `${ip} - - [${now}] "${method} ${url} HTTP/${req.httpVersion}" ${statusCode} "${userAgent}"\n`;

    fs.appendFile(logFile, logLine, (err) => {
      if (err) {
        console.error('[RequestLogger] Error escribiendo log:', err);
      }
    });

    // Llamar al método original
    return originalEnd.apply(res, args);
  };

  next();
}

module.exports = logRequest;
