const request = require('supertest');
const index = require('../../index'); // app principal
const pool = require('../../db');
const jwt = require('jsonwebtoken');
const eventTypes = require('../../constants/eventTypes'); // ruta correcta
const { OAuth2Client } = require('google-auth-library');

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('google-auth-library'); // carga el mock de __mocks__

describe('Auth Flow Integration Test', () => {
  let testEmail;
  let testPassword = 'Test123!';
  let token;
  let userId;
  const JWT_SECRET = process.env.JWT_SECRET || 'testsecret'; // Coincide con .env.test

  beforeAll(async () => {
    // No creamos el usuario aquí para evitar conflictos con TRUNCATE
  });

  beforeEach(async () => {
    // Crear usuario fresco para cada test
    testEmail = `test_${Date.now()}@example.com`;
    const res = await pool.query(
      'INSERT INTO users (username, email, password, is_approved, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, is_approved',
      ['testuser', testEmail, await require('../../controllers/auth').__testHelpers.hashPassword(testPassword), false, 'basic']
    );
    userId = res.rows[0].id;
    console.log('Usuario creado:', { id: userId, email: testEmail, is_approved: res.rows[0].is_approved }); // Depuración
    expect(res.rows[0].is_approved).toBe(false); // Verifica estado inicial
  });

  afterEach(async () => {
    // Limpiar datos específicos de cada test
    await pool.query('DELETE FROM users_logs WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  });

  // No cerramos el pool aquí, se manejará en setupTest_DB.js
  // afterAll(async () => {});

  it('Registro manual', async () => {
    const res = await request(index)
      .post('/api/auth/register')
      .send({ username: 'testuser2', email: `new_${testEmail}`, password: testPassword });

    console.log('Respuesta de registro:', res.body); // Depuración
    expect(res.status).toBe(201);
    expect(res.body.requiresApproval).toBe(true);
    expect(res.body.message).toBe('Registro exitoso. Espera aprobación.');
  });

  it('Login con usuario no aprobado', async () => {
    const userCheck = await pool.query('SELECT is_approved FROM users WHERE email = $1', [testEmail]);
    console.log('Usuario antes de login:', userCheck.rows); // Depuración
    expect(userCheck.rows.length).toBe(1);
    expect(userCheck.rows[0].is_approved).toBe(false);

    const res = await request(index)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    console.log('Respuesta de login no aprobado:', res.body); // Depuración
    expect(res.status).toBe(403);
    expect(res.body.requiresApproval).toBe(true);
    expect(res.body.message).toBe('Cuenta pendiente de aprobación');

    const logs = await pool.query('SELECT event_type FROM users_logs WHERE user_id = $1', [userId]);
    console.log('Logs después de login no aprobado:', logs.rows); // Depuración
    expect(logs.rows.some(log => log.event_type === eventTypes.PENDING_APPROVAL_LOGIN)).toBe(true);
  });

  it('Reset password request', async () => {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [testEmail]);
    console.log('Usuario antes de reset:', userCheck.rows); // Depuración
    expect(userCheck.rows.length).toBe(1);

    const res = await request(index)
      .post('/api/auth/reset-password')
      .send({ email: testEmail });

    console.log('Respuesta de reset-password:', res.body); // Depuración
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Enlace enviado al correo');

    const logs = await pool.query('SELECT event_type FROM users_logs WHERE user_id = $1', [userId]);
    console.log('Logs después de reset:', logs.rows); // Depuración
    expect(logs.rows.some(log => log.event_type === eventTypes.PASSWORD_RESET_REQUEST)).toBe(true);
  });

  it('Establecer nueva contraseña', async () => {
    const tokenReset = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });

    const res = await request(index)
      .post('/api/auth/new-password')
      .send({ token: tokenReset, password: 'NewPass123!' });

    console.log('Respuesta de new-password:', res.body); // Depuración
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Contraseña actualizada');

    // Verifica que la contraseña se haya actualizado
    const userCheck = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    console.log('Contraseña después de reset:', userCheck.rows[0].password); // Depuración
    const isPasswordValid = await require('../../controllers/auth').__testHelpers.comparePassword('NewPass123!', userCheck.rows[0].password);
    expect(isPasswordValid).toBe(true);

    // Verifica que el log se haya creado
    const logs = await pool.query('SELECT event_type FROM users_logs WHERE user_id = $1', [userId]);
    console.log('Logs después de new-password:', logs.rows); // Depuración
    expect(logs.rows.some(log => log.event_type === eventTypes.PASSWORD_RESET_SUCCESS)).toBe(true);
  });

  it('Login aprobado después de cambiar contraseña', async () => {
    // Asegurar que la contraseña se actualizó primero
    const tokenReset = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
    await request(index)
      .post('/api/auth/new-password')
      .send({ token: tokenReset, password: 'NewPass123!' });

    // Verificar la contraseña antes del login
    const userCheckBefore = await pool.query('SELECT password, is_approved FROM users WHERE id = $1', [userId]);
    console.log('Usuario antes de login aprobado:', userCheckBefore.rows); // Depuración
    expect(userCheckBefore.rows.length).toBe(1);
    const isPasswordValid = await require('../../controllers/auth').__testHelpers.comparePassword('NewPass123!', userCheckBefore.rows[0].password);
    expect(isPasswordValid).toBe(true); // Confirma que la contraseña es correcta

    // Aprobar al usuario
    await pool.query('UPDATE users SET is_approved = true WHERE id = $1', [userId]);
    const userCheckAfter = await pool.query('SELECT is_approved FROM users WHERE id = $1', [userId]);
    console.log('Usuario después de aprobar:', userCheckAfter.rows); // Depuración
    expect(userCheckAfter.rows[0].is_approved).toBe(true);

    const res = await request(index)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'NewPass123!' });

    console.log('Respuesta de login aprobado:', res.body); // Depuración
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
    token = res.body.token;
    expect(token).toBeDefined();

    // Verifica que el log se haya creado
    const logs = await pool.query('SELECT event_type FROM users_logs WHERE user_id = $1', [userId]);
    console.log('Logs después de login aprobado:', logs.rows); // Depuración
    expect(logs.rows.some(log => log.event_type === eventTypes.LOGIN)).toBe(true);
  });

  it('Logout', async () => {
    // Asegurar que el usuario esté aprobado y haya iniciado sesión
    await pool.query('UPDATE users SET is_approved = true WHERE id = $1', [userId]);
    const loginRes = await request(index)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });
    token = loginRes.body.token;
    console.log('Token usado para logout:', token); // Depuración
    expect(token).toBeDefined();

    const res = await request(index)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .send();

    console.log('Respuesta de logout:', res.body); // Depuración
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Sesión cerrada');

    const logs = await pool.query('SELECT event_type FROM users_logs WHERE user_id = $1', [userId]);
    console.log('Logs después de logout:', logs.rows); // Depuración
    expect(logs.rows.some(log => log.event_type === eventTypes.LOGOUT)).toBe(true);
  });

  it('Verificar logs de usuario', async () => {
    // Ejecutar acciones para generar logs
    await request(index)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword }); // Genera PENDING_APPROVAL_LOGIN
    await request(index)
      .post('/api/auth/reset-password')
      .send({ email: testEmail }); // Genera PASSWORD_RESET_REQUEST
    const tokenReset = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
    await request(index)
      .post('/api/auth/new-password')
      .send({ token: tokenReset, password: 'NewPass123!' }); // Genera PASSWORD_RESET_SUCCESS
    await pool.query('UPDATE users SET is_approved = true WHERE id = $1', [userId]);
    const loginRes = await request(index)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'NewPass123!' }); // Genera LOGIN
    const logoutRes = await request(index)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .send(); // Genera LOGOUT

    const logsRes = await pool.query(
      'SELECT event_type FROM users_logs WHERE user_id = $1 ORDER BY created_at',
      [userId]
    );

    const logTypes = logsRes.rows.map(row => row.event_type);
    console.log('Logs verificados:', logTypes); // Depuración
    expect(logTypes).toContain(eventTypes.PENDING_APPROVAL_LOGIN);
    expect(logTypes).toContain(eventTypes.PASSWORD_RESET_REQUEST);
    expect(logTypes).toContain(eventTypes.PASSWORD_RESET_SUCCESS);
    expect(logTypes).toContain(eventTypes.LOGIN);
    expect(logTypes).toContain(eventTypes.LOGOUT);
  });
});

describe('Auth Flow Google + Usuarios desconocidos', () => {
  let googleClientMock;
  let newUserEmail;
  let existingUserEmail;
  let token;
  const JWT_SECRET = process.env.JWT_SECRET || 'testsecret'; // Coincide con .env.test

  beforeAll(async () => {
    googleClientMock = new OAuth2Client();
    newUserEmail = `google_new_${Date.now()}@example.com`;
    existingUserEmail = `google_existing_${Date.now()}@example.com`;
  });

  afterAll(async () => {
    // Limpieza específica para usuarios de Google
    await pool.query('DELETE FROM users_logs WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['google_%']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['google_%']);
    // No cerrar el pool aquí, se maneja en setupTest_DB.js
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Registro vía Google (usuario nuevo)', async () => {
    googleClientMock.verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({ email: newUserEmail, name: 'GoogleUserNew' }),
    });

    const res = await request(index)
      .post('/api/auth/google')
      .send({ token: 'fake-google-token' });

    console.log('Respuesta de registro Google:', res.body); // Depuración
    expect(res.status).toBe(403);
    expect(res.body.requiresApproval).toBe(true);

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [newUserEmail]);
    console.log('Usuario creado con Google:', userResult.rows); // Depuración
    expect(userResult.rows.length).toBe(1);
  });

  it('Login vía Google con token inválido', async () => {
    googleClientMock.verifyIdToken.mockRejectedValueOnce(new Error('Invalid token'));

    const res = await request(index)
      .post('/api/auth/google')
      .send({ token: 'invalid-google-token' });

    console.log('Respuesta de login Google inválido:', res.body); // Depuración
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token de Google inválido');
  });

  it('Login vía Google (usuario aprobado)', async () => {
    const insertRes = await pool.query(
      'INSERT INTO users (username, email, password, role, is_approved) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['GoogleUserExisting', existingUserEmail, '', 'basic', true]
    );
    const userId = insertRes.rows[0].id;

    googleClientMock.verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({ email: existingUserEmail, name: 'GoogleUserExisting' }),
    });

    const res = await request(index)
      .post('/api/auth/google')
      .send({ token: 'fake-google-token' });

    console.log('Respuesta de login Google aprobado:', res.body); // Depuración
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(existingUserEmail);
    token = res.body.token;
    expect(token).toBeDefined();

    const logs = await pool.query('SELECT event_type FROM users_logs WHERE user_id = $1', [userId]);
    const logTypes = logs.rows.map(r => r.event_type);
    console.log('Logs después de login Google:', logTypes); // Depuración
    expect(logTypes).toContain(eventTypes.LOGIN_GOOGLE);
  });

  it('Usuario desconocido intenta login normal', async () => {
    const unknownEmail = `unknown_${Date.now()}@example.com`;

    const res = await request(index)
      .post('/api/auth/login')
      .send({ email: unknownEmail, password: '1234' });

    console.log('Respuesta de login desconocido:', res.body);
    if (res.status === 500) {
      console.error('Error 500 en login desconocido, posible problema con la tabla users_logs:', res.body);
    }
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas');

    const logs = await pool.query('SELECT event_type FROM users_logs WHERE user_id IS NULL AND details->>\'email\' = $1', [unknownEmail]);
    const logTypes = logs.rows.map(r => r.event_type);
    console.log('Logs después de login desconocido:', logTypes);
    expect(logTypes).toContain(eventTypes.SUSPICIOUS_LOGIN);
  });
});