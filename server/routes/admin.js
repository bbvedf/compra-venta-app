// server/routes/admin.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { Router } = express;
const router = Router();
const pool = require('../db');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  sendUserApprovedEmail,
  sendUserRejectedEmail,
  sendCalculationEmail,
  sendMortgageEmail,
} = require('../utils/emailSender');
const logger = require('../utils/logger');

// ---------------- Rate Limiters ----------------
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 requests por IP en 15 minutos
  message: 'Demasiadas solicitudes desde esta IP, intenta más tarde.',
});

// ---------------- Middleware de validación ----------------
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ---------------- Rutas ----------------

/**
 * @route GET /api/admin/users
 * @desc Obtener todos los usuarios (solo admin)
 */
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        email,
        is_approved AS "isApproved",
        role,
        created_at AS "createdAt"
      FROM users
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    res.status(200).json({ users: result.rows });
  } catch (error) {
    logger.error('Error en GET /api/admin/users:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

/**
 * @route PATCH /api/admin/users/:id
 * @desc Actualizar usuario (solo admin)
 */
router.patch(
  '/users/:id',
  verifyToken,
  isAdmin,
  [
    param('id').isInt().withMessage('ID debe ser un número'),
    body('role').optional().isIn(['basic', 'admin']).withMessage('Rol inválido'),
    body('isApproved').optional().isBoolean().withMessage('isApproved debe ser booleano'),
  ],
  validate,
  async (req, res) => {
    const { id } = req.params;
    const { role, isApproved } = req.body;

    try {
      const currentUser = await pool.query('SELECT email, is_approved FROM users WHERE id = $1', [
        id,
      ]);
      if (currentUser.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const { email, is_approved: currentApprovalStatus } = currentUser.rows[0];

      await pool.query(
        `UPDATE users 
          SET 
            is_approved = COALESCE($1, is_approved),
            role = COALESCE($2, role)
          WHERE id = $3`,
        [isApproved, role, id],
      );

      if (isApproved !== undefined && isApproved !== currentApprovalStatus) {
        if (isApproved) {
          await sendUserApprovedEmail(email);
        } else {
          await sendUserRejectedEmail(email);
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  },
);

/**
 * @route DELETE /api/admin/users/:id
 * @desc Eliminar usuario (solo admin)
 */
router.delete(
  '/users/:id',
  verifyToken,
  isAdmin,
  [param('id').isInt().withMessage('ID debe ser un número')],
  validate,
  async (req, res) => {
    const { id } = req.params;
    try {
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      res.status(200).json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error) {
      logger.error('Error al eliminar usuario:', error);
      res
        .status(500)
        .json({ success: false, error: 'Error interno del servidor', details: error.message });
    }
  },
);

/**
 * @route POST /api/admin/send-calculation
 * @desc Enviar correo de cálculo
 */
router.post(
  '/send-calculation',
  verifyToken,
  isAdmin,
  emailLimiter,
  [body('chartDataUrl').optional().isString()],
  validate,
  async (req, res) => {
    try {
      const userEmail = req.user.email;
      const calculationData = req.body;
      await sendCalculationEmail(userEmail, calculationData, req.body.chartDataUrl);
      res.json({ message: 'Correo enviado correctamente' });
    } catch (err) {
      logger.error('Error enviando correo de cálculo:', err);
      res.status(500).json({ message: 'Error enviando el correo' });
    }
  },
);

/**
 * @route POST /api/admin/send-mortgage
 * @desc Enviar correo de hipoteca
 */
router.post(
  '/send-mortgage',
  verifyToken,
  isAdmin,
  emailLimiter,
  [body('chartDataUrl').optional().isString()],
  validate,
  async (req, res) => {
    try {
      const userEmail = req.user.email;
      const mortgageData = req.body;
      await sendMortgageEmail(userEmail, mortgageData);
      res.json({ message: 'Correo de hipoteca enviado correctamente' });
    } catch (err) {
      logger.error('Error enviando correo de hipoteca:', err);
      res.status(500).json({ message: 'Error enviando el correo' });
    }
  },
);

module.exports = router;
