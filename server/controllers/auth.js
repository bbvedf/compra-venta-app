// Lógica de negocio: qué sucede cuando alguien se registra, inicia sesión, etc.
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendNewUserNotificationEmail } = require('../utils/emailSender');
const { OAuth2Client } = require('google-auth-library');
const eventTypes = require('../constants/eventTypes');
const userLogger = require('../utils/userLogger');
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'TU_CLIENT_ID';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const { sendPasswordResetEmail } = require('../utils/emailSender');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const logger = require('../utils/logger');


// Generar token JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};


exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password, is_approved, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, username, is_approved AS "isApproved", role`,
      [username, email, hashedPassword, false, 'basic']
    );

    await sendNewUserNotificationEmail({ username, email });
    await userLogger.logUserEvent(newUser.rows[0].id, eventTypes.SIGNUP_MANUAL, { email, requiresApproval: true });

    res.status(201).json({
      message: 'Registro exitoso. Espera aprobación.',
      email: newUser.rows[0].email,
      username: newUser.rows[0].username,
      requiresApproval: true
    });
  } catch (error) {
    logger.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(
      `SELECT id, email, username, password, is_approved AS "isApproved", role
       FROM users WHERE email = $1`,
      [email]
    );

    if (user.rows.length === 0) {
      await userLogger.logUserEvent(null, eventTypes.SUSPICIOUS_LOGIN, { email });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      await userLogger.logUserEvent(user.rows[0].id, eventTypes.FAILED_LOGIN, { email });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.rows[0].isApproved) {
      await userLogger.logUserEvent(user.rows[0].id, eventTypes.PENDING_APPROVAL_LOGIN, { email });
      return res.status(403).json({
        requiresApproval: true,
        email: user.rows[0].email,
        message: 'Cuenta pendiente de aprobación'
      });
    }

    const token = generateToken(user.rows[0]);
    await userLogger.logUserEvent(user.rows[0].id, eventTypes.LOGIN, { email });

    res.json({
      success: true,
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        username: user.rows[0].username,
        role: user.rows[0].role
      }
    });
  } catch (error) {
    logger.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};



exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || email.split('@')[0];

    let userResult = await pool.query(
      `SELECT id, email, username, is_approved AS "isApproved", role 
       FROM users WHERE email = $1`,
      [email]
    );

    let user;

    if (userResult.rows.length === 0) {
      const insertResult = await pool.query(
        `INSERT INTO users (username, email, password, role, is_approved)
         VALUES ($1, $2, '', 'basic', false)
         RETURNING id, email, username, is_approved AS "isApproved", role`,
        [name, email]
      );

      user = insertResult.rows[0];
      await sendNewUserNotificationEmail({ username: name, email });
      await userLogger.logUserEvent(user.id, eventTypes.SIGNUP_GOOGLE, { email });
    } else {
      user = userResult.rows[0];
    }

    if (!user.isApproved) {
      await userLogger.logUserEvent(user.id, eventTypes.PENDING_APPROVAL_LOGIN_GOOGLE, { email });
      return res.status(403).json({
        requiresApproval: true,
        email: user.email,
        userData: { email: user.email, username: user.username },
        message: 'Cuenta pendiente de aprobación'
      });
    }

    const jwtToken = generateToken(user);
    await userLogger.logUserEvent(user.id, eventTypes.LOGIN_GOOGLE, { email });

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Error en login con Google:', error);
    await userLogger.logUserEvent(null, eventTypes.FAILED_LOGIN_GOOGLE, { error: error.message });
    res.status(401).json({ error: 'Token de Google inválido' });
  }
};


// Logout
exports.logout = async (req, res) => {
  try {
    await userLogger.logUserEvent(req.user.id, eventTypes.LOGOUT, { email: req.user.email });
    res.json({ message: 'Sesión cerrada' });
  } catch (error) {
    logger.error('Error en logout:', error);
    res.status(500).json({ message: 'Error en logout' });
  }
};

// Enviar enlace de recuperación de contraseña
exports.resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      // Usuario no encontrado -> log de alerta
      await userLogger.logUserEvent(null, eventTypes.SUSPICIOUS_LOGIN, { email, action: 'reset_password' });
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const resetToken = jwt.sign(
      { userId: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetLink = `${FRONTEND_URL}/new-password/${resetToken}`;
    await sendPasswordResetEmail(email, resetLink);

    // Log del evento de solicitud de reset
    await userLogger.logUserEvent(user.rows[0].id, eventTypes.PASSWORD_RESET_REQUEST, { email });

    return res.json({ message: 'Enlace enviado al correo' });
  } catch (error) {
    logger.error('Error en /reset-password:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// Establecer nueva contraseña
exports.setNewPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, decoded.userId]
    );

    // Log del cambio de contraseña
    await userLogger.logUserEvent(decoded.userId, eventTypes.PASSWORD_RESET_SUCCESS, { action: 'new_password' });

    res.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    logger.error('Error en /new-password:', err);
    // Opcional: log de intento fallido de cambio de contraseña
    await userLogger.logUserEvent(null, eventTypes.FAILED_PASSWORD_CHANGE, { error: err.message });
    res.status(400).json({ error: 'Token inválido o expirado' });
  }
};