//server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../db');
const logger = require('../utils/logger');

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  //logger.info('Token recibido:', token);

  try {
    // 1. Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Verificar que el usuario existe y está aprobado
    const user = await pool.query(
      `SELECT 
                id, 
                email, 
                is_approved AS "isApproved",
                role 
             FROM users 
             WHERE id = $1`,
      [decoded.userId], // ¡Ahora decoded sí está definido!
    );

    if (user.rows.length === 0 || !user.rows[0].isApproved) {
      return res.status(401).json({ error: 'Usuario no aprobado o no existe' });
    }

    // 3. Adjuntar datos del usuario al request
    req.user = user.rows[0];
    next();
  } catch (err) {
    logger.error('Error en verifyToken:', err);
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

exports.checkApproved = async (req, res, next) => {
  try {
    const user = await pool.query('SELECT is_approved FROM users WHERE email = $1', [
      req.user.email,
    ]);

    if (!user.rows[0]?.is_approved) {
      return res.status(403).json({
        error: 'pending_approval',
        message: 'Contacta a pepito@gmail.com para acceso completo',
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar aprobación' });
  }
};

exports.isAdmin = async (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      error: 'forbidden',
      message: 'Se requieren privilegios de administrador',
    });
  }
  next();
};
