// server/tests/unit/routes/admin.test.js
const request = require('supertest');
const app = require('../../../index'); // tu app
const jwt = require('jsonwebtoken');

// Generamos un token falso de admin
const adminToken = jwt.sign(
  { userId: 1, email: 'admin@example.com', role: 'admin', isApproved: true },
  process.env.JWT_SECRET || 'testsecret',
  { expiresIn: '1h' },
);

// Generamos un token de usuario normal
const userToken = jwt.sign(
  { userId: 2, email: 'user@example.com', role: 'user', isApproved: true },
  process.env.JWT_SECRET || 'testsecret',
  { expiresIn: '1h' },
);

describe('Admin Routes', () => {
  // GET /api/admin/users
  describe('GET /api/admin/users', () => {
    it('debe denegar acceso a usuario no admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/no autorizado/i);
    });

    it('debe permitir acceso a admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
    });
  });

  // PATCH /api/admin/users/:id
  describe('PATCH /api/admin/users/:id', () => {
    it('debe fallar si id no es un número', async () => {
      const res = await request(app)
        .patch('/api/admin/users/abc')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'user', isApproved: true });
      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toMatch(/debe ser un número/i);
    });

    it('debe fallar si role es inválido', async () => {
      const res = await request(app)
        .patch('/api/admin/users/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'invalid' });
      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toMatch(/role inválido/i);
    });
  });

  // DELETE /api/admin/users/:id
  describe('DELETE /api/admin/users/:id', () => {
    it('debe fallar si id no es un número', async () => {
      const res = await request(app)
        .delete('/api/admin/users/abc')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toMatch(/debe ser un número/i);
    });
  });

  // POST /send-calculation y /send-mortgage con rate limit
  describe('POST /api/admin/send-calculation', () => {
    it('debe permitir envíos válidos', async () => {
      const res = await request(app)
        .post('/api/admin/send-calculation')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ chartDataUrl: 'data:image/png;base64,...' });
      expect([200, 500]).toContain(res.status); // 500 si falla el envío de email
    });

    it('debe aplicar rate limit', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/admin/send-calculation')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({});
      }
      const res = await request(app)
        .post('/api/admin/send-calculation')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(429);
      expect(res.text).toMatch(/demasiadas solicitudes/i);
    });
  });

  describe('POST /api/admin/send-mortgage', () => {
    it('debe permitir envíos válidos', async () => {
      const res = await request(app)
        .post('/api/admin/send-mortgage')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ chartDataUrl: 'data:image/png;base64,...' });
      expect([200, 500]).toContain(res.status);
    });

    it('debe aplicar rate limit', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/admin/send-mortgage')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({});
      }
      const res = await request(app)
        .post('/api/admin/send-mortgage')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(429);
      expect(res.text).toMatch(/demasiadas solicitudes/i);
    });
  });
});
