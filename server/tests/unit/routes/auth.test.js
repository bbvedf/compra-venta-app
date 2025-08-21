// tests/unit/routes/auth.test.js
const request = require('supertest');
const app = require('../../../index');

describe('Auth routes validation', () => {
  describe('POST /api/auth/register', () => {
    it('rechaza un email inválido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'no-email', password: '123456' });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe('Email no válido');
    });

    it('rechaza password menor a 6 caracteres', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe('La contraseña debe tener al menos 6 caracteres');
    });

    it('acepta datos válidos', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: '123456' });

      // Como no queremos tocar la base de datos real, podemos mockear el controller
      // Pero al menos comprobamos que pasa la validación:
      expect(res.statusCode).not.toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('rechaza un email inválido', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email', password: '123456' });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe('Email no válido');
    });

    it('rechaza password vacío', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe('Contraseña requerida');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('rechaza un email inválido', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({ email: 'bad-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe('Email no válido');
    });
  });

  describe('POST /api/auth/new-password', () => {
    it('rechaza token faltante', async () => {
      const res = await request(app).post('/api/auth/new-password').send({ password: '123456' });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe('Token requerido');
    });

    it('rechaza password corto', async () => {
      const res = await request(app)
        .post('/api/auth/new-password')
        .send({ token: 'abc', password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toBe('La contraseña debe tener al menos 6 caracteres');
    });
  });
});
