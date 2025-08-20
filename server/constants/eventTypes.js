// server/constants/eventTypes.js
// Exporta los tipos de eventos para su uso en otros módulos

const eventTypes = {
  // --- Autenticación ---
  LOGIN: 'login', // usuario conocido y aprobado se logea correctamente vía credenciales normales
  LOGIN_GOOGLE: 'login_google', // usuario conocido y aprobado se logea correctamente vía Google
  LOGOUT: 'logout', // usuario cierra sesión correctamente
  FAILED_LOGIN: 'failed_login', // intento fallido de login con credenciales incorrectas (reservado para uso futuro)
  FAILED_LOGIN_GOOGLE: 'failed_google_login', // intento fallido de login vía Google (reservado para uso futuro)
  SUSPICIOUS_LOGIN: 'suspicious_login', // usuario desconocido o actividad sospechosa, posible spam o ataque
  PENDING_APPROVAL_LOGIN: 'pending_approval_login', // usuario registrado pero aún no aprobado intenta login vía credenciales normales
  PENDING_APPROVAL_LOGIN_GOOGLE: 'pending_approval_google_login', // usuario registrado pero aún no aprobado intenta login vía Google

  // --- Registro ---
  SIGNUP_GOOGLE: 'signup_google',
  SIGNUP_MANUAL: 'signup_manual',

  // --- Administración / Seguridad ---
  PASSWORD_RESET_REQUEST: 'password_reset_request', // solicitud de enlace para restablecer contraseña
  PASSWORD_RESET_SUCCESS: 'password_reset_success', // contraseña restablecida correctamente
  FAILED_PASSWORD_CHANGE: 'failed_password_change', // intento fallido de cambio de contraseña
  ACCOUNT_APPROVED: 'account_approved', // cuenta aprobada por administrador
  ACCOUNT_REJECTED: 'account_rejected', // cuenta rechazada por administrador
};

module.exports = eventTypes;
