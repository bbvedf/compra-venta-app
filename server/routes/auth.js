// server/routes/auth.js
// Rutas del backend: qué URL existe y a qué función del controller llama

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { verifyToken } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

/**
 * Middleware para procesar errores de validación
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  console.log('Errores de validación:', errors.array());
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Registro
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email no válido').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
      .trim()
      .escape(),
    body('name').optional().trim().escape(),
  ],
  validate,
  authController.register,
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email no válido').normalizeEmail(),
    body('password').exists().withMessage('Contraseña requerida').trim().escape(),
  ],
  validate,
  authController.login,
);

// Login con Google
router.post('/google', authController.googleLogin);

// Logout
router.post('/logout', verifyToken, authController.logout);

// Recuperación de contraseña
router.post(
  '/reset-password',
  [body('email').isEmail().withMessage('Email no válido').normalizeEmail()],
  validate,
  authController.resetPasswordRequest,
);

router.post(
  '/new-password',
  [
    body('token').exists().withMessage('Token requerido').trim().escape(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
      .trim()
      .escape(),
  ],
  validate,
  authController.setNewPassword,
);

// Verificar token
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      isApproved: req.user.isApproved,
    },
  });
});

module.exports = router;
