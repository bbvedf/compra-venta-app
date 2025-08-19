// tests/integration/authFlow.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const index = require('../../index'); // tu app Express
const pool = require('../../db'); // tu pool de Postgres
const eventTypes = require('../../constants/eventTypes');

const testEmail = 'testuser@example.com';
const testPassword = 'Password123!';
let token;

beforeAll(async () => {
  await pool.query('DELETE FROM logs');
  await pool.query('DELETE FROM users');

  const hashedPassword = await bcrypt.hash(testPassword, 10);
  await pool.query(
    'INSERT INTO users (email, password, status) VALUES ($1, $2, $3)',
    [testEmail, hashedPassword, 'pending']
  );
});

afterAll(async () => {
  await pool.query('DELETE FROM logs');
  await pool.query('DELETE FROM users');
  await pool.end();
});

describe('Auth Flow Integration Test', () => {

  it('Login con usuario no aprobado', async () => {
    const res = await request(index)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(403);
    expect(res.body.requiresApproval).toBe(true);

    await pool.query(
      'INSERT INTO logs (user_id, event_type) SELECT id, $1 FROM users WHERE email=$2',
      [eventTypes.PENDING_APPROVAL_LOGIN, testEmail]
    );
  });

  it('Reset password request', async () => {
    const res = await request(index)
      .post('/api/auth/password-reset')
      .send({ email: testEmail });

    expect(res.status).toBe(200);

    const userResult = await pool.query('SELECT id FROM users WHERE email=$1', [testEmail]);
    await pool.query(
      'INSERT INTO logs (user_id, event_type) VALUES ($1, $2)',
      [userResult.rows[0].id, eventTypes.PASSWORD_RESET_REQUEST]
    );
  });

  it('Establecer nueva contraseña', async () => {
    const dbUser = await pool.query('SELECT id FROM users WHERE email=$1', [testEmail]);
    const userId = dbUser.rows[0].id;

    const tokenReset = jwt.sign({ userId }, process.env.JWT_SECRET || 'mi_secreto', { expiresIn: '15m' });
    const newPassword = 'NewPass123!';

    const res = await request(index)
      .post('/api/auth/password-reset/confirm')
      .send({ token: tokenReset, password: newPassword });

    expect(res.status).toBe(200);

    await pool.query(
      'INSERT INTO logs (user_id, event_type) VALUES ($1, $2)',
      [userId, eventTypes.PASSWORD_RESET_SUCCESS]
    );
  });

  it('Login aprobado después de cambiar contraseña', async () => {
    await pool.query('UPDATE users SET status=$1 WHERE email=$2', ['approved', testEmail]);

    const res = await request(index)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'NewPass123!' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
    token = res.body.token;
    expect(token).toBeDefined();

    const dbUser = await pool.query('SELECT id FROM users WHERE email=$1', [testEmail]);
    await pool.query(
      'INSERT INTO logs (user_id, event_type) VALUES ($1, $2)',
      [dbUser.rows[0].id, eventTypes.LOGIN]
    );
  });

  it('Logout', async () => {
    const dbUser = await pool.query('SELECT id FROM users WHERE email=$1', [testEmail]);
    const userId = dbUser.rows[0].id;

    const res = await request(index)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Sesión cerrada');

    await pool.query(
      'INSERT INTO logs (user_id, event_type) VALUES ($1, $2)',
      [userId, eventTypes.LOGOUT]
    );
  });

  it('Verificar logs de usuario', async () => {
    const logsRes = await pool.query(
      'SELECT event_type FROM logs WHERE user_id = (SELECT id FROM users WHERE email=$1)',
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
  const googleEmail = 'googleuser@example.com';
  const fakeToken = 'invalid.token';

  beforeAll(async () => {
    await pool.query('DELETE FROM users WHERE email=$1', [googleEmail]);
  });

  it('Registro vía Google (usuario nuevo)', async () => {
    const res = await request(index)
      .post('/api/auth/google')
      .send({ tokenId: 'mocked_valid_token', email: googleEmail });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(googleEmail);

    const dbUser = await pool.query('SELECT id FROM users WHERE email=$1', [googleEmail]);
    await pool.query(
      'INSERT INTO logs (user_id, event_type) VALUES ($1, $2)',
      [dbUser.rows[0].id, eventTypes.LOGIN]
    );
  });

  it('Login vía Google con token inválido', async () => {
    const res = await request(index)
      .post('/api/auth/google')
      .send({ tokenId: fakeToken, email: googleEmail });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido');
  });

  it('Login vía Google (usuario aprobado)', async () => {
    const res = await request(index)
      .post('/api/auth/google')
      .send({ tokenId: 'mocked_valid_token', email: googleEmail });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(googleEmail);
  });

  it('Usuario desconocido intenta login normal', async () => {
    const res = await request(index)
      .post('/api/auth/login')
      .send({ email: 'desconocido@example.com', password: 'NoPass123!' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Usuario no encontrado');
  });
});
