// tests/authFlow.test.js

const request = require('supertest');
const app = require('../../index');
const pool = require('../../db');
const jwt = require('jsonwebtoken');
const eventTypes = require('../../constants/eventTypes');
const { OAuth2Client } = require('google-auth-library');

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock('google-auth-library'); // asegura que use el mock de __mocks__

describe('Auth Flow Integration Test', () => {
  let testEmail;
  let testPassword = 'Test123!';
  let token;

  beforeAll(() => {
    testEmail = `test_${Date.now()}@example.com`;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users_logs WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [testEmail]);
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    await pool.end();
    await new Promise(r => setImmediate(r)); // limpia handles pendientes
  });

  beforeEach(() => {
    jest.clearAllMocks(); // limpia mocks para cada test
  });

  it('Registro manual', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body.requiresApproval).toBe(true);
  });

  it('Login con usuario no aprobado', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(403);
    expect(res.body.requiresApproval).toBe(true);
  });

  it('Reset password request', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: testEmail });

    expect(res.status).toBe(200);
  });

  it('Establecer nueva contraseña', async () => {
    const dbUser = await pool.query('SELECT id FROM users WHERE email = $1', [testEmail]);
    const userId = dbUser.rows[0].id;
    const tokenReset = jwt.sign({ userId }, process.env.JWT_SECRET || 'mi_secreto', { expiresIn: '15m' });

    const res = await request(app)
      .post('/api/auth/new-password')
      .send({ token: tokenReset, password: 'NewPass123!' });

    expect(res.status).toBe(200);
  });

  it('Login aprobado después de cambiar contraseña', async () => {
    await pool.query('UPDATE users SET is_approved = true WHERE email = $1', [testEmail]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'NewPass123!' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
    token = res.body.token;
    expect(token).toBeDefined();
  });

  it('Logout', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Sesión cerrada');
  });

  it('Verificar logs de usuario', async () => {
    const logsRes = await pool.query(
      `SELECT event_type FROM users_logs WHERE user_id = (SELECT id FROM users WHERE email = $1) ORDER BY created_at`,
      [testEmail]
    );

    const logTypes = logsRes.rows.map(row => row.event_type);
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

  beforeAll(() => {
    googleClientMock = new OAuth2Client();
    newUserEmail = `google_new_${Date.now()}@example.com`;
    existingUserEmail = `google_existing_${Date.now()}@example.com`;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users_logs WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['google_%']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['google_%']);
    await pool.end();
    await new Promise(r => setImmediate(r)); // limpia handles pendientes
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Registro vía Google (usuario nuevo)', async () => {
    googleClientMock.verifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({ email: newUserEmail, name: 'GoogleUserNew' }),
    });

    const res = await request(app)
      .post('/api/auth/google')
      .send({ token: 'fake-google-token' });

    expect(res.status).toBe(403);
    expect(res.body.requiresApproval).toBe(true);

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [newUserEmail]);
    expect(userResult.rows.length).toBe(1);
  });

  it('Login vía Google con token inválido', async () => {
    // Simulamos que Google rechaza el token
    googleClientMock.verifyIdToken.mockRejectedValueOnce(new Error('Invalid token'));

    const res = await request(app)
      .post('/api/auth/google')
      .send({ token: 'invalid-google-token' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined(); // tu API debería devolver algo como { error: 'Token inválido' }

    // Comprobamos que no se ha creado ningún usuario nuevo
    const userResult = await pool.query('SELECT * FROM users WHERE email LIKE $1', ['%invalid-google-token%']);
    expect(userResult.rows.length).toBe(0);
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

    const res = await request(app)
      .post('/api/auth/google')
      .send({ token: 'fake-google-token' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(existingUserEmail);
    token = res.body.token;
    expect(token).toBeDefined();

    const logs = await pool.query('SELECT event_type FROM users_logs WHERE user_id = $1', [userId]);
    const logTypes = logs.rows.map(r => r.event_type);
    expect(logTypes).toContain(eventTypes.LOGIN_GOOGLE);
  });

  it('Usuario desconocido intenta login normal', async () => {
    const unknownEmail = `unknown_${Date.now()}@example.com`;

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: unknownEmail, password: '1234' });

    expect(res.status).toBe(401);

    const logs = await pool.query('SELECT event_type FROM users_logs WHERE user_id IS NULL AND details->>\'email\' = $1', [unknownEmail]);
    const logTypes = logs.rows.map(r => r.event_type);
    expect(logTypes).toContain(eventTypes.SUSPICIOUS_LOGIN);
  });
});
