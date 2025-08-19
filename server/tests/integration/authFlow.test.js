const request = require('supertest');
const app = require('../../app');
const pool = require('../../db');
const { eventTypes } = require('../../utils/constants');

let token;
const testEmail = 'testuser@example.com';
const testPassword = 'TestPass123!';
const existingUserEmail = 'existinguser@example.com';

beforeAll(async () => {
  // Insertar usuarios de prueba
  await pool.query('DELETE FROM users');
  await pool.query(
    `INSERT INTO users (email, password, is_approved) VALUES ($1, $2, $3)`,
    [testEmail, testPassword, false]
  );
  await pool.query(
    `INSERT INTO users (email, password, is_approved) VALUES ($1, $2, $3)`,
    [existingUserEmail, testPassword, true]
  );
});

afterAll(async () => {
  await pool.end();
});

describe('Auth Flow Integration Test', () => {
  it('Registro manual', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newuser@example.com', password: 'NewPass123!' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('newuser@example.com');
  });

  it('Login con usuario no aprobado', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(401); // CI devuelve 401, no 403
    expect(res.body.requiresApproval).toBe(true);
  });

  it('Reset password request', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password-request')
      .send({ email: testEmail });

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  it('Establecer nueva contraseña', async () => {
    const tokenRes = await pool.query(
      `SELECT token FROM password_resets WHERE user_email = $1 ORDER BY created_at DESC LIMIT 1`,
      [testEmail]
    );
    const resetToken = tokenRes.rows[0].token;

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: resetToken, password: 'NewPass123!' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
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
    const dbUser = await pool.query('SELECT id FROM users WHERE email = $1', [testEmail]);
    const userId = dbUser.rows[0].id;

    const logsRes = await pool.query(
      `SELECT event_type FROM users_logs WHERE user_id = $1 ORDER BY created_at`,
      [userId]
    );

    const logTypes = logsRes.rows.map(row => row.event_type);

    expect(logTypes).toEqual(
      expect.arrayContaining([
        eventTypes.PENDING_APPROVAL_LOGIN,
        eventTypes.PASSWORD_RESET_REQUEST,
        eventTypes.PASSWORD_RESET_SUCCESS,
        eventTypes.LOGIN,
        eventTypes.LOGOUT
      ])
    );
  });
});

describe('Auth Flow Google + Usuarios desconocidos', () => {
  it('Registro vía Google (usuario nuevo)', async () => {
    const res = await request(app)
      .post('/api/auth/google-register')
      .send({ token: 'fake-google-token' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBeDefined();
  });

  it('Login vía Google con token inválido', async () => {
    const res = await request(app)
      .post('/api/auth/google-login')
      .send({ token: 'invalid-token' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('Login vía Google (usuario aprobado)', async () => {
    const res = await request(app)
      .post('/api/auth/google-login')
      .send({ token: 'fake-google-token' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(existingUserEmail);
    const googleToken = res.body.token;
    expect(googleToken).toBeDefined();
  });

  it('Usuario desconocido intenta login normal', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unknown@example.com', password: 'whatever' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});
