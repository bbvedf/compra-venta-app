// server/routes/auth.js
// Rutas del backend: qué URL existe y a qué función del controller llama

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { verifyToken } = require('../middleware/authMiddleware');

// Registro y login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Login con Google
router.post('/google', authController.googleLogin);

// Logout
router.post('/logout', verifyToken, authController.logout);

// Recuperación de contraseña
router.post('/reset-password', authController.resetPasswordRequest);
router.post('/new-password', authController.setNewPassword);

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
